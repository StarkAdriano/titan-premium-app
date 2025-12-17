
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

export interface AnalysisResult {
    status: SignalStatus;
    shortSummary: string;
    detailedAnalysis: string;
    validationMsg: string;
    validationStatus: 'OK' | 'WARNING';
    referencePrice: string;
    stopLoss?: string;
    takeProfit?: string;
    rrRatio?: string;
    zoneContext?: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  pdfUrl?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface UserProfile {
  name: string;
  whatsapp: string;
  isOnboarded: boolean;
  planType: 'FREE_TRIAL' | 'PRO' | 'EXPIRED';
  trialStartDate: string;
  trialEndDate: string;
  subscriptionEndDate?: string; 
  redeemedCodes: string[];
  courseProgress?: Record<string, boolean>; // lessonId -> completed
}

export interface CourseProduct {
  id: string;
  name: string;
  description: string;
  priceDisplay?: string;
  stripeLink: string;
  tag: string;
  priority: number;
}
