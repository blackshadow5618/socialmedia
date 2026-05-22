/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  name: string;
  profilePic: string;
  connectedAt: string;
  tokenStatus: "active" | "expired";
}

export type PlanTier = "Free" | "Pro" | "Enterprise";
export type BillingInterval = "monthly" | "annual";

export interface SubscriptionState {
  tier: PlanTier;
  interval: BillingInterval;
  isActive: boolean;
  expiresAt: string;
}

export interface ScheduledPost {
  id: string;
  topic: string;
  caption: string;
  hashtags: string[];
  optimalPostingTime: string;
  scheduledTime: string; // ISO string format
  platforms: SocialPlatform[];
  imageUrl?: string;
  status: "scheduled" | "published";
}

export interface InboxMessage {
  id: string;
  platform: SocialPlatform;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // ISO string
  unread: boolean;
  type: "comment" | "dm";
  suggestedReply?: string;
  userReply?: string;
  status: "pending" | "replied";
}

export interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  description: string;
}

export interface FollowerTrendPoint {
  date: string;
  followers: number;
}

export interface PostPerformancePoint {
  id: string;
  title: string;
  platform: SocialPlatform;
  engagementNum: number;
  reachNum: number;
}
