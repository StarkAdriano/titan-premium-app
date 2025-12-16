import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INSTAGRAM_HANDLE, INSTAGRAM_LINK } from '../constants';
import { Check, ArrowRight, Instagram, ShieldAlert, Fingerprint } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (data: Partial<UserProfile>) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [followedInstagram, setFollowedInstagram] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ADMIN BACKDOOR / BYPASS
    if (name.trim().toLowerCase() === 'titanmaster') {
        onComplete({ 
            name: 'Desenvolvedor Titan', 
            whatsapp: 'N/A - Admin Access' 
        });
        return;
    }

    if (name && whatsapp && followedInstagram) {
      onComplete({ name, whatsapp });
    }
  };

  const handleInstagramClick = () => {
    window.open(INSTAGRAM_LINK, '_blank');
  };

  const isFormValid = (name.length > 2 && whatsapp.length > 8 && followedInstagram);
  const isAdminBypass = name.trim().toLowerCase() === 'titanmaster';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-titan-card border border-titan-gold/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-titan-dark to-titan-card p-6 border-b border-titan-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <ShieldAlert size={60} className="text-titan-gold" />
          </div>
          <h2 className="text-2xl font-bold text-titan-gold mb-1">Acesso Restrito</h2>
          <p className="text-xs text-titan-muted uppercase tracking-wider">
            Titan Premium Setup
          </p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Para liberar seus <strong className="text-white">30 dias gratuitos</strong>, preencha seus dados reais e siga nosso perfil oficial.
          </p>

          <div className="bg-red-900/10 border border-red-900/30 p-2 rounded mb-6 flex items-start gap-2">
            <Fingerprint size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-300 leading-tight">
               <strong>Atenção:</strong> Seu dispositivo será vinculado ao seu período de teste. Tentativas de fraude ou múltiplos cadastros bloquearão o acesso permanentemente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-titan-gold mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full bg-titan-dark border border-titan-card focus:border-titan-gold rounded-lg p-3 text-white placeholder-gray-600 outline-none transition-colors"
                placeholder="Nome e Sobrenome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {!isAdminBypass && (
                <>
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-semibold uppercase text-titan-gold mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-titan-dark border border-titan-card focus:border-titan-gold rounded-lg p-3 text-white placeholder-gray-600 outline-none transition-colors"
                    placeholder="(DDD) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>

                <div className="pt-2 pb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                   <label className="block text-xs font-semibold uppercase text-titan-gold mb-2">Validação de Segurança</label>
                   
                   <button
                    type="button"
                    onClick={handleInstagramClick}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 border border-pink-500/30 text-pink-100 py-3 rounded-lg transition-all mb-3 group shadow-lg"
                   >
                     <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                     <span className="font-semibold">Seguir {INSTAGRAM_HANDLE}</span>
                   </button>

                   <div 
                     className={`flex items-center gap-3 bg-titan-dark p-3 rounded-lg border cursor-pointer transition-colors ${followedInstagram ? 'border-titan-gold bg-titan-gold/10' : 'border-titan-card hover:border-gray-500'}`} 
                     onClick={() => setFollowedInstagram(!followedInstagram)}
                   >
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${followedInstagram ? 'bg-titan-gold border-titan-gold' : 'border-gray-500 bg-transparent'}`}>
                        {followedInstagram && <Check size={14} className="text-black" />}
                     </div>
                     <span className={`text-xs select-none ${followedInstagram ? 'text-titan-gold font-bold' : 'text-gray-400'}`}>
                        Confirmo que segui o perfil.
                     </span>
                   </div>
                </div>
                </>
            )}

            <button
              type="submit"
              disabled={!isFormValid && !isAdminBypass}
              className={`w-full py-4 rounded-lg font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                isFormValid || isAdminBypass
                  ? 'bg-titan-gold text-black hover:bg-titan-goldLight shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-100' 
                  : 'bg-titan-card text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {isAdminBypass ? 'Acesso Admin' : 'Ativar Teste Único'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;