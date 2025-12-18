
import React, { useState, useRef } from 'react';
import { UserProfile, Language } from '../types';
import { translations, languages } from '../i18n';
import { 
  Shield, 
  UserCircle, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  Camera,
  Globe,
  ChevronDown,
  Zap,
  CheckCircle2
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
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

  const handleForceReload = async () => {
    setSyncStatus('syncing');
    try {
        // CORREÇÃO: Verificação defensiva para evitar o erro "Invalid State" em ambientes restritos
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            try {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const r of regs) await r.unregister();
            } catch (swError) {
                console.warn('Service Worker unregistration skipped:', swError);
            }
        }
        
        if (window.caches) {
            const keys = await caches.keys();
            for (const k of keys) await caches.delete(k);
        }
        
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) { 
        console.error('Cache clearing error:', e); 
    }
    
    setSyncStatus('success');
    
    setTimeout(() => {
        // CORREÇÃO: Redireciona para a URL atual com um cache-buster (timestamp)
        // Isso garante que o recarregamento funcione corretamente em subpastas e force nova versão
        const currentUrl = window.location.href.split('?')[0];
        const cacheBuster = `?v=${new Date().getTime()}`;
        window.location.replace(currentUrl + cacheBuster);
    }, 1200);
  };

  const currentLang = languages.find(l => l.code === user.language) || languages[0];

  return (
    <div className="p-6 space-y-6 pb-32 bg-titan-darker">
      
      {/* SEÇÃO DE IDIOMA - INTEGRADA AO FLUXO (Z-INDEX ISOLADO) */}
      <div className="bg-titan-card/40 border border-white/5 rounded-[2.5rem] p-5 relative z-50 shadow-lg">
        <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
                <Globe size={14} className="text-titan-gold" />
                <span className="text-[9px] text-white font-black uppercase tracking-widest">{t.global_lang}</span>
            </div>
        </div>
        <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)} 
              className="w-full flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 text-xs font-black text-white active:scale-95 transition-all"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentLang.flag}</span>
                    <span className="uppercase tracking-widest">{currentLang.name}</span>
                </div>
                <ChevronDown size={16} className={`text-titan-muted transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            {showLangMenu && (
                <div className="absolute top-full left-0 w-full mt-2 bg-titan-dark border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden backdrop-blur-xl">
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

      {/* HEADER DE PERFIL */}
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

      {/* SYNC BUTTON */}
      <div className={`border rounded-[2.5rem] p-6 space-y-4 transition-all duration-500 shadow-xl ${syncStatus === 'success' ? 'bg-titan-green/10 border-titan-green/40' : 'bg-red-600/5 border-red-600/20'}`}>
          <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${syncStatus === 'success' ? 'bg-titan-green' : 'bg-red-600'}`}>
                {syncStatus === 'success' ? <CheckCircle2 size={20} className="text-white" /> : <RefreshCw size={20} className={`text-white ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />}
              </div>
              <div className="flex-1">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                    {syncStatus === 'success' ? t.sync_success : t.sync_button}
                  </h3>
                  <p className="text-[8px] text-titan-muted uppercase font-black mt-1 tracking-tighter italic">{t.sync_desc}</p>
              </div>
          </div>
          <button 
            onClick={handleForceReload} 
            disabled={syncStatus !== 'idle'}
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${
                syncStatus === 'success' ? 'bg-titan-green text-white' : 'bg-white text-black'
            }`}
          >
            {syncStatus === 'idle' && 'SINCRONIZAR AGORA'}
            {syncStatus === 'syncing' && 'PROCESSANDO...'}
            {syncStatus === 'success' && 'REINICIANDO...'}
            <Zap size={14} />
          </button>
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
