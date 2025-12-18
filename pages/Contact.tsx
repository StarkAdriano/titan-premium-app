
import React from 'react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '../constants';
import { translations } from '../i18n';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

const Contact: React.FC<{ language: string }> = ({ language }) => {
  const t = translations[language] || translations['pt'];

  return (
    <div className="p-4 space-y-6 bg-titan-darker min-h-full">
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-titan-card rounded-full flex items-center justify-center mx-auto mb-4 border border-titan-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <HelpCircle size={32} className="text-titan-gold" />
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{t.support_title}</h2>
        <p className="text-xs text-titan-muted max-w-xs mx-auto leading-relaxed">
          {t.support_desc}
        </p>
      </div>

      <div className="space-y-4 px-2">
        <a href={`mailto:${CONTACT_EMAIL}`} className="block bg-titan-card border border-white/5 hover:border-titan-gold/50 p-6 rounded-[2rem] transition-all group shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-titan-dark flex items-center justify-center group-hover:bg-titan-gold transition-colors shadow-lg">
              <Mail size={20} className="text-white group-hover:text-black" />
            </div>
            <span className="font-black text-white text-lg uppercase tracking-tighter italic">E-mail</span>
          </div>
          <p className="text-titan-muted text-sm ml-16">{CONTACT_EMAIL}</p>
        </a>

        <a href={CONTACT_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="block bg-titan-card border border-white/5 hover:border-titan-green/50 p-6 rounded-[2rem] transition-all group shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-titan-dark flex items-center justify-center group-hover:bg-green-500 transition-colors shadow-lg">
              <MessageCircle size={20} className="text-white group-hover:text-black" />
            </div>
            <span className="font-black text-white text-lg uppercase tracking-tighter italic">WhatsApp</span>
          </div>
          <p className="text-titan-muted text-sm ml-16">{CONTACT_WHATSAPP}</p>
          <div className="mt-4 ml-16">
             <span className="text-[9px] font-black bg-green-900/30 text-green-400 px-3 py-1.5 rounded-lg border border-green-900/50 uppercase tracking-widest animate-pulse">
               {t.response_immediate}
             </span>
          </div>
        </a>
      </div>
      
      <div className="mt-20 text-center space-y-1 pb-10">
         <p className="text-[11px] font-bold text-titan-muted">{t.copyright}</p>
         <p className="text-[10px] text-titan-muted/60 font-medium">
           {t.developed_by}
         </p>
      </div>
    </div>
  );
};

export default Contact;
