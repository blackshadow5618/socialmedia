/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import axios from "axios";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import session from "express-session";
import { Firestore } from "@google-cloud/firestore";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const PORT = 3000;

// Initialize Google Cloud Firestore connection
console.log("[Firestore Initialization Debug] Environment:", {
  FIRESTORE_PROJECT_ID: process.env.FIRESTORE_PROJECT_ID,
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GCLOUD_PROJECT: process.env.GCLOUD_PROJECT
});

const firestoreProject = process.env.FIRESTORE_PROJECT_ID || 
                         process.env.GOOGLE_CLOUD_PROJECT || 
                         process.env.GCLOUD_PROJECT || 
                         undefined;

console.log("[Firestore Initialization Debug] Target project ID set to:", firestoreProject);

const db = new Firestore(
  firestoreProject ? { projectId: firestoreProject } : {}
);

/**
 * Checks if a given error originates from an unprovisioned or permission-denied Firestore configuration.
 */
function isFirestoreSetupError(err: any): boolean {
  if (!err) return false;
  const errMsg = err.message || String(err);
  return (
    err.code === 7 ||
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("Permission denied") ||
    errMsg.includes("7 PERMISSION_DENIED")
  );
}

// Initialize Gemini SDK with named parameters & headers for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

/**
 * Exchange a short-lived Facebook access token for a long-lived page/user access token.
 * Meta Graph API reference for token exchange:
 * GET https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
 */
async function exchangeFacebookLongLivedToken(shortToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      console.warn("[OAuth] Facebook App ID or Secret missing, skipping long-lived token exchange.");
      return { accessToken: shortToken };
    }

    const response = await axios.get("https://graph.facebook.com/v20.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken,
      },
    });

    const { access_token, expires_in } = response.data;
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : undefined;
    
    console.log("[OAuth] Facebook short-lived token successfully exchanged for a long-lived token.");
    return { accessToken: access_token || shortToken, expiresAt };
  } catch (error: any) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("[OAuth] Facebook long-lived token exchange failed. Falling back to original. Details:", errorDetails);
    return { accessToken: shortToken };
  }
}

/**
 * Safely saves the exchanged long-lived social token into the user's Firestore document.
 */
async function saveSocialTokenToFirestore(
  userId: string,
  platform: "Facebook" | "LinkedIn",
  accountName: string,
  accessToken: string,
  expiresAt?: Date
) {
  try {
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.set({
      lastUpdated: new Date().toISOString(),
      tokens: {
        [platform.toLowerCase()]: {
          accessToken,
          accountName,
          connectedAt: new Date().toISOString(),
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          status: "active"
        }
      }
    }, { merge: true });
    console.log(`[Firestore] Successfully persistent-wrote long-lived ${platform} token for user ${userId}`);
  } catch (err: any) {
    if (isFirestoreSetupError(err)) {
      console.warn(`[Firestore Warning] Could not store ${platform} token because Firestore is unconfigured or lacks active permissions. To enable persistent accounts sync, please ensure Firebase is provisioned via the control panel.`);
    } else {
      console.error(`[Firestore] Failed storing ${platform} token in Firestore:`, err);
    }
  }
}

/**
 * Real automated publisher trigger via Axios.
 * Meta Graph API: https://graph.facebook.com/v20.0/{page-id}/feed
 * LinkedIn UGC API: https://api.linkedin.com/v2/ugcPosts
 */
async function publishPost(
  platform: string,
  content: string,
  targetId: string, // page-id for Facebook, urn/member-id for LinkedIn
  accessToken: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  console.log(`[Publisher] Routing API request for platform: ${platform} to dispatch content...`);
  try {
    if (platform.toLowerCase() === "facebook") {
      const url = `https://graph.facebook.com/v20.0/${targetId}/feed`;
      const response = await axios.post(url, {
        message: content,
        access_token: accessToken,
      });
      console.log("[Publisher] Meta Graph API dispatch successful:", response.data);
      return { success: true, postId: response.data.id || response.data.post_id };
    } else if (platform.toLowerCase() === "linkedin") {
      const url = "https://api.linkedin.com/v2/ugcPosts";
      
      const authorUrn = targetId.startsWith("urn:li:") ? targetId : `urn:li:person:${targetId}`;

      const payload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            "shareCommentary": {
              "text": content,
            },
            "shareMediaCategory": "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      });

      console.log("[Publisher] LinkedIn ugcPosts API dispatch successful:", response.data);
      return { success: true, postId: response.data.id };
    } else {
      throw new Error(`Platform ${platform} publishing is currently unsupported`);
    }
  } catch (err: any) {
    const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`[Publisher] Upstream service dispatch rejected for ${platform}:`, errorDetails);
    return { success: false, error: errorDetails };
  }
}

