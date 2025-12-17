
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
  
  // LOGICA DE SEGURANÇA: Apenas o dono (identificado pelo nome secreto ou status de admin) vê os códigos.
  const isOwner = user.name === 'Desenvolvedor Titan' || user.whatsapp.includes('CEO Access');

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
    <div className="p-6 space-y-8 pb-32 bg-titan-darker">
      
      <div className="flex flex-col items-center py-10 bg-titan-dark/40 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 rounded-[2.5rem] bg-titan-card border-2 border-titan-gold/30 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-titan-gold transition-all duration-500">
             {user.logoUrl ? (
               <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={64} className="text-titan-gold/40" />
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-titan-gold text-black p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform">
            <Camera size={18} />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="text-center">
          <input 
            type="text" 
            value={user.name} 
            onChange={(e) => onUpdateName(e.target.value)}
            className="text-3xl font-black text-white italic tracking-tighter bg-transparent border-none text-center outline-none focus:text-titan-gold transition-colors leading-none"
          />
          <p className="text-[10px] text-titan-muted uppercase tracking-[0.3em] font-black mt-2">{user.whatsapp}</p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="bg-titan-card/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Globe size={20} className="text-titan-gold" />
                <span className="text-[11px] text-white font-black uppercase tracking-widest">Global Language</span>
            </div>
        </div>
        
        <div className="relative">
            <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center justify-between bg-black/60 p-5 rounded-[1.5rem] border border-white/5 text-xs font-black text-white transition-all hover:border-titan-gold/40"
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{currentLang.flag}</span>
                    <span className="uppercase tracking-[0.2em]">{currentLang.name}</span>
                </div>
                <ChevronDown size={18} className={`text-titan-muted transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
                <div className="absolute top-full left-0 w-full mt-3 bg-titan-dark border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onUpdateLanguage(lang.code as Language);
                                    setShowLangMenu(false);
                                }}
                                className={`w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${user.language === lang.code ? 'bg-titan-gold/5' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.language === lang.code ? 'text-titan-gold' : 'text-white'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {user.language === lang.code && <Check size={14} className="text-titan-gold" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="bg-titan-card rounded-[2.5rem] p-8 border border-titan-gold/20 relative overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-[10px] text-titan-muted uppercase tracking-[0.3em] block mb-2 font-black">Licence_Protocol</span>
            <h3 className="text-2xl font-black text-titan-gold italic tracking-tighter flex items-center gap-3">
              <Shield size={24} />
              {user.planType === 'FREE_TRIAL' ? 'FREE TRIAL' : 'TITAN PRO'}
            </h3>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border bg-titan-gold/10 text-titan-gold border-titan-gold/30">
            ENCRYPTED
          </div>
        </div>

        <button onClick={onUpgradeClick} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-titan-goldLight transition-all active:scale-95 shadow-xl">
          UPGRADE_ACCOUNT
        </button>
      </div>

      {isOwner && (
          <div className="bg-red-900/10 border border-red-500/30 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-6">
              <div className="flex items-center gap-3 text-red-500">
                  <Lock size={20} />
                  <h3 className="font-black text-xs uppercase tracking-[0.2em]">CEO TERMINAL - ACCESS CODES</h3>
              </div>
              <p className="text-[9px] text-red-200/40 uppercase font-black italic">Apenas você pode ver este estoque de chaves mestras.</p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-3 custom-scrollbar">
                  {Object.entries(ACTIVATION_CODES).map(([code, days]) => (
                      <button key={code} onClick={() => handleCopyCode(code)} className="w-full flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/5 hover:border-titan-gold transition-all group">
                          <div className="text-left">
                              <p className="text-[11px] font-mono font-black text-white group-hover:text-titan-gold uppercase tracking-widest">{code}</p>
                              <p className="text-[9px] text-titan-muted uppercase font-bold mt-1">{days} DIAS</p>
                          </div>
                          {copiedCode === code ? <Check size={16} className="text-titan-green" /> : <Copy size={16} className="text-titan-muted" />}
                      </button>
                  ))}
              </div>
          </div>
      )}

      <div className="bg-titan-card/40 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-titan-dark flex items-center justify-center border border-white/5 shadow-lg"><CloudLightning size={24} className="text-titan-gold" /></div>
              <div>
                  <p className="text-[10px] text-white font-black uppercase tracking-widest leading-none">OS_Core v3.1</p>
                  <p className="text-[8px] text-titan-muted uppercase font-bold mt-1 tracking-tighter">AES-256 SINCRONIZED</p>
              </div>
          </div>
          <button onClick={() => {setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1500);}} disabled={isSyncing} className="p-3 text-titan-gold hover:bg-titan-gold/10 rounded-full transition-all">
              <RefreshCw size={24} className={isSyncing ? 'animate-spin' : ''} />
          </button>
      </div>
    </div>
  );
};

export default Profile;
