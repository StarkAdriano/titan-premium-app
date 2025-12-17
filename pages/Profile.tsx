
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { 
  Shield, 
  Clock, 
  UserCircle, 
  CalendarDays, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  CloudLightning,
  Info,
  Camera,
  LogOut
} from 'lucide-react';
import { ACTIVATION_CODES } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpgradeClick: () => void;
  onUpdateLogo: (url: string) => void;
  onUpdateName: (name: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpgradeClick, onUpdateLogo, onUpdateName }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Sincronizado agora');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = user.name === 'Desenvolvedor Titan' || user.name === 'TitanMaster';

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 space-y-6">
      
      {/* Identity Personalization */}
      <div className="flex flex-col items-center py-8 bg-titan-dark/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-titan-gold/5 rounded-full blur-2xl"></div>
        
        <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-3xl bg-titan-card border-2 border-titan-gold/30 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-titan-gold transition-all">
             {user.logoUrl ? (
               <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={48} className="text-titan-gold/40" />
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-titan-gold text-black p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Camera size={14} />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="text-center">
          <input 
            type="text" 
            value={user.name} 
            onChange={(e) => onUpdateName(e.target.value)}
            className="text-2xl font-black text-white italic tracking-tighter bg-transparent border-none text-center outline-none focus:text-titan-gold transition-colors"
          />
          <p className="text-[10px] text-titan-muted uppercase tracking-[0.2em] font-bold">{user.whatsapp}</p>
        </div>
      </div>

      {/* Plan Status */}
      <div className="bg-titan-card rounded-3xl p-6 border border-titan-gold/20 relative overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] text-titan-muted uppercase tracking-widest block mb-1">Status da Licença</span>
            <h3 className="text-xl font-black text-titan-gold italic tracking-tighter flex items-center gap-2">
              <Shield size={20} />
              {user.planType === 'FREE_TRIAL' ? 'FREE TRIAL' : 'TITAN PRO'}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.planType === 'FREE_TRIAL' ? 'bg-titan-green/10 text-titan-green border-titan-green/20' : 'bg-titan-gold/10 text-titan-gold border-titan-gold/20'}`}>
            ONLINE
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-titan-muted uppercase font-bold flex items-center gap-2"><Clock size={12} /> Validade</span>
            <span className="text-xs text-white font-mono">{user.planType === 'FREE_TRIAL' ? user.trialEndDate : (user.subscriptionEndDate || 'Vitalício')}</span>
          </div>
        </div>

        <button onClick={onUpgradeClick} className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-titan-goldLight transition-all active:scale-95 shadow-xl">
          {user.planType === 'FREE_TRIAL' ? 'UPGRADE PARA PRO' : 'ESTENDER LICENÇA'}
        </button>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
          <div className="bg-red-900/10 border border-red-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                  <Lock size={16} />
                  <h3 className="font-black text-xs uppercase tracking-widest">Painel CEO - Códigos</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {Object.entries(ACTIVATION_CODES).map(([code, days]) => (
                      <button key={code} onClick={() => handleCopyCode(code)} className="w-full flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 hover:border-titan-gold transition-all group">
                          <div className="text-left">
                              <p className="text-xs font-mono font-bold text-white group-hover:text-titan-gold">{code}</p>
                              <p className="text-[9px] text-titan-muted">{days} Dias</p>
                          </div>
                          {copiedCode === code ? <Check size={14} className="text-titan-green" /> : <Copy size={14} className="text-titan-muted" />}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Sync Unit */}
      <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-titan-dark flex items-center justify-center border border-white/5"><CloudLightning size={18} className="text-titan-gold" /></div>
                <div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Titan OS Core</p>
                    <p className="text-[9px] text-titan-muted uppercase tracking-tighter">{lastSync}</p>
                </div>
            </div>
            <button onClick={() => {setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1500);}} disabled={isSyncing} className="p-2 text-titan-gold hover:bg-titan-gold/10 rounded-full transition-all">
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
