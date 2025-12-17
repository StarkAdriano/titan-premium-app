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

  const [assets] = useState<Asset[]>(INITIAL_ASSETS);

  // Auth & Expiration Logic
  useEffect(() => {
    const storedUser = localStorage.getItem('titan_user');
    if (storedUser) {
      try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          let isExpired = false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (parsedUser.planType === 'FREE_TRIAL' && parsedUser.trialEndDate) {
              const expiryDate = parseDate(parsedUser.trialEndDate);
              if (expiryDate) {
                  expiryDate.setHours(23, 59, 59, 999);
                  if (today > expiryDate) isExpired = true;
              }
          }

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
      if (!daysToAdd) { alert("Código inválido."); return; }
      if (user.redeemedCodes && user.redeemedCodes.includes(code)) {
          alert("Este código já foi utilizado anteriormente."); return;
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
      alert(`Assinatura renovada com sucesso por ${daysToAdd} dias!`);
  };

  if (user?.planType === 'EXPIRED') return <ExpiredLockScreen onUnlock={handleManualUnlock} />;

  if (!user || !user.isOnboarded) {
    return (
      <div className="min-h-screen bg-titan-darker flex items-center justify-center">
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
      case 'courses': return <Courses />;
      case 'profile': return <Profile user={user} onUpgradeClick={() => setActiveTab('courses')} />;
      case 'contact': return <Contact />;
      default: return <Dashboard asset={assets[0]} savedState={dashboardState} onUpdateState={setDashboardState} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)}>
      {renderContent()}
    </Layout>
  );
};

export default App;