
import React, { useState, useRef } from 'react';
import { UserProfile, Language } from '../types';
import { translations, languages } from '../i18n';
import { 
  Shield, 
  UserCircle, 
  Lock, 
  Copy, 
  Check, 
  Camera,
  ChevronDown
} from 'lucide-react';
import { ACTIVATION_CODES } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpgradeClick: () => void;
  onUpdateLogo: (url: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateLanguage: (lang: Language) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpgradeClick, onUpdateLogo, onUpdateName, onUpdateLanguage }) => {
  const t = translations[user.language] || translations['pt'];
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    <div className="p-6 space-y-6 pb-32 bg-titan-darker">
      
      {/* CABEÇALHO COM FLEXBOX */}
      <div className="flex justify-between items-center bg-titan-card/40 border border-white/5 rounded-[2.5rem] p-5 shadow-lg">
          <div className="flex items-center gap-2">
              <div className="p-2 bg-titan-gold/10 rounded-lg">
                <Shield size={18} className="text-titan-gold" />
              </div>
              <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">Perfil</h1>
          </div>

          <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)} 
                className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-white active:scale-95 transition-all"
              >
                  <span className="text-base">{currentLang.flag}</span>
                  <span className="uppercase tracking-widest">{currentLang.code}</span>
                  <ChevronDown size={14} className={`text-titan-muted transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>
              {showLangMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-titan-dark border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden backdrop-blur-xl">
                      {languages.map((lang) => (
                          <button 
                            key={lang.code} 
                            onClick={() => { onUpdateLanguage(lang.code as Language); setShowLangMenu(false); }} 
                            className={`w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 last:border-0 ${user.language === lang.code ? 'bg-titan-gold/5' : ''}`}
                          >
                              <div className="flex items-center gap-3">
                                  <span className="text-xl">{lang.flag}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${user.language === lang.code ? 'text-titan-gold' : 'text-white'}`}>{lang.name}</span>
                              </div>
                              {user.language === lang.code && <Check size={14} className="text-titan-gold" />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* HEADER DE PERFIL (AVATAR E NOME) */}
      <div className="flex flex-col items-center pt-8 pb-8 bg-titan-dark/40 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-xl">
        <div className="relative mb-6 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-[2rem] bg-titan-card border-2 border-titan-gold/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-titan-gold">
             {user.logoUrl ? <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-titan-gold/40" />}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-titan-gold text-black p-2 rounded-lg shadow-lg">
            <Camera size={14} />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
        <div className="text-center px-6 w-full space-y-2">
          <input 
            type="text" 
            value={user.name} 
            onChange={(e) => onUpdateName(e.target.value)} 
            className="w-full text-xl font-black text-white italic tracking-tighter bg-transparent border-none text-center outline-none focus:text-titan-gold uppercase" 
          />
          <p className="text-[9px] text-titan-muted uppercase tracking-[0.2em] font-black opacity-60">{user.whatsapp}</p>
        </div>
      </div>

      <div className="bg-titan-card rounded-[2.5rem] p-7 border border-titan-gold/20 relative overflow-hidden shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[9px] text-titan-muted uppercase tracking-[0.3em] block mb-2 font-black">{t.license_protocol}</span>
            <h3 className="text-xl font-black text-titan-gold italic tracking-tighter flex items-center gap-2">
              <Shield size={20} />
              {user.planType === 'FREE_TRIAL' ? t.free_trial : t.titan_pro}
            </h3>
          </div>
        </div>
        <button onClick={onUpgradeClick} className="w-full bg-titan-gold text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] active:scale-95 shadow-xl">{t.upgrade_account}</button>
      </div>

      {isOwner && (
          <div className="bg-red-900/10 border border-red-500/30 rounded-[2.5rem] p-7 space-y-4">
              <div className="flex items-center gap-3 text-red-500">
                  <Lock size={18} />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">{t.ceo_terminal}</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {Object.entries(ACTIVATION_CODES).map(([code, days]) => (
                      <button key={code} onClick={() => handleCopyCode(code)} className="w-full flex items-center justify-between bg-black/60 p-4 rounded-xl border border-white/5 active:scale-95 transition-all group">
                          <div className="text-left">
                              <p className="text-[10px] font-mono font-black text-white group-hover:text-titan-gold uppercase tracking-widest">{code}</p>
                              <p className="text-[8px] text-titan-muted uppercase font-bold mt-0.5">{days} DAYS</p>
                          </div>
                          {copiedCode === code ? <Check size={14} className="text-titan-green" /> : <Copy size={14} className="text-titan-muted" />}
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default Profile;
