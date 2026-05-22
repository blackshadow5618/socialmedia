/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { SocialHub } from "./SocialHub";
import { ContentStudio } from "./ContentStudio";
import { SmartCalendar } from "./SmartCalendar";
import { UnifiedInbox } from "./UnifiedInbox";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { 
  Sparkles, 
  Calendar, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Grid,
  TrendingUp,
  Award
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { activeTab, setActiveTab, subscription, accounts, inbox } = useApp();

  const tabList = [
    { id: "studio", name: "AI Studio", icon: Sparkles, count: null },
    { id: "calendar", name: "Queue Calendar", icon: Calendar, count: null },
    { id: "inbox", name: "Smart Inbox", icon: MessageSquare, count: inbox.filter(m => m.unread).length || null },
    { id: "analytics", name: "Performance", icon: BarChart3, count: null },
    { id: "settings", name: "Linked Channels", icon: Settings, count: accounts.length || null },
  ] as const;

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "studio":
        return <ContentStudio />;
      case "calendar":
        return <SmartCalendar />;
      case "settings":
        return <SocialHub />;
      case "inbox":
        return <UnifiedInbox />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return <ContentStudio />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-slide-up">
      <div className="flex flex-col gap-6 md:flex-row items-stretch">
        
        {/* Navigation Tab Selector sidebar (Left) */}
        <aside className="md:w-64 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="px-3">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">
                Workspace Console
              </span>
            </div>

            {/* Sidebar button lists */}
            <nav className="space-y-1.5 list-none">
              {tabList.map((item) => {
                const isSelected = activeTab === item.id;
                const IconComp = item.icon;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold leading-none tracking-tight transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-605/20 font-bold"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                      id={`sidebar_tab_btn_${item.id}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <IconComp className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </div>

                      {/* Unread message counts pills */}
                      {item.count !== null && (
                        <span className={`inline-block py-0.5 px-2 rounded-full text-[9px] font-extrabold font-mono ${
                          isSelected ? "bg-white/10 text-white border border-white/10" : "bg-indigo-950/40 text-indigo-300 border border-indigo-500/10"
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </nav>
          </div>

          {/* Quick connection help status under the dashboard */}
          <div className="hidden md:block mt-8 rounded-xl bg-white/5 border p-4 text-[10px] text-gray-450 space-y-2 border-white/10">
            <div className="flex items-center text-white/90 font-semibold space-x-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>Workspace Sync Logs:</span>
            </div>
            <div className="leading-relaxed">
              - Subscription: <strong className="font-bold text-white">{subscription.tier} tier</strong><br />
              - Connected channels: {accounts.length} outlets<br />
              - System state: Ready
            </div>
          </div>
        </aside>

        {/* Core Sub-Content space (Right) */}
        <main className="flex-1 rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 md:p-8 shadow-2xl min-h-[480px]">
          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
};
