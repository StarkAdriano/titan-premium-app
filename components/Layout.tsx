
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
    <div className="min-h-screen bg-titan-darker text-titan-text flex flex-col font-sans max-w-md mx-auto shadow-2xl shadow-black border-x border-white/5">
      <header className="px-6 py-5 bg-titan-dark border-b border-white/5 flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-titan-gold/10 rounded-lg border border-titan-gold/20">
             <Terminal size={18} className="text-titan-gold" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">Titan<span className="text-titan-gold">Premium</span></h1>
            <p className="text-[8px] text-titan-muted uppercase font-bold tracking-[0.3em] mt-1">Institutional Brain v3.1</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-titan-darker border border-titan-gold/30 flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer hover:border-titan-gold transition-all">
           {userLogo ? (
             <img src={userLogo} alt="User Logo" className="w-full h-full object-cover" />
           ) : (
             <User size={18} className="text-titan-gold/60 group-hover:text-titan-gold transition-colors" />
           )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
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
