/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  CreditCard, 
  Lock, 
  X, 
  ShieldAlert, 
  Play, 
  CheckCircle,
  Database,
  ArrowRight,
  ServerCrash
} from "lucide-react";

export const CheckoutModal: React.FC = () => {
  const { 
    checkoutModalOpen, 
    checkoutTier, 
    checkoutInterval, 
    closeCheckout, 
    updateSubscription,
    setMode
  } = useApp();

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("08/29");
  const [cvc, setCvc] = useState("324");
  const [cardholderName, setCardholderName] = useState("Test Content Marketer");
  
  const [processing, setProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [firestoreLogs, setFirestoreLogs] = useState<string[]>([]);

  if (!checkoutModalOpen || !checkoutTier) return null;

  const cost = checkoutInterval === "annual" 
    ? (checkoutTier === "Pro" ? 19 : 99) 
    : (checkoutTier === "Pro" ? 29 : 149);

  const totalCost = cost * (checkoutInterval === "annual" ? 12 : 1);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorStatus(null);
    setFirestoreLogs([]);

    try {
      // Step 1: Validate payload inputs
      await sleep(1000);
      setFirestoreLogs(prev => [...prev, "⚡ Mock Stripe gateway initiated secure handshake..."]);
      
      // Step 2: Charge processing
      await sleep(1200);
      setFirestoreLogs(prev => [...prev, `💸 Tokenized card processed. Charge of $${totalCost}.00 approved.`]);
      
      // Step 3: Write to Firestore (Simulated DB Connection)
      await sleep(1000);
      setFirestoreLogs(prev => [...prev, "🗄️ Connected to Firestore Enterprise Edition database..."]);
      setFirestoreLogs(prev => [...prev, `📁 Updating document: /subscriptions/${checkoutTier.toLowerCase()}_user`]);
      setFirestoreLogs(prev => [...prev, `✏️ Setting fields: { tier: "${checkoutTier}", interval: "${checkoutInterval}", active: true, updatedAt: ServerTimestamp() }`]);
      
      await sleep(800);
      setFirestoreLogs(prev => [...prev, "✅ Firestore transaction committed successfully without permission conflicts."]);
      
      // Complete state changes
      updateSubscription(checkoutTier, checkoutInterval);
      setSuccess(true);
    } catch (err: any) {
      setErrorStatus("Token authentication failed. Double check simulated card parameters.");
      setFirestoreLogs(prev => [...prev, "❌ Transaction rolled back due to failure."]);
    } finally {
      setProcessing(false);
    }
  };

  const navigateToDashboard = () => {
    setSuccess(false);
    closeCheckout();
    setMode("dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-slide-up">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
        id="stripe_simulator_modal"
      >
        {/* Banner header containing lock status */}
        <div className="bg-[#0F101A] px-6 py-4 text-white flex justify-between items-center border-b border-indigo-500/20">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-300">
              Checkout Simulator
            </span>
          </div>
          <button 
            onClick={closeCheckout} 
            className="text-gray-400 hover:text-white transition-colors"
            id="close_checkout_btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body based on charge process flow */}
        {!success ? (
          <form onSubmit={handleChargeSubmit} className="p-6 space-y-5">
            <div className="border bg-indigo-950/20 rounded-xl p-4 flex items-center justify-between border-indigo-500/25">
              <div>
                <h4 className="font-display font-extrabold text-sm text-white">
                  SocialPublisher {checkoutTier} Plan
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Interval: <span className="capitalize font-semibold text-gray-200">{checkoutInterval}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-400">${cost}</span>
                <span className="text-xs text-gray-400"> / mo</span>
                <p className="text-[10px] text-gray-400 mt-1">
                  Total: ${totalCost} / billed {checkoutInterval}
                </p>
              </div>
            </div>

            {/* Credit Card layout styling */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Card Details (Sandbox Stripe Simulator)
              </label>

              {/* Real-time card design visual */}
              <div className="rounded-xl bg-gradient-to-br from-[#12121A] to-[#0A0A0F] p-5 text-white border border-white/5 shadow-lg space-y-6 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-indigo-500 font-mono text-lg font-black tracking-widest italic select-none">
                  VISA
                </div>
                <div className="h-7 w-10.5 rounded bg-amber-400/80 border border-amber-300/30" />
                <div className="space-y-4">
                  <div className="font-mono text-base tracking-widest text-gray-150">
                    {cardNumber}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block leading-none">
                        Cardholder Name
                      </span>
                      <span className="font-sans text-xs font-medium text-gray-200">
                        {cardholderName || "Type Name..."}
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block leading-none">
                          Expires
                        </span>
                        <span className="font-mono text-xs text-gray-200">{expiry}</span>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block leading-none">
                          CVC
                        </span>
                        <span className="font-mono text-xs text-gray-200">{cvc}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-[#141414] border border-white/10 px-3 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none"
                    placeholder="E.g., Test Content Marketer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Simulated Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg bg-[#141414] border border-white/10 px-3 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      CVC / CVV Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg bg-[#141414] border border-white/10 px-3 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none"
                      placeholder="E.g., 324"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Database connection logs console */}
            {firestoreLogs.length > 0 && (
              <div className="rounded-lg bg-black border border-white/5 p-3 font-mono text-[10px] text-gray-350 space-y-1">
                <span className="text-gray-500 block border-b border-white/5 pb-1 mb-1 font-semibold uppercase tracking-wider">
                  Sync Database Console Logs:
                </span>
                {firestoreLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight text-gray-300">{log}</div>
                ))}
              </div>
            )}

            {/* Trigger Button with state validation */}
            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-xs font-semibold tracking-tight text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 font-display transition-colors shadow-lg shadow-indigo-600/20"
              id="submit_checkout_charge_btn"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing Secure Charge...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4.5 w-4.5" />
                  <span>Charge ${totalCost}.00 & Upgrade in DB</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Transaction processed successfully visual panel */
          <div className="p-8 text-center space-y-6 animate-slide-up">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/45 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-lg text-white">
                Payment Completed Successfully!
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Your user registration plan status has been updated synchronously to <strong className="font-bold text-white text-xs">{checkoutTier}</strong> in our enterprise database. Feel free to explore unlimited capabilities!
              </p>
            </div>

            {/* Visual confirmation of DB sync status */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2 text-left font-mono text-[10px] text-emerald-400">
              <div className="flex items-center space-x-1.5 font-bold mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>FIRESTORE TRANSACTION REPORT:</span>
              </div>
              <div>- Path: /subscriptions/tenant_user</div>
              <div>- Schema Match Priority: EXTREME</div>
              <div>- Document Sync Status: COMPILED_WRITE_SUCCESS</div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={navigateToDashboard}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 font-display transition-colors inline-flex justify-center items-center space-x-1"
                id="stripe_go_dashboard_btn"
              >
                <span>Navigate to Workspace Concierge</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={closeCheckout}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
