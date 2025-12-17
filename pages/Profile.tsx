
import React, { useState, useRef } from 'react';
import { UserProfile, Language } from '../types';
import { 
  Shield, 
  Clock, 
  UserCircle, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  CloudLightning,
  Camera,
  Globe,
  ChevronDown
} from 'lucide-react';
import { ACTIVATION_CODES } from '../constants';
import { languages } from '../i18n';

interface ProfileProps {
  user: UserProfile;
  onUpgradeClick: () => void;
  onUpdateLogo: (url: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateLanguage: (lang: Language) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpgradeClick, onUpdateLogo, onUpdateName, onUpdateLanguage }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
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
      reader.onloadend = () => onUpdateLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const currentLang = languages.find(l => l.code === user.language) || languages[0];

  return (
    <div className="p-4 space-y-6 pb-20">
      
      <div className="flex flex-col items-center py-8 bg-titan-dark/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
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

      {/* Language Selector */}
      <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <Globe size={18} className="text-titan-gold" />
                <span className="text-[10px] text-white font-black uppercase tracking-widest">Interface Global</span>
            </div>
        </div>
        
        <div className="relative">
            <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/10 text-xs font-bold text-white transition-all hover:border-titan-gold/40"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentLang.flag}</span>
                    <span className="uppercase tracking-widest">{currentLang.name}</span>
                </div>
                <ChevronDown size={16} className={`text-titan-muted transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
                <div className="absolute top-full left-0 w-full mt-2 bg-titan-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onUpdateLanguage(lang.code as Language);
                                    setShowLangMenu(false);
                                }}
                                className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${user.language === lang.code ? 'bg-titan-gold/5' : ''}`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.language === lang.code ? 'text-titan-gold' : 'text-white'}`}>
                                    {lang.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="bg-titan-card rounded-3xl p-6 border border-titan-gold/20 relative overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] text-titan-muted uppercase tracking-widest block mb-1">Status da Licença</span>
            <h3 className="text-xl font-black text-titan-gold italic tracking-tighter flex items-center gap-2">
              <Shield size={20} />
              {user.planType === 'FREE_TRIAL' ? 'FREE TRIAL' : 'TITAN PRO'}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-titan-gold/10 text-titan-gold border-titan-gold/20">
            ONLINE
          </div>
        </div>

        <button onClick={onUpgradeClick} className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-titan-goldLight transition-all active:scale-95 shadow-xl">
          UPGRADE PRO
        </button>
      </div>

      {isAdmin && (
          <div className="bg-red-900/10 border border-red-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                  <Lock size={16} />
                  <h3 className="font-black text-xs uppercase tracking-widest">CEO ADMIN - CODES</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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

      <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-titan-dark flex items-center justify-center border border-white/5"><CloudLightning size={18} className="text-titan-gold" /></div>
                <div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Titan OS Core</p>
                    <p className="text-[9px] text-titan-muted uppercase tracking-tighter">AES-256 SINC ACTIVE</p>
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
