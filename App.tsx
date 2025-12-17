import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import OnboardingModal from './components/OnboardingModal';
import ExpiredLockScreen from './components/ExpiredLockScreen';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import { UserProfile, Asset, AnalysisResult } from './types';
import { INITIAL_ASSETS, ACTIVATION_CODES } from './constants';

// HELPER: Robust Date Formatting (Forces PT-BR regardless of device locale)
const getTodayFormatted = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
};

const addDaysToDate = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    const day = String(result.getDate()).padStart(2, '0');
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const year = result.getFullYear();
    return `${day}/${month}/${year}`;
};

// Parse DD/MM/YYYY manually to avoid browser inconsistencies
const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    } catch (e) {
        return null;
    }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // --- PERSISTENT STATE FOR DASHBOARD ---
  // Updated with referencePrice and trendBias
  const [dashboardState, setDashboardState] = useState<{
      userPrice: string;
      isRevealed: boolean;
      analysisSnapshot: AnalysisResult | null;
      referencePrice: string;
      trendBias: 'BULLISH' | 'BEARISH';
  }>({
      userPrice: '',
      isRevealed: false,
      analysisSnapshot: null,
      referencePrice: '',
      trendBias: 'BEARISH'
  });

  // Single Source of Truth for Assets
  const [assets, setAssets] = useState<Asset[]>(() => {
    const now = new Date();
    // Force PT-BR time string
    const currentHHMM = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // History 1: 4 hours ago (Previous Session)
    const time1 = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    const strTime1 = time1.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return INITIAL_ASSETS.map(asset => ({
        ...asset,
        lastUpdated: `Hoje, ${currentHHMM}`,
        history: asset.history.map((h, index) => {
            if (index === 0) return { ...h, date: `Hoje, ${strTime1}` }; 
            if (index === 1) return { ...h, date: `Ontem, 15:30` }; 
            if (index === 2) return { ...h, date: `Ontem, 09:15` }; 
            return h;
        })
    }));
  });

  // Real-time Price Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

      setAssets(currentAssets => currentAssets.map(asset => {
        const currentPrice = parseFloat(asset.price);
        // Slightly increased volatility for better "Live" feeling
        const variation = (Math.random() - 0.5) / 2000; 
        const newPrice = currentPrice + variation;
        
        return {
            ...asset,
            price: newPrice.toFixed(5),
            lastUpdated: `Hoje, ${timeString}`
        };
      }));
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  // Authentication & Expiration Logic
  useEffect(() => {
    const storedUser = localStorage.getItem('titan_user');
    if (storedUser) {
      try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          let isExpired = false;

          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of day comparison

          // Check Free Trial Expiry
          if (parsedUser.planType === 'FREE_TRIAL' && parsedUser.trialEndDate) {
              const expiryDate = parseDate(parsedUser.trialEndDate);
              if (expiryDate) {
                  expiryDate.setHours(23, 59, 59, 999); // End of expiry day
                  if (today > expiryDate) isExpired = true;
              }
          }

          // Check PRO Subscription Expiry
          if (parsedUser.planType === 'PRO' && parsedUser.subscriptionEndDate) {
              const subExpiryDate = parseDate(parsedUser.subscriptionEndDate);
              if (subExpiryDate) {
                  subExpiryDate.setHours(23, 59, 59, 999);
                  if (today > subExpiryDate) isExpired = true;
              }
          }

          if (isExpired) {
              const expiredUser: UserProfile = { ...parsedUser, planType: 'EXPIRED' };
              localStorage.setItem('titan_user', JSON.stringify(expiredUser));
              setUser(expiredUser);
          } else {
              setUser(parsedUser);
          }
      } catch (error) {
          console.error("Critical Auth Error:", error);
          // Safety fallback: clear corrupted data
          localStorage.removeItem('titan_user');
          setUser(null);
      }
    }
  }, []);

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    const now = new Date();
    
    const newUser: UserProfile = {
      name: data.name || '',
      whatsapp: data.whatsapp || '',
      isOnboarded: true,
      planType: 'FREE_TRIAL',
      trialStartDate: getTodayFormatted(),
      trialEndDate: addDaysToDate(now, 30),
      redeemedCodes: [] 
    };

    setUser(newUser);
    localStorage.setItem('titan_user', JSON.stringify(newUser));
  };

  const handleManualUnlock = (code: string) => {
      if (!user) return;
      const daysToAdd = ACTIVATION_CODES[code];
      
      if (!daysToAdd) {
          alert("Código inválido.");
          return;
      }

      if (user.redeemedCodes && user.redeemedCodes.includes(code)) {
          alert("Este código já foi utilizado anteriormente.");
          return;
      }

      const now = new Date();
      const newEndDate = addDaysToDate(now, daysToAdd);

      const upgradedUser: UserProfile = {
          ...user,
          planType: 'PRO',
          subscriptionEndDate: newEndDate,
          redeemedCodes: [...(user.redeemedCodes || []), code] 
      };

      setUser(upgradedUser);
      localStorage.setItem('titan_user', JSON.stringify(upgradedUser));
      alert(`Assinatura renovada com sucesso por ${daysToAdd} dias! Validade: ${newEndDate}`);
  };

  if (user?.planType === 'EXPIRED') {
    return <ExpiredLockScreen onUnlock={handleManualUnlock} />;
  }

  if (!user || !user.isOnboarded) {
    return (
      <div className="min-h-screen bg-titan-darker flex items-center justify-center">
        <div className="animate-pulse text-titan-gold font-bold tracking-widest text-2xl">TITAN PREMIUM</div>
        <OnboardingModal onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
            <Dashboard 
                asset={assets[0]} 
                savedState={dashboardState}
                onUpdateState={setDashboardState}
            />
        );
      case 'courses':
        return <Courses />;
      case 'profile':
        return (
            <Profile 
                user={user} 
                onUpgradeClick={() => setActiveTab('courses')}
            />
        );
      case 'contact':
        return <Contact />;
      default:
        return (
            <Dashboard 
                asset={assets[0]} 
                savedState={dashboardState}
                onUpdateState={setDashboardState}
            />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)}>
      {renderContent()}
    </Layout>
  );
};

export default App;