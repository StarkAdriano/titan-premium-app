import React, { useState } from 'react';
import { ShieldAlert, Lock, ExternalLink, MessageCircle, Key, Unlock } from 'lucide-react';
import { PRODUCTS, CONTACT_WHATSAPP_LINK, ACTIVATION_CODES } from '../constants';

interface ExpiredLockScreenProps {
    onUnlock: (code: string) => void;
}

const ExpiredLockScreen: React.FC<ExpiredLockScreenProps> = ({ onUnlock }) => {
  // Find the subscription product
  const subProduct = PRODUCTS.find(p => p.priority === 4) || PRODUCTS[0];
  
  const [showUnlockInput, setShowUnlockInput] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockAttempt = (e: React.FormEvent) => {
      e.preventDefault();
      const code = activationCode.trim();
      
      // Check if code exists in our valid list
      if (ACTIVATION_CODES[code]) {
          onUnlock(code); // Pass valid code to parent to check for REUSE
      } else {
          setErrorMsg('Código inexistente. Verifique com o suporte.');
          setActivationCode('');
      }
  };

  return (
    <div className="min-h-screen bg-titan-darker flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-red-900/10 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-titan-gold/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-sm w-full bg-titan-card border border-red-900/50 p-8 rounded-2xl shadow-2xl">
        
        <div className="w-20 h-20 bg-titan-dark rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <Lock size={40} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Acesso Expirado</h1>
        <p className="text-sm text-gray-400 mb-6">
          Sua assinatura ou período de teste encerrou. Para continuar recebendo as leituras institucionais do <strong className="text-titan-gold">Titan Premium</strong>, renove seu plano.
        </p>

        <div className="bg-black/40 rounded-lg p-4 mb-6 border border-white/5">
          <p className="text-xs text-titan-muted uppercase tracking-wider mb-1">Status da Conta</p>
          <div className="flex items-center justify-center gap-2 text-red-500 font-bold">
            <ShieldAlert size={16} />
            BLOQUEADA
          </div>
        </div>

        {!showUnlockInput ? (
            <div className="space-y-3">
            <a 
                href={subProduct.stripeLink}
                className="block w-full bg-titan-gold text-black py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-titan-goldLight transition-all shadow-lg flex items-center justify-center gap-2"
            >
                Renovar Agora
                <ExternalLink size={16} />
            </a>
            
            <p className="text-[10px] text-titan-muted">Valor: R$ 99,90/mês</p>

            <div className="pt-4 border-t border-white/5 mt-4 space-y-4">
                <div>
                    <p className="text-xs text-gray-400 mb-2">Já realizou o pagamento?</p>
                    <a 
                    href={CONTACT_WHATSAPP_LINK}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                    >
                    <MessageCircle size={14} />
                    Pedir código de desbloqueio
                    </a>
                </div>

                <button 
                    onClick={() => setShowUnlockInput(true)}
                    className="text-[10px] text-titan-muted hover:text-titan-gold underline flex items-center justify-center gap-1 w-full"
                >
                    <Key size={10} />
                    Inserir código do mês
                </button>
            </div>
            </div>
        ) : (
            <form onSubmit={handleUnlockAttempt} className="animate-in fade-in slide-in-from-bottom-4">
                <div className="mb-4 text-left">
                    <label className="text-xs text-titan-gold font-bold uppercase mb-1 block">Código de Ativação</label>
                    <input 
                        type="text" 
                        value={activationCode}
                        onChange={(e) => {
                            setActivationCode(e.target.value);
                            setErrorMsg('');
                        }}
                        placeholder="EX: TITAN-M01"
                        className="w-full bg-titan-dark border border-titan-gold/30 rounded p-3 text-white text-center font-mono uppercase tracking-widest focus:border-titan-gold outline-none"
                    />
                    {errorMsg && <p className="text-[10px] text-red-400 mt-2 text-center">{errorMsg}</p>}
                </div>
                <button 
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3 rounded mb-3 flex items-center justify-center gap-2 hover:bg-gray-200"
                >
                    <Unlock size={16} /> Liberar Acesso
                </button>
                <button 
                    type="button"
                    onClick={() => setShowUnlockInput(false)}
                    className="text-xs text-titan-muted underline"
                >
                    Voltar
                </button>
            </form>
        )}

      </div>

      <p className="absolute bottom-6 text-[10px] text-titan-muted/30">
        ID do Dispositivo: {Math.random().toString(36).substr(2, 9).toUpperCase()}
      </p>
    </div>
  );
};

export default ExpiredLockScreen;