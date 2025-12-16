
export enum SignalStatus {
  BUY = 'COMPRAR',
  SELL = 'VENDER',
  WAIT = 'ESPERAR'
}

export interface HistoryEntry {
  id: string;
  date: string;
  status: SignalStatus;
  summary: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: string;
  status: SignalStatus;
  shortSummary: string;
  detailedAnalysis: string;
  isFavorite: boolean;
  lastUpdated: string;
  history: HistoryEntry[];
}

// New Interface for Persisting Analysis
export interface AnalysisResult {
    status: SignalStatus;
    shortSummary: string;
    detailedAnalysis: string;
    validationMsg: string;
    validationStatus: 'OK' | 'WARNING';
    referencePrice: string;
    // New Fields for Trade Parameters
    stopLoss?: string;
    takeProfit?: string;
    rrRatio?: string;
    commandLine?: string; // The raw copy-paste string
}

export interface UserProfile {
  name: string;
  whatsapp: string;
  isOnboarded: boolean;
  planType: 'FREE_TRIAL' | 'PRO' | 'EXPIRED';
  trialStartDate: string;
  trialEndDate: string;
  // New fields for recurring subscription logic
  subscriptionEndDate?: string; 
  redeemedCodes: string[]; // List of codes already used by this user
}

export interface CourseProduct {
  id: string;
  name: string;
  description: string;
  priceDisplay?: string;
  stripeLink: string;
  tag: string; // e.g. "Assinatura", "Mentoria"
  priority: number; // For sorting
}

export type RiskProfile = 'MODERATE' | 'AGGRESSIVE';