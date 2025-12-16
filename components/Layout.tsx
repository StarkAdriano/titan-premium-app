import React from 'react';
import { LayoutDashboard, ShoppingBag, User, Phone, CheckCircle2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Setup', icon: LayoutDashboard },
    { id: 'courses', label: 'Cursos', icon: ShoppingBag },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'contact', label: 'Suporte', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-titan-darker text-titan-text flex flex-col font-sans max-w-md mx-auto shadow-2xl shadow-black border-x border-titan-card">
      {/* Header */}
      <header className="px-6 py-4 bg-titan-dark border-b border-titan-card flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-titan-gold uppercase">Titan<span className="text-white">Premium</span></h1>
          <p className="text-xs text-titan-muted">Institutional Setup</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-titan-card border border-titan-gold flex items-center justify-center">
           <User size={16} className="text-titan-gold" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-titan-dark/95 backdrop-blur-md border-t border-titan-card flex justify-around py-3 pb-5 z-30">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-titan-gold' : 'text-titan-muted hover:text-white'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;