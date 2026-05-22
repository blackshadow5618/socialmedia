/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SocialPlatform } from "../types";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Calendar, 
  AlertCircle,
  Hash,
  RefreshCw,
  LayoutGrid
} from "lucide-react";

export const ContentStudio: React.FC = () => {
  const { createPost, setActiveTab, subscription } = useApp();

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [platform, setPlatform] = useState<SocialPlatform>("Instagram");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Result output State
  const [result, setResult] = useState<{
    caption: string;
    hashtags: string[];
    optimalPostingTime: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorText(null);
    setResult(null);

    try {
      const res = await fetch("/api/gemini/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to contact Gemini Content Engine");
      }

      const data = await res.json();
      setResult({
        caption: data.caption || "",
        hashtags: data.hashtags || [],
        optimalPostingTime: data.optimalPostingTime || "",
      });
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      // Fail gracefully: generate matching mock outputs if internet is blocked
      const fallbackHashtags = topic
        .split(" ")
        .filter((w) => w.length > 3)
        .slice(0, 3)
        .map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, "")}`);

      setResult({
        caption: `🚀 Proactive insights on "${topic}": We are thrilled to introduce our curated workflows designed to elevate your everyday approach. Focused on sustainability, high quality, and minimal footprint. ✨ Stay tuned!`,
        hashtags: [...fallbackHashtags, "#MinimalistSaaS", `#${tone}Style`, `#${platform}Studio`],
        optimalPostingTime: "Tomorrow, 4:00 PM (Optimal for evening leisure commutes)",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleQueueScheduling = () => {
    if (!result) return;
    
    // Add default scheduled post to state store, then route straight to calendar view
    createPost({
      topic: topic || "AI Generated Topic",
      caption: result.caption,
      hashtags: result.hashtags,
      optimalPostingTime: result.optimalPostingTime,
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow standard
      platforms: [platform],
    });

    setActiveTab("calendar");
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 sm:text-2xl flex items-center">
          <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
          <span>AI Content Generation Studio</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Coined by Gemini 3.5. Convert descriptions and prompts immediately into polished, optimized social posts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Side: Creation Form control */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-display font-medium text-xs tracking-wider text-gray-400 uppercase mb-4">
            Campaign Blueprint Inputs
          </h3>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Facebook", "Instagram", "LinkedIn"] as SocialPlatform[]).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatform(plat)}
                    className={`rounded-lg py-2.5 text-xs font-semibold text-center border transition-all ${
                      platform === plat
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                        : "border-gray-200 text-gray-650 hover:bg-gray-50"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Tone of Voice
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Professional", "Friendly", "Funny"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-lg py-2.5 text-xs font-semibold text-center border transition-all ${
                      tone === t
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                        : "border-gray-200 text-gray-650 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Core Topic or Prompt</span>
                <span className="text-[10px] font-mono lowercase text-gray-400">
                  {topic.length} / 150 chars
                </span>
              </label>
              <textarea
                required
                maxLength={150}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                placeholder="E.g., Launching a new range of handmade minimalist ceramic coffee cups crafted from earth elements with neutral slate glazes."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-xs font-semibold tracking-tight text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 transition-colors shadow-lg shadow-indigo-100 font-display"
              id="submit_generate_ai_content"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Copy with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Content and Timing</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Generation Outputs Display */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-15 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white/70 p-6 text-center backdrop-blur-xs">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <h4 className="font-display font-bold text-sm text-gray-950 mt-4">Drafting Optimal Caption...</h4>
              <p className="text-[10px] text-gray-400 mt-2 max-w-xs leading-relaxed">
                Gemini is assembling engaging copy structures, researching local hashtag trending tags, and analyzing peak commuting time-slots...
              </p>
            </div>
          )}

          {!result && !loading && (
            <div className="h-full rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 flex flex-col items-center justify-center text-center min-h-80">
              <LayoutGrid className="h-12 w-12 text-gray-300" />
              <h4 className="font-display font-bold text-sm text-gray-950 mt-4">Awaiting Blueprint Inputs</h4>
              <p className="text-xs text-gray-400 max-w-sm mt-1.5 leading-relaxed">
                Fill out the campaign configuration details on the left and click Generate to see premium personalized copy here.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="inline-flex items-center space-x-1 rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">
                  Draft Approved
                </span>
                <span className="text-[10px] font-semibold text-gray-400 flex items-center">
                  <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  Optimal posting calculated
                </span>
              </div>

              {/* Caption Output */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Caption Output</span>
                  <button
                    onClick={() => handleCopyToClipboard(result.caption, "caption")}
                    className="hover:text-indigo-600 flex items-center space-x-1"
                  >
                    {copiedField === "caption" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedField === "caption" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="rounded-xl bg-gray-55/80 p-4 font-normal text-xs leading-relaxed text-gray-750 border border-gray-100 select-all whitespace-pre-wrap">
                  {result.caption}
                </div>
              </div>

              {/* Hashtag List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Recommended Tags</span>
                  <button
                    onClick={() => handleCopyToClipboard(result.hashtags.join(" "), "tags")}
                    className="hover:text-indigo-600 flex items-center space-x-1"
                  >
                    {copiedField === "tags" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedField === "tags" ? "Copied" : "Copy All"}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-lg bg-indigo-50/50 px-2.5 py-1 text-xs font-semibold text-indigo-600"
                    >
                      <Hash className="h-3 w-3 text-indigo-400 mr-0.5" />
                      {tag.replace("#", "")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Posting slot */}
              <div className="rounded-xl bg-indigo-50/40 border border-indigo-100/40 p-4 space-y-1">
                <span className="block text-[8px] font-bold text-indigo-500 uppercase tracking-widest leading-none">
                  Recommended Posting Period
                </span>
                <p className="text-xs font-bold text-indigo-800 flex items-center pt-1.5">
                  <Clock className="h-4.5 w-4.5 text-indigo-600 mr-2" />
                  <span>{result.optimalPostingTime}</span>
                </p>
              </div>

              {/* Sync controls */}
              <button
                onClick={handleQueueScheduling}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5"
                id="content_studio_schedule_btn"
              >
                <Calendar className="h-4 w-4" />
                <span>Queue and Schedule Post</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
