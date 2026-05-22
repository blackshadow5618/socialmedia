/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { Layers, Monitor, Play, Shield, Sparkles, User, ExternalLink } from "lucide-react";

export const Header: React.FC = () => {
  const { currentMode, setMode, subscription } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div 
          onClick={() => setMode("landing")} 
          className="flex cursor-pointer items-center space-x-2.5 transition-opacity hover:opacity-95"
          id="branding_logo_btn"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-white">
              SocialPublisher
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-[#E0E0E0] uppercase opacity-75">
              AI Command Center
            </p>
          </div>
        </div>

        {/* Global Navigation - Mode Switcher & Plan Status */}
        <div className="flex items-center space-x-4">
          {/* Plan badge indicators */}
          <div className="hidden items-center space-x-1.5 rounded-full bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Plan: <strong className="font-bold">{subscription.tier}</strong></span>
            {subscription.isActive && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <nav className="flex items-center space-x-1 rounded-lg bg-white/5 p-1 border border-white/5">
            <button
              onClick={() => setMode("landing")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                currentMode === "landing"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              id="switch_landing_btn"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </button>
            <button
              onClick={() => setMode("dashboard")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                currentMode === "dashboard"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              id="switch_dashboard_btn"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Enter Workspace</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
