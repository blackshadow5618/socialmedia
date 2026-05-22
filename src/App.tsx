/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { CheckoutModal } from "./components/CheckoutModal";

function DashboardOrLanding() {
  const { currentMode } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050505]" id="app_frame_container">
      {/* Dynamic Header */}
      <Header />

      {/* Primary body based on active selected layout mode */}
      <main className="flex-1">
        {currentMode === "landing" ? <LandingPage /> : <Dashboard />}
      </main>

      {/* Interactive Checkout Dialog simulator overlay */}
      <CheckoutModal />

      {/* Global minimal footer */}
      <footer className="border-t border-white/10 bg-[#0A0A0A] py-6 text-center select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-none">
          <span>SocialPublisher © 2026. All Rights Reserved.</span>
          <span>Crafted with zero-trust Firestore guidelines</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardOrLanding />
    </AppProvider>
  );
}
