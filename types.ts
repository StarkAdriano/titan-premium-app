
export enum SignalStatus {
  BUY = 'COMPRAR',
  SELL = 'VENDER',
  WAIT = 'ESPERAR'
}

export type Language = 'pt' | 'en' | 'es';

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

export interface AnalysisResult {
    status: SignalStatus;
    statusMotive: string;
    institutionalContext: string;
    zones: {
        support: string[];
        resistance: string[];
    };
    buyPlan: {
        isIdeal: boolean;
        reason?: string;
        entry?: string;
        stop?: string;
        targets?: string;
        rr?: string;
    };
    sellPlan: {
        isIdeal: boolean;
        reason?: string;
        entry?: string;
        stop?: string;
        targets?: string;
        rr?: string;
    };
    riskManagement: string;
    officialGuideline: string;
    referencePrice: string;
    zoneContext: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  explanation: string;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseProduct {
  id: string;
  name: string;
  description: string;
  priceDisplay: string;
  stripeLink: string;
  tag: string;
  priority: number;
}

export interface UserProfile {
  name: string;
  whatsapp: string;
  logoUrl?: string;
  isOnboarded: boolean;
  planType: 'FREE_TRIAL' | 'PRO' | 'EXPIRED';
  trialStartDate: string;
  trialEndDate: string;
  subscriptionEndDate?: string; 
  redeemedCodes: string[];
  courseProgress?: Record<string, boolean>;
  activeAccountType?: 'DEMO' | 'REAL';
  language: Language;
}
