/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SocialAccount,
  SocialPlatform,
  PlanTier,
  BillingInterval,
  SubscriptionState,
  ScheduledPost,
  InboxMessage,
  MetricCard,
  FollowerTrendPoint,
  PostPerformancePoint,
} from "../types";

// Seed Initial Data
const INITIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: "fb_1",
    platform: "Facebook",
    name: "Aesthetic Living Page",
    profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    connectedAt: "2026-03-10T12:00:00Z",
    tokenStatus: "active",
  },
  {
    id: "ig_1",
    platform: "Instagram",
    name: "@aesthetic_living_co",
    profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    connectedAt: "2026-04-15T14:30:00Z",
    tokenStatus: "active",
  },
];

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: "post_1",
    topic: "Summer Launch Promo",
    caption: "The heat is on, and so are the savings! ☀️ Experience our curated minimalist collection that keeps you cool and elegant all summer long. Order now using promo 'SUMMERSTYLE' for 20% off plus free shipping.",
    hashtags: ["#MinimalistLiving", "#SummerVibe", "#AestheticLaunch", "#SustainableStyle"],
    optimalPostingTime: "Friday, 3:00 PM (Commute Engagement Hour)",
    scheduledTime: "2026-05-23T15:00:00Z", // May 23 (Saturday)
    platforms: ["Facebook", "Instagram"],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    status: "scheduled",
  },
  {
    id: "post_2",
    topic: "Design Philosophy Insights",
    caption: "Simplicity is the ultimate sophistication. Behind every product in our line is a commitment to removing the unnecessary, so that the beautiful can truly shine. ✨ What does minimalism mean to you?",
    hashtags: ["#Minimalism", "#DesignInspiration", "#Aesthetics", "#SimpleThings"],
    optimalPostingTime: "Monday, 9:00 AM (B2B Workspace Hour)",
    scheduledTime: "2026-05-25T09:00:00Z", // May 25
    platforms: ["LinkedIn"],
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    status: "scheduled",
  },
  {
    id: "post_3",
    topic: "Sustainable Crafting Journey",
    caption: "Crafted by hand, designed for generation. Transparency is at the core of our sustainability promise. Here's a raw behind-the-scenes breakdown of where every thread came from. 🌱 Shop with complete peace of mind.",
    hashtags: ["#EcoFriendly", "#HandCrafted", "#SustainableLiving", "#Transparency"],
    optimalPostingTime: "Wednesday, 6:00 PM (High Leisure Activity)",
    scheduledTime: "2026-05-20T18:00:00Z", // May 20 (Past)
    platforms: ["Instagram", "Facebook"],
    status: "published",
  },
];

const INITIAL_INBOX: InboxMessage[] = [
  {
    id: "msg_1",
    platform: "Instagram",
    senderName: "Clarissa Finch",
    senderAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    content: "Absolutely obsessed with the sustainable crafting journey post! Do you ship to Australia? Pricing details please!",
    timestamp: "2026-05-22T17:15:00Z",
    unread: true,
    type: "comment",
    status: "pending",
  },
  {
    id: "msg_2",
    platform: "Facebook",
    senderName: "Marcus Sterling",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    content: "Our organization is hosting a design forum next month. Would love to run a bulk custom orders set of your curated books. Who is the best to contact?",
    timestamp: "2026-05-22T15:40:00Z",
    unread: true,
    type: "dm",
    status: "pending",
  },
  {
    id: "msg_3",
    platform: "LinkedIn",
    senderName: "Dr. Elena Rostova",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    content: "Your post on design philosophy highlights values that completely resonate with modern research. Bravo on keeping the design community pure and focused.",
    timestamp: "2026-05-21T09:12:00Z",
    unread: false,
    type: "comment",
    status: "pending",
  },
];

const METRIC_DATA = {
  Free: {
    totalReach: { value: "14,240", change: "+4.2%", isPositive: true },
    engagementRate: { value: "3.24%", change: "-0.8%", isPositive: false },
    followerGrowth: { value: "+154", change: "+12.1%", isPositive: true },
  },
  Pro: {
    totalReach: { value: "98,420", change: "+24.5%", isPositive: true },
    engagementRate: { value: "5.82%", change: "+1.2%", isPositive: true },
    followerGrowth: { value: "+1,420", change: "+42.7%", isPositive: true },
  },
  Enterprise: {
    totalReach: { value: "482,900", change: "+84.1%", isPositive: true },
    engagementRate: { value: "8.14%", change: "+3.6%", isPositive: true },
    followerGrowth: { value: "+5,800", change: "+128.9%", isPositive: true },
  },
};

const INITIAL_TRENDS: FollowerTrendPoint[] = [
  { date: "May 16", followers: 4200 },
  { date: "May 17", followers: 4280 },
  { date: "May 18", followers: 4350 },
  { date: "May 19", followers: 4410 },
  { date: "May 20", followers: 4460 },
  { date: "May 21", followers: 4540 },
  { date: "May 22", followers: 4610 },
];

