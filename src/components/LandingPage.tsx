/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PlanTier, BillingInterval } from "../types";
import { 
  Check, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Share2, 
  Zap, 
  ShieldCheck, 
  CreditCard,
  Lock,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { openCheckout, subscription, setMode } = useApp();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  const pricingTiers = [
    {
      name: "Free" as PlanTier,
      price: { monthly: 0, annual: 0 },
      description: "Perfect for testing workflows and scheduling casual content.",
      features: [
        "Up to 2 connected social accounts",
        "Weekly calendar view with click-to-schedule",
        "Standard AI generation prompt template",
        "Passive analytics overview update count",
        "Simulated 10 DMs/comments inbox limit",
      ],
      cta: "Current Tier",
      popular: false,
    },
    {
      name: "Pro" as PlanTier,
      price: { monthly: 29, annual: 19 },
      description: "Best for energetic content creators and growing online brands.",
      features: [
        "Uncapped connected social accounts",
        "Dynamic Weekly & Monthly Drag & Drop Calendar",
        "Infinite AI generation studio powered by Gemini",
        "Omnichannel response inbox with real AI Smart Reply",
        "Pro dashboard charts & follower trend analytics",
        "Simulated custom premium background watermarks",
      ],
      cta: "Upgrade Now",
      popular: true,
    },
    {
      name: "Enterprise" as PlanTier,
      price: { monthly: 149, annual: 99 },
      description: "Tailored for social marketing agencies & scaling corporate spaces.",
      features: [
        "Everything in Pro plus key workspace multipliers",
        "Multi-user shared collaborator permission tiers",
        "AI response priority queues & hyper-detailed captions",
        "Interactive analytics report Exports & historical logs",
        "Dedicated corporate manager priority support",
        "SLA guaranteed response triggers",
      ],
      cta: "Get Enterprise",
      popular: false,
    },
  ];

  return (
    <div className="bg-[#050505] text-[#E0E0E0] animate-slide-up">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F0F1A] via-[#050505] to-[#050505] py-20 lg:py-28" id="hero_section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Next-Gen Gemini 3.5 AI Integration</span>
              </div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                The Smart Way to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Scale Your Socials</span>
              </h2>
              <p className="max-w-xl text-lg text-gray-400 leading-relaxed">
                Connect channels, draft engaging viral copy with Gemini, drag-and-drop posts in our interactive publishing calendar, and reply to commenters instantly with automated AI Smart Replies.
              </p>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                <button
                  onClick={() => setMode("dashboard")}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-605/20 hover:bg-indigo-500 transition-colors"
                  id="hero_primary_cta"
                >
                  <span>Launch Free Console</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <a
                  href="#pricing_section"
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors"
                >
                  View Premium Tiers
                </a>
              </div>

              {/* Quick Trust factors */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-7 text-xs font-mono text-gray-400">
                <div>
                  <strong className="block text-lg font-bold text-white">10x</strong>
                  Writing Speed
                </div>
                <div>
                  <strong className="block text-lg font-bold text-white">100%</strong>
                  Local Persistence
                </div>
                <div>
                  <strong className="block text-lg font-bold text-white">Multi</strong>
                  Account Sync
                </div>
              </div>
            </div>

            {/* Right Graphic Preview Card */}
            <div className="relative lg:ml-4">
              <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 shadow-2xl ring-1 ring-white/5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-mono text-gray-400">social-command-hub.io</span>
                </div>
                
                {/* Simulated App Screenshot / Interface Mini */}
                <div className="mt-4 space-y-4 rounded-lg bg-white/5 p-4 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-955 bg-indigo-950 flex items-center justify-center text-indigo-300 font-extrabold font-display border border-indigo-500/25">AI</div>
                    <div>
                      <div className="h-3.5 w-32 rounded bg-white/10" />
                      <div className="mt-1 h-2.5 w-16 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 w-full rounded bg-white/10" />
                    <div className="h-3.5 w-full rounded bg-white/10" />
                    <div className="h-3.5 w-3/4 rounded bg-white/10" />
                  </div>
                  {/* Visual Hashtags pills */}
                  <div className="flex space-x-2 pt-1">
                    <span className="rounded bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">#GeminiStudio</span>
                    <span className="rounded bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">#ViralAI</span>
                    <span className="rounded bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">#SustainableSaaS</span>
                  </div>
                </div>

                {/* Micro metrics badge floating */}
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-emerald-600 p-3 text-white shadow-xl animate-bounce flex items-center space-x-2.5">
                  <TrendingUp className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-[10px] font-mono opacity-80 uppercase leading-none">Weekly Growth</div>
                    <div className="text-sm font-bold leading-tight">+128.9% engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID DETAILED */}
      <section className="bg-[#0A0A0A]/40 py-20 lg:py-24 border-y border-white/5" id="features_section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-indigo-400">Core Capabilities</h3>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything required to scale your content marketing channels in one unified grid
            </h2>
            <p className="text-gray-400">
              No more tedious logins across tabs. Manage publishing pipelines, smart dialog queues, connections, and reports smoothly.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <Sparkles className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Content Studio</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Describe your prompt or topic, specify voice tones, and let the integrated Gemini Engine auto-generate captions, optimal hashtags and post times instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <Calendar className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Multi-View Calendar</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Visualize active queues on flexible Monthly & Weekly tracks. Supports instant click-to-edit scheduled slots and file previews.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <MessageSquare className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">Unified Response Inbox</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Aggregates incoming customer DMs & page comments from Instagram, Facebook, and LinkedIn. Click "AI Smart Reply" to draft empathetic contextual responses in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <Share2 className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">Connected Social Account Hub</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Connect channels through simulated OAuth endpoints. Monitor sync logs, profile pictures, and active account connections inside one safe, sandboxed area.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">Analytics & Trend Visualizer</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Gain clarity on overall reach, follower counts, and post-level engagement with responsive pixel-perfect visual dashboard indicators.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-505/20 mb-5">
                <Lock className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-white">Stripe Style Checkout Vault</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Upgrade fluidly. Our simulated sandbox billing triggers immediate Firestore account plan transitions, instantly expanding dashboard capability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PRICING TABLE */}
      <section className="py-20 lg:py-24 bg-[#050505]" id="pricing_section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-indigo-400">Flexible Pricing Plans</h3>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pay only for what your content campaigns require
            </h2>
            <p className="text-gray-405 text-gray-400">
              Switch easily between monthly and annual plans to enjoy up to 35% discount on bulk billing intervals.
            </p>

            {/* Pricing Interval Toggle */}
            <div className="mt-8 inline-flex items-center rounded-full bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                  billingInterval === "monthly" 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="toggle_monthly_billing"
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBillingInterval("annual")}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                  billingInterval === "annual" 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="toggle_annual_billing"
              >
                <span>Annual Billing</span>
                <span className="absolute -top-3.5 -right-3.5 flex h-5 items-center rounded-full bg-indigo-600 px-2 text-[9px] font-bold text-white uppercase tracking-wider leading-none">
                  -33%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
            {pricingTiers.map((tier) => {
              const isCurrent = subscription.tier === tier.name;
              const hasHigherOrEqual = 
                (subscription.tier === "Pro" && tier.name === "Free") ||
                (subscription.tier === "Enterprise" && (tier.name === "Free" || tier.name === "Pro"));

              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-8 transition-transform ${
                    tier.popular
                      ? "border-indigo-500 bg-indigo-955 bg-indigo-950/25 ring-2 ring-indigo-500/10 scale-102 shadow-2xl shadow-indigo-500/10"
                      : "border-white/10 bg-[#0A0A0A]"
                  }`}
                  id={`pricing_tier_${tier.name.toLowerCase()}`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 items-center rounded-full bg-indigo-600 px-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/30">
                      Highly Popular Choice
                    </span>
                  )}

                  {/* Header */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{tier.name}</h3>
                    <p className="mt-2 text-xs text-gray-400 min-h-10 leading-relaxed">{tier.description}</p>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold tracking-tight text-white">
                        ${billingInterval === "annual" ? tier.price.annual : tier.price.monthly}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">/ user / mo</span>
                    </div>
                    {billingInterval === "annual" && tier.price.annual > 0 && (
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Billed Annually (Save 33%)</p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="mt-6 space-y-3.5 flex-1 border-t border-white/10 pt-6 text-sm">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mr-2.5 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8 pt-4">
                    <button
                      disabled={isCurrent || hasHigherOrEqual}
                      onClick={() => openCheckout(tier.name, billingInterval)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold leading-none tracking-tight transition-all duration-150 ${
                        isCurrent 
                          ? "bg-[#0F1E15]/50 text-emerald-400 border border-emerald-500/20 cursor-not-allowed flex items-center justify-center space-x-1" 
                          : hasHigherOrEqual
                          ? "bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed"
                          : tier.popular
                          ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
                          : "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                      }`}
                      id={`cta_pricing_btn_${tier.name.toLowerCase()}`}
                    >
                      {isCurrent ? (
                        <>
                          <Award className="h-4.5 w-4.5 text-emerald-400 animate-spin-slow" />
                          <span>Active Subscription</span>
                        </>
                      ) : hasHigherOrEqual ? (
                        "Tier Owned"
                      ) : (
                        tier.cta
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FAQs Section */}
      <section className="bg-[#0A0A0A]/40 py-16 lg:py-20 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Answers to Standard Inquiries</h2>
            <p className="text-gray-400 mt-2">Clear, straightforward pricing and feature validation feedback.</p>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-xl bg-[#0A0A0A] p-5 border border-white/10">
              <h4 className="font-bold text-sm text-white flex items-center">
                <HelpCircle className="h-4.5 w-4.5 text-indigo-400 mr-2 shrink-0" />
                How does the AI checkout simulator behave?
              </h4>
              <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                When click upgrade, beautiful secure credit card fields are displayed mockingly. Completed simulations synchronously trigger Firestore state upgrades. Total reach indicators and limits expands instantly!
              </p>
            </div>
            
            <div className="rounded-xl bg-[#0A0A0A] p-5 border border-white/10">
              <h4 className="font-bold text-sm text-white flex items-center">
                <HelpCircle className="h-4.5 w-4.5 text-indigo-400 mr-2 shrink-0" />
                Does this application require a credit card for test accounts?
              </h4>
              <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                No, the payment forms run securely in sandboxed simulation mode. Test values (e.g., standard Stripe mock 4242 digits) are pre-populated, allowing quick feature tier validations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
