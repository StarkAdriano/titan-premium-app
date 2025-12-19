
import React from 'react';
import { LayoutDashboard, ShoppingBag, User, Phone, Terminal } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userLogo?: string;
  labels: {
    terminal: string;
    academy: string;
    access: string;
    network: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userLogo, labels }) => {
  const navItems = [
    { id: 'dashboard', label: labels.terminal, icon: LayoutDashboard },
    { id: 'courses', label: labels.academy, icon: ShoppingBag },
    { id: 'profile', label: labels.access, icon: User },
    { id: 'contact', label: labels.network, icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-titan-darker text-titan-text flex flex-col font-sans max-w-md mx-auto shadow-2xl shadow-black border-x border-white/5 relative">
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth custom-scrollbar">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-titan-dark/95 backdrop-blur-xl border-t border-white/5 flex justify-around py-4 pb-6 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
                isActive ? 'text-titan-gold' : 'text-titan-muted hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-4 w-8 h-0.5 bg-titan-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></span>
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'scale-110' : ''} />
              <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