const INITIAL_PERFORMANCE: PostPerformancePoint[] = [
  { id: "p1", title: "Sustainable Journey Post", platform: "Instagram", engagementNum: 840, reachNum: 4500 },
  { id: "p2", title: "Summer Launch Promo", platform: "Facebook", engagementNum: 620, reachNum: 3800 },
  { id: "p3", title: "Minimalist Philosophy", platform: "LinkedIn", engagementNum: 410, reachNum: 2300 },
  { id: "p4", title: "Cozy Living Setups", platform: "Instagram", engagementNum: 950, reachNum: 5200 },
];

interface AppContextType {
  subscription: SubscriptionState;
  accounts: SocialAccount[];
  posts: ScheduledPost[];
  inbox: InboxMessage[];
  currentMode: "landing" | "dashboard";
  activeTab: "settings" | "studio" | "calendar" | "inbox" | "analytics";
  metrics: Record<string, MetricCard>;
  followerTrends: FollowerTrendPoint[];
  performance: PostPerformancePoint[];
  checkoutModalOpen: boolean;
  checkoutTier: PlanTier | null;
  checkoutInterval: BillingInterval;
  
  // Actions
  setMode: (mode: "landing" | "dashboard") => void;
  setActiveTab: (tab: "settings" | "studio" | "calendar" | "inbox" | "analytics") => void;
  connectAccount: (platform: SocialPlatform, name: string) => void;
  disconnectAccount: (id: string) => void;
  createPost: (post: Omit<ScheduledPost, "id" | "status">) => void;
  editPost: (post: ScheduledPost) => void;
  deletePost: (id: string) => void;
  updateSubscription: (tier: PlanTier, interval: BillingInterval) => void;
  openCheckout: (tier: PlanTier, interval: BillingInterval) => void;
  closeCheckout: () => void;
  generateAISmartReply: (msgId: string) => Promise<void>;
  approveSmartReply: (msgId: string, finalReplyText: string) => void;
  setInboxMessageRead: (msgId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Loading
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const saved = localStorage.getItem("social_hub_subscription");
    return saved
      ? JSON.parse(saved)
      : { tier: "Free", interval: "monthly", isActive: true, expiresAt: "2026-06-22T00:00:00Z" };
  });

  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    const saved = localStorage.getItem("social_hub_accounts");
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // Sync accounts from real Firestore database on load
  const refreshAccountsFromDb = async () => {
    try {
      const res = await fetch("/api/users/default_user/channels");
      if (res.ok) {
        const data = await res.json();
        if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccounts(data.accounts);
          localStorage.setItem("social_hub_accounts", JSON.stringify(data.accounts));
        }
      }
    } catch (err) {
      console.warn("[AppContext] Could not sync accounts from Firestore on load.", err);
    }
  };

  useEffect(() => {
    refreshAccountsFromDb();
  }, []);

  const [posts, setPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem("social_hub_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [inbox, setInbox] = useState<InboxMessage[]>(() => {
    const saved = localStorage.getItem("social_hub_inbox");
    return saved ? JSON.parse(saved) : INITIAL_INBOX;
  });

  // UI Navigation States
  const [currentMode, setMode] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTabState] = useState<"settings" | "studio" | "calendar" | "inbox" | "analytics">("studio");

  // Checkout Simulator States
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<PlanTier | null>(null);
  const [checkoutInterval, setCheckoutInterval] = useState<BillingInterval>("monthly");

  // Save states on change in localStorage
  useEffect(() => {
    localStorage.setItem("social_hub_subscription", JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem("social_hub_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("social_hub_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("social_hub_inbox", JSON.stringify(inbox));
  }, [inbox]);

  // Handle Tab limits & redirects
  const setActiveTab = (tab: typeof activeTab) => {
    setActiveTabState(tab);
  };

  // 1. Marketing Landing Page & Subscription Actions
  const updateSubscription = (tier: PlanTier, interval: BillingInterval) => {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + (interval === "annual" ? 12 : 1));
    setSubscription({
      tier,
      interval,
      isActive: true,
      expiresAt: expires.toISOString(),
    });
  };

  const openCheckout = (tier: PlanTier, interval: BillingInterval) => {
    setCheckoutTier(tier);
    setCheckoutInterval(interval);
    setCheckoutModalOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutModalOpen(false);
    setCheckoutTier(null);
  };

  // 2. Connected Accounts Hub
  const connectAccount = (platform: SocialPlatform, name: string) => {
    const randomImg = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    ][Math.floor(Math.random() * 3)];

    const newAccount: SocialAccount = {
      id: `${platform.toLowerCase()}_${Date.now()}`,
      platform,
      name,
      profilePic: randomImg,
      connectedAt: new Date().toISOString(),
      tokenStatus: "active",
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const disconnectAccount = async (id: string) => {
    const target = accounts.find((acc) => acc.id === id);
    if (target) {
      try {
        await fetch(`/api/users/default_user/channels/${target.platform.toLowerCase()}`, {
          method: "DELETE",
        });
        console.log(`[AppContext] Cleared target subscription matching ${target.platform} from database.`);
      } catch (err) {
        console.warn("[AppContext Warning] Failed to delete matching channel on server:", err);
      }
    }
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  // 4. Smart Calendar & Interactive Queue Actions
  const createPost = (newPostData: Omit<ScheduledPost, "id" | "status">) => {
    const newPost: ScheduledPost = {
      ...newPostData,
      id: `post_${Date.now()}`,
      status: "scheduled",
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const editPost = (updatedPost: ScheduledPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  // 5. AI Smart Reply Operations
  const setInboxMessageRead = (msgId: string) => {
    setInbox((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, unread: false } : msg))
    );
  };

  const generateAISmartReply = async (msgId: string) => {
    const targetMsg = inbox.find((msg) => msg.id === msgId);
    if (!targetMsg) return;

    try {
      // Set temporary state indicator
      setInbox((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, suggestedReply: "Generating smart draft..." } : msg
        )
      );

      // Call our secure backend endpoint
      const res = await fetch("/api/gemini/smart-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageContext: targetMsg.content,
          messageSender: targetMsg.senderName,
          platform: targetMsg.platform,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to contact Smart Reply Engine");
      }

      const data = await res.json();
      const replyText = data.suggestedReply || "Hi there! Thank you for the wonderful feedback. Let me connect you directly to our sales agent shortly.";

      setInbox((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, suggestedReply: replyText, unread: false } : msg
        )
      );
    } catch (err: any) {
      console.error("Smart Reply generation error:", err);
      // Fail gracefully with a default backup generated reply
      const backupText = `Hi ${targetMsg.senderName}! Thanks for reaching out. We appreciate your inquiry and our support team will get back to you with shipping details shortly!`;
      setInbox((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, suggestedReply: backupText, unread: false } : msg
        )
      );
    }
  };

  const approveSmartReply = (msgId: string, finalReplyText: string) => {
    setInbox((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              userReply: finalReplyText,
              status: "replied",
              suggestedReply: undefined,
            }
          : msg
      )
    );
  };

  // 6. Metrics and trends calculation
  const currentTierMetrics = METRIC_DATA[subscription.tier] || METRIC_DATA.Free;

  const metrics: Record<string, MetricCard> = {
    totalReach: {
      title: "Total Reach",
      value: currentTierMetrics.totalReach.value,
      change: currentTierMetrics.totalReach.change,
      isPositive: currentTierMetrics.totalReach.isPositive,
      description: "Organic traffic impressions over last 30 days",
    },
    engagementRate: {
      title: "Avg. Engagement",
      value: currentTierMetrics.engagementRate.value,
      change: currentTierMetrics.engagementRate.change,
      isPositive: currentTierMetrics.engagementRate.isPositive,
      description: "Proportion of active users taking response action",
    },
    followerGrowth: {
      title: "Follower Growth",
      value: currentTierMetrics.followerGrowth.value,
      change: currentTierMetrics.followerGrowth.change,
      isPositive: currentTierMetrics.followerGrowth.isPositive,
      description: "Net active audience changes across outlets",
    },
  };

  // Adjust follower trends dynamically according to account sizes
  const followerTrends = INITIAL_TRENDS.map((pt, idx) => {
    const scale = subscription.tier === "Pro" ? 7 : subscription.tier === "Enterprise" ? 35 : 1;
    return {
      ...pt,
      followers: pt.followers * scale + idx * (subscription.tier === "Enterprise" ? 150 : 20),
    };
  });

  const performance = INITIAL_PERFORMANCE.map((p) => {
    const multiplier = subscription.tier === "Pro" ? 5 : subscription.tier === "Enterprise" ? 12 : 1;
    return {
      ...p,
      reachNum: p.reachNum * multiplier,
      engagementNum: p.engagementNum * multiplier,
    };
  });

  return (
    <AppContext.Provider
      value={{
        subscription,
        accounts,
        posts,
        inbox,
        currentMode,
        activeTab,
        metrics,
        followerTrends,
        performance,
        checkoutModalOpen,
        checkoutTier,
        checkoutInterval,
        setMode,
        setActiveTab,
        connectAccount,
        disconnectAccount,
        createPost,
        editPost,
        deletePost,
        updateSubscription,
        openCheckout,
        closeCheckout,
        generateAISmartReply,
        approveSmartReply,
        setInboxMessageRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
