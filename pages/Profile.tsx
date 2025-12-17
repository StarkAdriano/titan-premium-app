
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Shield, 
  Clock, 
  UserCircle, 
  CalendarDays, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  CloudLightning,
  Info
} from 'lucide-react';
import { ACTIVATION_CODES } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpgradeClick }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Sincronizado agora');
  
  // Check if current user is the Admin (Backdoor access)
  const isAdmin = user.name === 'Desenvolvedor Titan';

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleForceUpdate = () => {
    setIsSyncing(true);
    // Simula a busca por novos scripts no servidor (PWA Update logic)
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Versão v1.2.0 instalada');
      // No mundo real, aqui poderíamos disparar um window.location.reload(true) 
      // para limpar o cache do navegador se houvesse uma nova versão detectada.
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center gap-4 py-4 border-b border-titan-card">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-titan-card to-titan-dark border-2 border-titan-gold flex items-center justify-center">
          <UserCircle size={32} className="text-titan-gold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-titan-muted">{user.whatsapp}</p>
        </div>
      </div>

      {/* Plan Status */}
      <div className="bg-titan-card rounded-xl p-6 border border-titan-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-titan-gold/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <span className="text-xs text-titan-muted uppercase tracking-wider block mb-1">Status de Licença</span>
            <h3 className="text-xl font-bold text-titan-gold flex items-center gap-2">
              <Shield size={18} />
              {user.planType === 'FREE_TRIAL' ? 'Teste Gratuito' : 'Titan PRO'}
            </h3>
          </div>
          <div className="text-right">
             <span className={`text-[10px] font-bold px-2 py-1 rounded ${user.planType === 'FREE_TRIAL' ? 'bg-green-500/20 text-green-400' : 'bg-titan-gold/20 text-titan-gold'}`}>
               CONTA REAL
             </span>
          </div>
        </div>

        <div className="space-y-3 mb-6 relative z-10">
          {user.planType === 'FREE_TRIAL' ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock size={14} /> Ativado em
                </span>
                <span className="text-white">{user.trialStartDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock size={14} /> Expira em
                </span>
                <span className="text-white">{user.trialEndDate}</span>
              </div>
            </>
          ) : (
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <CalendarDays size={14} /> Vencimento
                </span>
                <span className="text-white font-bold">{user.subscriptionEndDate || 'Vitalício'}</span>
              </div>
          )}
        </div>

        <button 
          onClick={onUpgradeClick}
          className="w-full bg-titan-gold text-black py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-titan-goldLight transition-all active:scale-95 shadow-lg"
        >
          {user.planType === 'FREE_TRIAL' ? 'Garantir Acesso PRO' : 'Renovar Licença'}
        </button>
      </div>

      {/* App Version & Sync (The Update UI) */}
      <div className="bg-titan-card/40 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-titan-dark flex items-center justify-center border border-white/5">
                    <CloudLightning size={16} className="text-titan-gold" />
                </div>
                <div>
                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">Sistema Titan Core</p>
                    <p className="text-[9px] text-titan-muted uppercase tracking-tighter">{lastSync}</p>
                </div>
            </div>
            <button 
                onClick={handleForceUpdate}
                disabled={isSyncing}
                className="p-2 text-titan-gold hover:bg-titan-gold/10 rounded-full transition-colors active:rotate-180 duration-500"
            >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-center">
                <p className="text-[8px] text-titan-muted uppercase font-bold mb-0.5">Build</p>
                <p className="text-[10px] text-white font-mono">1.2.0-STABLE</p>
            </div>
            <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-center">
                <p className="text-[8px] text-titan-muted uppercase font-bold mb-0.5">Sincronização</p>
                <p className="text-[10px] text-titan-green font-bold">ATIVA</p>
            </div>
        </div>
      </div>

      {/* --- SECRET ADMIN PANEL --- */}
      {isAdmin && (
          <div className="border-t-2 border-red-900/50 pt-6 mt-6 animate-in slide-in-from-bottom-10">
              <div className="flex items-center gap-2 mb-4 text-red-500">
                  <Lock size={18} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Painel Administrativo (CEO)</h3>
              </div>
              
              <div className="bg-black/40 border border-red-900/30 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 mb-3">
                      Estoque de Códigos (Clique para copiar):
                  </p>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(ACTIVATION_CODES).map(([code, days]) => (
                          <button
                              key={code}
                              onClick={() => handleCopyCode(code)}
                              className="w-full flex items-center justify-between bg-titan-card p-3 rounded border border-titan-card hover:border-titan-gold transition-colors group"
                          >
                              <div className="flex flex-col items-start">
                                  <span className="text-xs font-mono font-bold text-white group-hover:text-titan-gold transition-colors">
                                      {code}
                                  </span>
                                  <span className="text-[10px] text-titan-muted">{days} dias</span>
                              </div>
                              <div className="text-titan-gold">
                                  {copiedCode === code ? <Check size={16} /> : <Copy size={16} className="opacity-50 group-hover:opacity-100" />}
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
          <Info size={18} className="text-blue-400 shrink-0" />
          <p className="text-[9px] text-blue-200/70 leading-relaxed italic">
            Como um Web App Premium, o Titan se atualiza automaticamente em segundo plano. Caso note alguma lentidão, use o botão de sincronização acima.
          </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 pb-4">
        <div className="border-t border-titan-card/50 pt-4">
            <p className="text-[10px] text-titan-muted text-center uppercase font-bold tracking-widest">
                Titan Institutional Terminal
            </p>
            <p className="text-[9px] text-titan-muted/50 text-center mt-1">
                ID Sessão: {Math.random().toString(36).substr(2, 6).toUpperCase()}
            </p>
        </div>
      </div>

    </div>
  );
};

export default Profile;
