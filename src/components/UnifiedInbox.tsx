/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { InboxMessage, SocialPlatform } from "../types";
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Check, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Filter, 
  CheckCheck,
  User,
  ShieldAlert,
  Edit2,
  RefreshCw,
  CornerDownRight
} from "lucide-react";

export const UnifiedInbox: React.FC = () => {
  const { inbox, generateAISmartReply, approveSmartReply, setInboxMessageRead } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "comment" | "dm">("all");
  const [activePlatformFilter, setActivePlatformFilter] = useState<"all" | SocialPlatform>("all");
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(inbox[0] || null);
  
  // Custom manual edit states
  const [customReplyText, setCustomReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const filteredInbox = inbox.filter((msg) => {
    const conformsType = activeFilter === "all" || msg.type === activeFilter;
    const conformsPlatform = activePlatformFilter === "all" || msg.platform === activePlatformFilter;
    return conformsType && conformsPlatform;
  });

  const getPlatformIcon = (platform: SocialPlatform, size = "h-4 w-4") => {
    switch (platform) {
      case "Facebook":
        return <Facebook className={`${size} text-blue-600`} />;
      case "Instagram":
        return <Instagram className={`${size} text-pink-500`} />;
      case "LinkedIn":
        return <Linkedin className={`${size} text-blue-700`} />;
    }
  };

  const handleSelectMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    setInboxMessageRead(msg.id);
    setCustomReplyText(msg.suggestedReply || "");
  };

  const handleAIRequestTrigger = async (msgId: string) => {
    setIsGenerating((prev) => ({ ...prev, [msgId]: true }));
    try {
      await generateAISmartReply(msgId);
      // Synchronize input text with newly drafted suggest
      const matched = inbox.find((m) => m.id === msgId);
      // Wait briefly for react state update
      setTimeout(() => {
        const freshlyUpdated = inbox.find((m) => m.id === msgId);
        if (freshlyUpdated?.suggestedReply) {
          setCustomReplyText(freshlyUpdated.suggestedReply);
        }
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  const handleApproveAndSendAction = (msg: InboxMessage) => {
    const textToSend = customReplyText || msg.suggestedReply || "Hi there, thank you!";
    approveSmartReply(msg.id, textToSend);
    setCustomReplyText("");
    
    // Auto shift selected messages if any to make it feel premium
    const nextPending = filteredInbox.find((m) => m.id !== msg.id && m.status === "pending");
    if (nextPending) {
      setSelectedMessage(nextPending);
    } else {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up h-[calc(100vh-14rem)] min-h-[500px] flex flex-col justify-stretch">
      {/* Top filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Unified Omnichannel Inbox
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor comments and direct messages. Approve automatic drafts curated by Gemini.
          </p>
        </div>

        {/* Filters Panel bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filters */}
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                activeFilter === "all" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setActiveFilter("comment")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                activeFilter === "comment" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveFilter("dm")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                activeFilter === "dm" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              DMs
            </button>
          </div>

          {/* Social Service filter */}
          <select
            value={activePlatformFilter}
            onChange={(e) => setActivePlatformFilter(e.target.value as any)}
            className="text-xs font-semibold border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-505 bg-white border-gray-200"
          >
            <option value="all">All Channels</option>
            <option value="Facebook">Facebook Pages</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border rounded-2xl border-gray-150 bg-white overflow-hidden shadow-sm flex-1">
        {/* Left Side: Aggregated stream queue list of incoming conversations (Col span 2) */}
        <div className="md:col-span-2 border-r flex flex-col h-full overflow-y-auto min-h-36 max-h-[500px] scrollbar bg-gray-50/20">
          {filteredInbox.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 my-auto">
              No conversations match the selected outlet criteria.
            </div>
          ) : (
            filteredInbox.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 border-b hover:bg-gray-50/50 cursor-pointer transition-colors relative flex gap-3 items-start ${
                    isSelected ? "bg-indigo-50/30 hover:bg-indigo-50/40" : ""
                  }`}
                  id={`inbox_row_item_${msg.id}`}
                >
                  {/* Avatar thumbnail */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      referrerPolicy="no-referrer"
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs">
                      {getPlatformIcon(msg.platform, "h-3.5 w-3.5")}
                    </div>
                  </div>

                  {/* Message Context overview */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex justify-between items-baseline gap-1">
                      <h4 className="font-bold text-xs text-gray-900 truncate max-w-28 sm:max-w-36">
                        {msg.senderName}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest leading-none">
                      {msg.type}
                    </div>

                    <p className="text-xs text-gray-500 leading-normal line-clamp-1">
                      {msg.content}
                    </p>

                    {/* Status badge reports */}
                    <div className="flex items-center space-x-2 pt-1 text-[8px] font-bold uppercase tracking-wider">
                      {msg.status === "replied" ? (
                        <span className="text-emerald-600 flex items-center">
                          <CheckCheck className="h-3 w-3 mr-0.5" />
                          Replied
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center">
                          <Clock className="h-3 w-3 mr-0.5" />
                          Pending Approval
                        </span>
                      )}

                      {msg.unread && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Active Conversation panel with AI reply simulator (Col span 3) */}
        <div className="md:col-span-3 flex flex-col justify-stretch p-6 space-y-5 overflow-y-auto max-h-[500px] scrollbar">
          {selectedMessage ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between" id={`active_talk_pane_${selectedMessage.id}`}>
              {/* Header Profile description */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center space-x-3">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedMessage.senderAvatar}
                    alt={selectedMessage.senderName}
                    className="h-11 w-11 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="font-display font-bold text-sm text-gray-950">
                      {selectedMessage.senderName}
                    </h4>
                    <span className="text-[10px] text-gray-400 flex items-center mt-0.5">
                      {getPlatformIcon(selectedMessage.platform, "h-3.5 w-3.5 mr-1")}
                      Channel: <strong className="font-bold text-gray-700 ml-1 capitalize">{selectedMessage.platform} {selectedMessage.type}</strong>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-gray-400">
                  Received: {new Date(selectedMessage.timestamp).toLocaleDateString()} at {new Date(selectedMessage.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Message content panel representation */}
              <div className="space-y-4 flex-1 py-2">
                <div className="rounded-2xl bg-gray-50 border p-4 max-w-xl">
                  <p className="text-xs text-gray-750 leading-relaxed font-sans font-medium">
                    {selectedMessage.content}
                  </p>
                </div>

                {/* Simulated Outgoing reply history if resolved */}
                {selectedMessage.status === "replied" && (
                  <div className="flex flex-col items-end space-y-2 animate-slide-up">
                    <div className="rounded-2xl bg-emerald-600 text-white p-4 max-w-xl text-right">
                      <p className="text-xs leading-relaxed font-sans">{selectedMessage.userReply}</p>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider flex items-center">
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Sent securely through Page Endpoint
                    </span>
                  </div>
                )}
              </div>

              {/* Smart Reply controls (Only for Pending entries) */}
              {selectedMessage.status === "pending" && (
                <div className="border hover:border-indigo-100 rounded-2xl bg-white p-4.5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                    <div className="flex items-center space-x-1 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      <Sparkles className="h-4 w-4 animate-spin-slow text-indigo-500" />
                      <span>Gemini AI Intelligent Co-Pilot</span>
                    </div>

                    {!selectedMessage.suggestedReply && (
                      <button
                        type="button"
                        disabled={isGenerating[selectedMessage.id]}
                        onClick={() => handleAIRequestTrigger(selectedMessage.id)}
                        className="py-1 px-3.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        id={`smart_reply_suggest_btn_${selectedMessage.id}`}
                      >
                        {isGenerating[selectedMessage.id] ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                            <span>Drafting response...</span>
                          </>
                        ) : (
                          <>
                            <span>Draft Auto-Reply</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Interactive editable drafted textarea */}
                  {selectedMessage.suggestedReply && (
                    <div className="space-y-3.5 animate-slide-up">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                          <CornerDownRight className="h-4 w-4 text-indigo-400 mr-1 shrink-0" />
                          <span>Generated Response Draft Recommendation</span>
                        </span>
                        
                        <button
                          onClick={() => handleAIRequestTrigger(selectedMessage.id)}
                          disabled={isGenerating[selectedMessage.id]}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                          title="Regenerate Draft with Gemini"
                        >
                          <RefreshCw className="h-3 w-3 mr-1 shrink-0" />
                          <span>Regenerate</span>
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={customReplyText}
                        onChange={(e) => setCustomReplyText(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                        placeholder="Draft automatic responses or modify generated output here..."
                      />

                      {/* Approval send button */}
                      <button
                        onClick={() => handleApproveAndSendAction(selectedMessage)}
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-505 transition-colors shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5"
                        id={`approve_reply_btn_${selectedMessage.id}`}
                      >
                        <Send className="h-4 w-4" />
                        <span>Approve and Send Reply</span>
                      </button>
                    </div>
                  )}

                  {!selectedMessage.suggestedReply && (
                    <div className="text-center py-4 text-xs text-gray-400 italic">
                      Click the "Draft Auto-Reply" button above to activate Gemini 3.5 smart context understanding and draft templates.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-gray-400">
              <MessageSquare className="h-12 w-12 text-gray-200 mb-3" />
              <span>Select an inbox ticket from the list to manage and approve AI replies.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
