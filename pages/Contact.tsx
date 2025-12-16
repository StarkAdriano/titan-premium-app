import React from 'react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '../constants';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-titan-card rounded-full flex items-center justify-center mx-auto mb-4 border border-titan-gold/30">
          <HelpCircle size={32} className="text-titan-gold" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Precisa de Ajuda?</h2>
        <p className="text-sm text-titan-muted max-w-xs mx-auto">
          Para dúvidas, suporte técnico ou informações sobre os cursos e o app Titan Premium.
        </p>
      </div>

      <div className="space-y-4">
        <a 
          href={`mailto:${CONTACT_EMAIL}`}
          className="block bg-titan-card border border-titan-card hover:border-titan-gold/50 p-5 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-titan-dark flex items-center justify-center group-hover:bg-titan-gold transition-colors">
              <Mail size={18} className="text-white group-hover:text-black" />
            </div>
            <span className="font-bold text-white text-lg">E-mail</span>
          </div>
          <p className="text-titan-muted text-sm ml-14">{CONTACT_EMAIL}</p>
        </a>

        <a 
          href={CONTACT_WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-titan-card border border-titan-card hover:border-titan-green/50 p-5 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-titan-dark flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <MessageCircle size={18} className="text-white group-hover:text-black" />
            </div>
            <span className="font-bold text-white text-lg">WhatsApp</span>
          </div>
          <p className="text-titan-muted text-sm ml-14">{CONTACT_WHATSAPP}</p>
          <div className="mt-4 ml-14">
             <span className="text-[10px] font-bold bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">
               Recomendado para resposta rápida
             </span>
          </div>
        </a>
      </div>
      
      <div className="mt-12 text-center">
         <p className="text-[10px] text-titan-muted">Titan Premium © {new Date().getFullYear()}</p>
         <p className="text-[10px] text-titan-muted/50">Desenvolvido com excelência.</p>
      </div>
    </div>
  );
};

export default Contact;