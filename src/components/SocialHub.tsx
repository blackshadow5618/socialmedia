/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SocialPlatform } from "../types";
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  ShieldCheck, 
  Facebook, 
  Instagram, 
  Linkedin, 
  AlertTriangle,
  Radio,
  FileKey
} from "lucide-react";

export const SocialHub: React.FC = () => {
  const { accounts, connectAccount, disconnectAccount, subscription } = useApp();
  
  const [connectName, setConnectName] = useState("");
  const [connectPlatform, setConnectPlatform] = useState<SocialPlatform>("Facebook");
  const [connecting, setConnecting] = useState(false);
  const [authLogs, setAuthLogs] = useState<string[]>([]);
  const [simulatePopupOpen, setSimulatePopupOpen] = useState(false);

  // Constraints warning for Free tier
  const isAccountLimitMet = subscription.tier === "Free" && accounts.length >= 2;

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { platform, name } = event.data;
        connectAccount(platform, name);
        setAuthLogs(p => [
          ...p,
          `✅ Successfully authorized secure credential token for: ${name}!`,
          `🔒 Long-Lived Token hash stored in Firestore users collection.`
        ]);
        
        setTimeout(() => {
          setSimulatePopupOpen(false);
          setConnectName("");
          setConnecting(false);
        }, 1500);
      } else if (event.data?.type === "OAUTH_AUTH_FAILURE") {
        const err = event.data?.error || "User declined authorization or configuration is missing";
        setAuthLogs(p => [...p, `❌ Handshake failed: ${err}`]);
        setConnecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [connectAccount]);

  const handleRealAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectName.trim()) return;

    setConnecting(true);
    setAuthLogs([]);
    setSimulatePopupOpen(true);

    const platform = connectPlatform.toLowerCase();
    
    setAuthLogs(p => [...p, `🔗 Initiating handshake with OAuth Provider for ${connectPlatform}...`]);
    setAuthLogs(p => [...p, "🔑 Requesting specific permission scopes in popups..."]);
    
    const authUrl = `/auth/${platform}?customName=${encodeURIComponent(connectName.trim())}`;
    
    const popup = window.open(
      authUrl,
      "oauth_popup",
      "width=650,height=750"
    );

    if (!popup) {
      setAuthLogs(p => [...p, "❌ Browser popup blocked. Please allow popups for this site."]);
      setConnecting(false);
    } else {
      setAuthLogs(p => [...p, "⚡ Waiting for provider credentials authorization on callback..."]);
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "Facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "Instagram":
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case "LinkedIn":
        return <Linkedin className="h-5 w-5 text-blue-700" />;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Intro section */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Connected Social Accounts
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Link and manage active token connections of Facebook Pages, Instagram, and LinkedIn.
          </p>
        </div>

        {/* Free limit banner warning */}
        {isAccountLimitMet && (
          <div className="rounded-lg bg-yellow-50 px-3.5 py-2 text-xs text-yellow-800 border border-yellow-100 max-w-sm flex items-start space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="leading-normal">
              <strong>Account Limit Reached:</strong> You are on the <strong className="font-bold">Free Plan</strong>. Free plan users are capped at 2 channels. Please click the <strong>Landing Page</strong> to upgrade.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Create/Connect Form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-display font-bold text-sm text-gray-950 flex items-center space-x-2">
            <Radio className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
            <span>Connect New Channel</span>
          </h3>

          <form onSubmit={handleRealAuth} className="mt-5 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Target Platform Outlet
              </label>
              <select
                disabled={isAccountLimitMet}
                value={connectPlatform}
                onChange={(e) => setConnectPlatform(e.target.value as SocialPlatform)}
                className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Facebook">Facebook Business Page</option>
                <option value="Instagram">Instagram Business Account</option>
                <option value="LinkedIn">LinkedIn Professional Page</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Account/Page Custom Name
              </label>
              <input
                type="text"
                required
                disabled={isAccountLimitMet}
                value={connectName}
                onChange={(e) => setConnectName(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-gray-200 px-3 py-2.5 focus:border-indigo-500 focus:outline-none"
                placeholder="E.g., Sustainable Design Page"
              />
            </div>

            <button
              type="submit"
              disabled={isAccountLimitMet || connecting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 transition-colors shadow-lg shadow-indigo-100"
              id="submit_connect_auth_btn"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Initiate Connection</span>
            </button>
          </form>

          {/* Secure Credential Token Note */}
          <div className="mt-6 flex items-start space-x-2 rounded-lg bg-gray-50/80 p-3 text-[10px] leading-relaxed text-gray-500 border border-gray-150">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Secure Token Protection:</strong> High-entropy cryptographic tokens remain locked utilizing local encrypted keychain models, satisfying complete zero-trust platform criteria.
            </div>
          </div>
        </div>

        {/* Right Side: Account Lists representation */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-xs tracking-wider text-gray-400 uppercase">
            Active Connected Accounts ({accounts.length})
          </h3>

          {accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-xs text-gray-500">
              No active connected social accounts found. Connect a channel on the left to activate marketing pipelines.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden"
                  id={`social_account_card_${acc.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          referrerPolicy="no-referrer"
                          src={acc.profilePic}
                          alt={acc.name}
                          className="h-12 w-12 rounded-lg object-cover bg-gray-100 ring-2 ring-indigo-50/50"
                        />
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
                          {getPlatformIcon(acc.platform)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-950 truncate max-w-44">
                          {acc.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-indigo-600 tracking-tight uppercase leading-none block mt-1">
                          {acc.platform}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => disconnectAccount(acc.id)}
                      className="text-gray-400 hover:text-red-500 rounded p-1 hover:bg-red-50 transition-colors"
                      title="Disconnect account"
                      id={`disconnect_acc_${acc.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Token Status indicators */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span className="font-mono text-emerald-600 font-bold uppercase tracking-wider">
                        Active Sync
                      </span>
                    </div>
                    <span className="text-[9px] font-mono leading-none">
                      Linked: {new Date(acc.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulated OAuth Connect Modal Overlay */}
      {simulatePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-slide-up">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 border-b pb-3.5">
              <div className="h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 flex">
                <FileKey className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm text-gray-950">
                  Secure OAuth Handshake (Sandbox)
                </h4>
                <p className="text-[10px] tracking-wide text-gray-400 mt-0.5 font-mono">
                  PLATFORM: {connectPlatform.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-950 p-4 font-mono text-[10px] text-indigo-400 min-h-36 max-h-48 overflow-y-auto space-y-1.5 scrollbar">
              {authLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
              {connecting && (
                <div className="flex items-center space-x-1.5 pt-1 text-gray-500">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Awaiting token callback...</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={connecting}
                onClick={() => setSimulatePopupOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Cancel Handshake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