// Passport configuration for Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
        passReqToCallback: true,
      },
      async (req: any, accessToken, refreshToken, profile, done) => {
        try {
          const { accessToken: longLivedToken, expiresAt } = await exchangeFacebookLongLivedToken(accessToken);
          const userId = (req.user && (req.user as any).id) || "default_user";
          const accountName = req.session?.customName || profile.displayName || `Facebook User ${profile.id}`;

          await saveSocialTokenToFirestore(userId, "Facebook", accountName, longLivedToken, expiresAt);

          return done(null, { id: profile.id, displayName: accountName, accessToken: longLivedToken, platform: "Facebook" });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.log("[Passport] Facebook Strategy omitted (missing FACEBOOK_APP_ID/SECRET)");
}

// Passport configuration for LinkedIn OAuth v2
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/auth/linkedin/callback",
        scope: ["r_liteprofile", "r_emailaddress", "w_member_social", "w_organization_social"],
        passReqToCallback: true,
      },
      async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const userId = (req.user && (req.user as any).id) || "default_user";
          const accountName = req.session?.customName || profile.displayName || `LinkedIn User ${profile.id}`;

          // LinkedIn tokens are inherently long-lived (typically 60 days) after initial token exchange approval
          await saveSocialTokenToFirestore(userId, "LinkedIn", accountName, accessToken);

          return done(null, { id: profile.id, displayName: accountName, accessToken, platform: "LinkedIn" });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.log("[Passport] LinkedIn Strategy omitted (missing LINKEDIN_CLIENT_ID/SECRET)");
}

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

