
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { INSTAGRAM_HANDLE, INSTAGRAM_LINK } from '../constants';
import { translations, languages } from '../i18n';
import { Check, ArrowRight, Instagram, ShieldAlert, Fingerprint, Globe, ChevronDown } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (data: Partial<UserProfile>) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [followedInstagram, setFollowedInstagram] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('pt');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = translations[currentLang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().toLowerCase() === 'titanmaster') {
        onComplete({ name: 'Desenvolvedor Titan', whatsapp: 'N/A - CEO Access', language: currentLang });
        return;
    }
    if (name && whatsapp && followedInstagram) {
      onComplete({ name, whatsapp, language: currentLang });
    }
  };

  const handleInstagramClick = () => { window.open(INSTAGRAM_LINK, '_blank'); };
  const isFormValid = (name.length > 2 && whatsapp.length > 8 && followedInstagram);
  const isAdminBypass = name.trim().toLowerCase() === 'titanmaster';
  const selectedLangData = languages.find(l => l.code === currentLang)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-titan-card border border-titan-gold/30 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
        
        {/* BARRA DE IDIOMA DEDICADA NO TOPO - EVITA SOBREPOSIÇÃO */}
        <div className="bg-titan-dark border-b border-white/5 px-8 py-4 flex justify-between items-center relative z-[60]">
           <span className="text-[8px] text-titan-muted uppercase tracking-[0.3em] font-black">Region Select</span>
           <div className="relative">
             <button 
               type="button"
               onClick={() => setShowLangMenu(!showLangMenu)}
               className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[9px] font-black text-white uppercase active:scale-95"
             >
               <Globe size={11} className="text-titan-gold" />
               {selectedLangData.flag}
               <ChevronDown size={10} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
             </button>
             
             {showLangMenu && (
               <div className="absolute top-full right-0 mt-2 w-40 bg-titan-dark border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden">
                  {languages.map(l => (
                    <button 
                      key={l.code}
                      type="button"
                      onClick={() => { setCurrentLang(l.code as Language); setShowLangMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-[9px] font-black text-white uppercase border-b border-white/5 last:border-0"
                    >
                      <span>{l.name}</span>
                      <span>{l.flag}</span>
                    </button>
                  ))}
               </div>
             )}
           </div>
        </div>

        <div className="bg-gradient-to-br from-titan-dark to-black p-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
             <ShieldAlert size={120} className="text-titan-gold" />
          </div>
          <h2 className="text-2xl font-black text-titan-gold italic tracking-tighter mb-1 uppercase leading-none">{t.welcome}</h2>
          <p className="text-[8px] text-titan-muted uppercase tracking-[0.3em] font-black">Titan Institutional Protocol</p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-titan-gold tracking-widest ml-1">{t.name_placeholder}</label>
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-white/5 focus:border-titan-gold/50 rounded-2xl p-4 text-sm text-white font-bold outline-none transition-all"
                placeholder="Ex: John Wick"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {!isAdminBypass && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-titan-gold tracking-widest ml-1">{t.whatsapp_placeholder}</label>
                    <input
                      type="tel"
                      required
                      className="w-full bg-black/40 border border-white/5 focus:border-titan-gold/50 rounded-2xl p-4 text-sm text-white font-bold outline-none transition-all"
                      placeholder="+1 234..."
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase text-titan-gold tracking-widest ml-1">{t.security_val}</label>
                     <button
                      type="button"
                      onClick={handleInstagramClick}
                      className="w-full flex items-center justify-between bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20 text-white p-4 rounded-2xl group active:scale-95 transition-all"
                     >
                       <div className="flex items-center gap-3">
                         <Instagram size={20} className="text-pink-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{t.follow_insta} {INSTAGRAM_HANDLE}</span>
                       </div>
                       <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </button>

                     <div 
                       className={`flex items-center gap-4 bg-black/40 p-4 rounded-2xl border transition-all cursor-pointer ${followedInstagram ? 'border-titan-gold/40' : 'border-white/5'}`} 
                       onClick={() => setFollowedInstagram(!followedInstagram)}
                     >
                       <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${followedInstagram ? 'bg-titan-gold border-titan-gold' : 'border-white/10 bg-transparent'}`}>
                          {followedInstagram && <Check size={16} className="text-black" />}
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${followedInstagram ? 'text-white' : 'text-titan-muted'}`}>
                          {t.confirm_follow}
                       </span>
                     </div>
                  </div>
                </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid && !isAdminBypass}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                isFormValid || isAdminBypass
                  ? 'bg-titan-gold text-black shadow-xl active:scale-95' 
                  : 'bg-white/5 text-titan-muted cursor-not-allowed grayscale'
              }`}
            >
              {t.start_trial}
              <Fingerprint size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
