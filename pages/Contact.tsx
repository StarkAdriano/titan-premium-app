
import React from 'react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '../constants';
import { translations } from '../i18n';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

const Contact: React.FC<{ language: string }> = ({ language }) => {
  const t = translations[language] || translations['pt'];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-titan-card rounded-full flex items-center justify-center mx-auto mb-4 border border-titan-gold/30">
          <HelpCircle size={32} className="text-titan-gold" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Suporte Titan</h2>
        <p className="text-sm text-titan-muted max-w-xs mx-auto">
          Para dúvidas sobre ativação, renovação ou suporte técnico especializado.
        </p>
      </div>

      <div className="space-y-4">
        <a 
          href={`mailto:${CONTACT_EMAIL}`}
          className="block bg-titan-card border border-titan-card hover:border-titan-gold/50 p-6 rounded-3xl transition-all group"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-titan-dark flex items-center justify-center group-hover:bg-titan-gold transition-colors shadow-lg">
              <Mail size={20} className="text-white group-hover:text-black" />
            </div>
            <span className="font-black text-white text-lg uppercase tracking-tighter">E-mail</span>
          </div>
          <p className="text-titan-muted text-sm ml-16">{CONTACT_EMAIL}</p>
        </a>

        <a 
          href={CONTACT_WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-titan-card border border-titan-card hover:border-titan-green/50 p-6 rounded-3xl transition-all group"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-titan-dark flex items-center justify-center group-hover:bg-green-500 transition-colors shadow-lg">
              <MessageCircle size={20} className="text-white group-hover:text-black" />
            </div>
            <span className="font-black text-white text-lg uppercase tracking-tighter">WhatsApp</span>
          </div>
          <p className="text-titan-muted text-sm ml-16">{CONTACT_WHATSAPP}</p>
          <div className="mt-4 ml-16">
             <span className="text-[9px] font-black bg-green-900/30 text-green-400 px-3 py-1.5 rounded-lg border border-green-900/50 uppercase tracking-widest">
               Resposta Imediata
             </span>
          </div>
        </a>
      </div>
      
      <div className="mt-20 text-center space-y-1">
         <p className="text-[11px] font-bold text-titan-muted">Titan Premium © 2025</p>
         <p className="text-[10px] text-titan-muted/60 font-medium">
           {t.developed_by}
         </p>
      </div>
    </div>
  );
};

export default Contact;