async function startServer() {
  const app = express();
  app.set("trust proxy", 1); // Trust reverse proxies like Cloud Run for secure cookies
  app.use(express.json());

  // Configure express-session for Passport token tracking states inside iframe environment
  app.use(
    session({
      secret: "social-hub-session-secret-security-handshake-555",
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: true, 
        sameSite: "none", 
        httpOnly: true 
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // API Route: Check API status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      aiAvailable: !!ai,
    });
  });

  // OAuth Redirect Routes
  app.get("/auth/facebook", (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID) {
      return res.status(400).send("Facebook OAuth is not configured on this project. Define FACEBOOK_APP_ID in settings secrets.");
    }
    // Store customName inside session to preserve it after redirect handshake
    if (req.query.customName && req.session) {
      (req.session as any).customName = req.query.customName as string;
    }
    passport.authenticate("facebook", { scope: ["pages_manage_posts", "pages_read_engagement", "instagram_basic"] })(req, res, next);
  });

  app.get("/auth/facebook/callback", (req, res, next) => {
    passport.authenticate("facebook", (err: any, user: any) => {
      if (err || !user) {
        console.error("[OAuth] Facebook Callback Error:", err || "No user found");
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: "${err?.message || 'Authentication rejected'}" }, '*');
                  window.close();
                } else {
                  window.location.href = '/dashboard?error=facebook_auth_failed';
                }
              </script>
              <p>Authentication failed. This window can now be closed.</p>
            </body>
          </html>
        `);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) console.error("[OAuth] Facebook login failed:", loginErr);
        const resolvedName = (req.session as any)?.customName || user.displayName || "Facebook Account";
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'OAUTH_AUTH_SUCCESS', 
                    platform: 'Facebook', 
                    name: ${JSON.stringify(resolvedName)}
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/dashboard?connected=facebook';
                }
              </script>
              <p>Authentication successful! Synchronizing feeds...</p>
            </body>
          </html>
        `);
      });
    })(req, res, next);
  });

  app.get("/auth/linkedin", (req, res, next) => {
    if (!process.env.LINKEDIN_CLIENT_ID) {
      return res.status(400).send("LinkedIn OAuth is not configured on this project. Define LINKEDIN_CLIENT_ID in settings secrets.");
    }
    // Store customName inside session to preserve after redirect handshake
    if (req.query.customName && req.session) {
      (req.session as any).customName = req.query.customName as string;
    }
    passport.authenticate("linkedin")(req, res, next);
  });

  app.get("/auth/linkedin/callback", (req, res, next) => {
    passport.authenticate("linkedin", (err: any, user: any) => {
      if (err || !user) {
        console.error("[OAuth] LinkedIn Callback Error:", err || "No user found");
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: "${err?.message || 'Authentication rejected'}" }, '*');
                  window.close();
                } else {
                  window.location.href = '/dashboard?error=linkedin_auth_failed';
                }
              </script>
              <p>Authentication failed. This window can now be closed.</p>
            </body>
          </html>
        `);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) console.error("[OAuth] LinkedIn login failed:", loginErr);
        const resolvedName = (req.session as any)?.customName || user.displayName || "LinkedIn Account";
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'OAUTH_AUTH_SUCCESS', 
                    platform: 'LinkedIn', 
                    name: ${JSON.stringify(resolvedName)}
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/dashboard?connected=linkedin';
                }
              </script>
              <p>Authentication successful! Synchronizing feeds...</p>
            </body>
          </html>
        `);
      });
    })(req, res, next);
  });

  // API Route: Get connected social accounts/channels from Firestore
  app.get("/api/users/:userId/channels", async (req, res) => {
    try {
      const { userId } = req.params;
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.json({ accounts: [] });
      }
      const data = userDoc.data();
      const tokens = data?.tokens || {};
      
      const accountsList = Object.keys(tokens).map((platformKey) => {
        const tokenData = tokens[platformKey];
        const platform = platformKey.charAt(0).toUpperCase() + platformKey.slice(1);
        
        return {
          id: `${platformKey}_${userId}`,
          platform: platform,
          name: tokenData.accountName || "Connected Account",
          profilePic: platformKey === "facebook" 
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          connectedAt: tokenData.connectedAt || new Date().toISOString(),
          tokenStatus: tokenData.status || "active"
        };
      });
      
      res.json({ accounts: accountsList });
    } catch (err: any) {
      if (isFirestoreSetupError(err)) {
        res.json({ accounts: [] });
      } else {
        console.error("[Get Channels API Error]:", err);
        res.status(500).json({ error: err.message || "Failed to load channels" });
      }
    }
  });

  // API Route: Disconnect/delete a social account/channel from Firestore
  app.delete("/api/users/:userId/channels/:platformKey", async (req, res) => {
    try {
      const { userId, platformKey } = req.params;
      const userDocRef = db.collection("users").doc(userId);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        const data = userDoc.data();
        const tokens = data?.tokens || {};
        delete tokens[platformKey.toLowerCase()];
        await userDocRef.set({ tokens }, { merge: true });
        console.log(`[Firestore] Successfully disconnected ${platformKey} channel for user: ${userId}`);
      }
      res.json({ success: true });
    } catch (err: any) {
      if (isFirestoreSetupError(err)) {
        res.json({ success: true });
      } else {
        console.error("[Disconnect Channel API Error]:", err);
        res.status(500).json({ error: err.message || "Failed to disconnect channel" });
      }
    }
  });

  // API Route: Real-time immediate publisher endpoint
  app.post("/api/posts/publish-now", async (req, res) => {
    try {
      const { platform, content, targetId, userId } = req.body;

      if (!platform || !content || !targetId) {
        return res.status(400).json({ error: "Missing required publishing parameters (platform, content, targetId)" });
      }

      let accessToken = req.body.accessToken;

      // Extract access token securely from user's document in Firestore if not explicitly passed
      if (!accessToken) {
        const fetchId = userId || "default_user";
        console.log(`[Publisher Service] AccessToken absent, locating stored token from Firestore for user: ${fetchId}`);
        try {
          const userDoc = await db.collection("users").doc(fetchId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            accessToken = userData?.tokens?.[platform.toLowerCase()]?.accessToken;
          }
        } catch (dbErr: any) {
          if (isFirestoreSetupError(dbErr)) {
            console.warn("[Publisher Service Warning] Firestore is unconfigured or unauthorized. Falling back to request parameter access token.");
          } else {
            throw dbErr;
          }
        }
      }

      if (!accessToken) {
        return res.status(401).json({ error: `Connection token not found for ${platform}. Please complete account OAuth link first.` });
      }

      const result = await publishPost(platform, content, targetId, accessToken);

      if (result.success) {
        res.json({ success: true, message: "Published successfully via external social API", externalPostId: result.postId });
      } else {
        res.status(502).json({ error: "External Upstream rejection during dispatch", details: result.error });
      }
    } catch (err: any) {
      console.error("[Publisher Route] Error:", err);
      res.status(500).json({ error: err.message || "Failed execution on social publish action" });
    }
  });

  // API Route: Social Post Content Generation
  app.post("/api/gemini/generate-content", async (req, res) => {
    try {
      if (!ai) {
        throw new Error("Gemini AI is not configured on this server because GEMINI_API_KEY is missing. Please check Settings > Secrets.");
      }

      const { topic, tone, platform } = req.body;
      if (!topic || !tone || !platform) {
        return res.status(400).json({ error: "Missing required fields: topic, tone, platform" });
      }

      const prompt = `Generate a high-engagement social media post for ${platform}.
Topic/Prompt: "${topic}"
Tone of Voice: ${tone}

Please output the content following the structural requirements:
- Create a highly compelling caption.
- Recommend high-traffic relevant hashtags (around 3 to 6).
- Give an optimal posting time justification (e.g., 'Today at 5:00 PM (Optimal for evening commutes) or Tomorrow at 9:00 AM').`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite Social Media Manager and AI Content Designer. Generate high-conversion responses formatted exactly as the requested JSON schema. Optimize captions with appropriate emojis and hooks.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caption: {
                type: Type.STRING,
                description: "The complete social media caption including hook, core copy, and call to action."
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of recommended hashtags, formatted standardly (e.g. #SocialHub)."
              },
              optimalPostingTime: {
                type: Type.STRING,
                description: "Optimal post scheduling slot with concise rationale (e.g., 'Thursday, 3:00 PM (B2B Peak Active Hour)')."
              }
            },
            required: ["caption", "hashtags", "optimalPostingTime"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Received empty response from Gemini API");
      }

      const parsedData = JSON.parse(text.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini Generate Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI content" });
    }
  });

  // API Route: Omnichannel Messaging AI Smart Reply
  app.post("/api/gemini/smart-reply", async (req, res) => {
    try {
      if (!ai) {
        throw new Error("Gemini AI is not configured on this server because GEMINI_API_KEY is missing. Please check Settings > Secrets.");
      }

      const { messageContext, messageSender, platform } = req.body;
      if (!messageContext) {
        return res.status(400).json({ error: "Missing messageContext in request body" });
      }

      const prompt = `Draft a localized, helpful, and highly contextual replies for:
Platform: ${platform || "Social Media"}
Sender Name: "${messageSender || "User"}"
Incoming Message: "${messageContext}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an omnichannel digital community strategist. Write matching response recommendations. Keep them human, direct, personalized, and under 150 characters. Maintain an empathetic brand rep voice.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedReply: {
                type: Type.STRING,
                description: "Core response draft recommendation."
              }
            },
            required: ["suggestedReply"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Received empty response from Gemini API");
      }

      const parsedData = JSON.parse(text.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini Smart Reply Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate Smart Reply" });
    }
  });

  // Vite Integration:
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Define periodic scheduler that runs every 60 seconds of matching time zones to publish posts
  setInterval(async () => {
    try {
      console.log("[Scheduler] Checking for scheduled due publications...");
      const now = new Date();
      const postsSnapshot = await db
        .collection("posts")
        .where("status", "==", "scheduled")
        .where("scheduledTime", "<=", now.toISOString())
        .get();

      if (postsSnapshot.empty) {
        return;
      }

      console.log(`[Scheduler] Initiating automatic publishing for ${postsSnapshot.size} due posts...`);

      for (const doc of postsSnapshot.docs) {
        const post = doc.data();
        const { caption, platforms, userId } = post;
        const defaultUser = userId || "default_user";

        // Fetch User Tokens from Database
        const userDoc = await db.collection("users").doc(defaultUser).get();
        if (!userDoc.exists) {
          console.warn(`[Scheduler] User document ${defaultUser} not established in database.`);
          continue;
        }

        const userData = userDoc.data();

        for (const platform of platforms) {
          const tokenData = userData?.tokens?.[platform.toLowerCase()];
          if (!tokenData || !tokenData.accessToken) {
            console.warn(`[Scheduler] Active connection token not available for user: ${defaultUser} under ${platform}`);
            continue;
          }

          // Fetch simulated or designated targetId
          const targetId = tokenData.pageId || tokenData.memberId || "default_channel_target";
          const res = await publishPost(platform, caption, targetId, tokenData.accessToken);

          if (res.success) {
            console.log(`[Scheduler] Micro-task completed on ${platform} for Post ${doc.id}`);
          } else {
            console.error(`[Scheduler] Automatic publishing failed on ${platform} for Post ${doc.id}`);
          }
        }

        // Mark local post status as successfully dispatched
        await doc.ref.update({
          status: "published",
          dispatchedAt: new Date().toISOString(),
        });
      }
    } catch (scheduleErr: any) {
      if (isFirestoreSetupError(scheduleErr)) {
        console.warn(
          "[Scheduler Warning] Firestore database is not yet provisioned, contains no matching project, or lacks active credentials/permissions. " +
          "To enable fully synchronized database persistence & schedule tracking, click the 'Set up Firebase' button in the control panel. " +
          "Scheduler is in standby waiting for database activation."
        );
      } else {
        console.error("[Scheduler] Error running poller execution:", scheduleErr);
      }
    }
  }, 60 * 1000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error("Fatal Server Startup Error:", err);
});
