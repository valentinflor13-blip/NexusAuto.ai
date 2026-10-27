import { Transaction } from '../utils/revenueEngine';

export interface Campaign {
  id: string;
  platform: 'TikTok' | 'Meta' | 'Google' | 'X' | 'LinkedIn';
  name: string;
  budgetPerDay: number;
  spentToday: number;
  revenueGenerated: number;
  roas: number;
  status: 'ACTIVE' | 'OPTIMIZING' | 'PAUSED';
  targetAudience: string;
  creativeHook: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'customer' | 'ai';
  text: string;
  timestamp: string;
  metadata?: {
    sentiment?: string;
    sentimentScore?: number;
    sentimentPolarity?: string;
    objectionIdentified?: string;
    discountOffered?: number;
    actionTaken?: string;
  };
}

export interface AdminSettings {
  theme: 'obsidian' | 'emerald' | 'navy' | 'light';
  recipientEmail: string;
  minCvrAlertThreshold: number;
  minRoasAlertThreshold: number;
  surgeCvrAlertThreshold: number;
  autoPilotMode: boolean;
  autoSyncSocialAds: boolean;
  dynamicPricingEnabled: boolean;
  encryptionStandard: 'AES-256-GCM' | 'ChaCha20-Poly1305';
}

export interface GeneratedContent {
  headline: string;
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  estimatedViralityScore: number;
  simulatedRoasPotential: string;
  audienceTargeting: string;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  type: string;
  metric: string;
  currentValue: string;
  threshold: string;
  status: string;
  emailSubject: string;
  emailHtml: string;
}
