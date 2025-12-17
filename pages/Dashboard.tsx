
import React, { useState, useEffect } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  Shield, 
  Loader2,
  Lock,
  BarChart2, 
  Monitor, 
  Wifi,
  Activity,
  AlertTriangle,
  Skull,
  TrendingUp,
  Wallet,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Copy,
  Info,
  Target,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';

interface DashboardState {
    userPrice: string;
    isRevealed: boolean;
    analysisSnapshot: AnalysisResult | null;
    referencePrice: string;
    trendBias: 'BULLISH' | 'BEARISH';
}

interface DashboardProps {
  asset: Asset; 
  savedState: DashboardState;
  onUpdateState: (newState: DashboardState) => void;
  activeAccountType?: 'DEMO' | 'REAL';
  onAccountTypeChange: (type: 'DEMO' | 'REAL') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState, activeAccountType = 'REAL', onAccountTypeChange }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'login' | 'success'>('select');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [latency, setLatency] = useState(24);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Risk Engine States
  const [balance, setBalance] = useState(activeAccountType === 'DEMO' ? 50000 : 10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [calculatedLot, setCalculatedLot] = useState(0.01);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600', server: 'TradingView-Internal' },
    { id: 'mt5', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700', server: 'ICMarkets-Real15' },
    { id: 'exness', name: 'Exness Terminal', icon: Shield, color: 'bg-orange-600', server: 'Exness-Real10' },
    { id: 'ic', name: 'IC Markets', icon: Globe, color: 'bg-emerald-600', server: 'ICMarkets-Live20' },
  ];

  const PIP_VALUE = 10;

  useEffect(() => {
    if (savedState.analysisSnapshot?.stopLoss && savedState.userPrice) {
        const entry = parseFloat(savedState.userPrice.replace(',', '.'));
        const sl = parseFloat(savedState.analysisSnapshot.stopLoss);
        const distPips = Math.abs(entry - sl) * 10000;
        
        if (distPips > 0) {
            const riskAmount = balance * (riskPercent / 100);
            const lot = riskAmount / (distPips * PIP_VALUE);
            setCalculatedLot(Math.max(0.01, parseFloat(lot.toFixed(2))));
        }
    }
  }, [balance, riskPercent, savedState.analysisSnapshot, savedState.userPrice]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fix: Added missing processAuth function to handle bridge authentication simulation
  const processAuth = () => {
    if (!accountNumber || !accountPass) return;
    setIsLinking(true);
    // Simulate bridge authentication and connection delay
    setTimeout(() => {
      setIsLinking(false);
      setIsBrokerConnected(true);
      setModalStep('success');
      // Auto close the modal after showing success state for 2 seconds
      setTimeout(() => {
        setShowBrokerModal(false);
      }, 2000);
    }, 2000);
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    const priceNum = parseFloat(sanitizedPrice);
    if (!isNaN(priceNum)) {
        setIsValidating(true);
        setTimeout(() => {
            const lastDigit = Math.floor(priceNum * 100000) % 10;
            const equilibrium = 1.05500;
            const zone = priceNum > equilibrium + 0.0010 ? 'PREMIUM' : priceNum < equilibrium - 0.0010 ? 'DISCOUNT' : 'EQUILIBRIUM';
            
            let status = SignalStatus.WAIT;
            let summary = "";
            let explanation = "";

            if (lastDigit <= 3 && zone === 'DISCOUNT') {
                status = SignalStatus.BUY;
                summary = "SMC Setup: Rejeição em Order Block.";
                explanation = "O preço atingiu uma zona de desconto (Discount) onde grandes bancos costumam recomprar. Detectamos uma captura de liquidez prévia, indicando que a força vendedora se exauriu.";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                summary = "SMC Setup: Distribuição em FVG.";
                explanation = "Estamos em zona cara (Premium). O algoritmo interbancário deixou um desequilíbrio (Fair Value Gap) que acaba de ser mitigado. A expectativa é de retomada da tendência de baixa para buscar liquidez inferior.";
            } else {
                status = SignalStatus.WAIT;
                summary = "Mercado em Equilíbrio Institucional.";
                explanation = "O preço está no 'Fair Value' institucional. Não há vantagem matemática para entrar agora. Operar aqui é jogar contra a sorte. Aguardamos o preço sair deste range para buscar zonas de real interesse.";
            }

            const sl = status === SignalStatus.BUY ? (priceNum - 0.0012).toFixed(5) : (priceNum + 0.0012).toFixed(5);
            const tp = status === SignalStatus.BUY ? (priceNum + 0.0036).toFixed(5) : (priceNum - 0.0036).toFixed(5);

            onUpdateState({ 
                ...savedState, 
                isRevealed: true, 
                analysisSnapshot: {
                    status,
                    shortSummary: summary,
                    detailedAnalysis: explanation,
                    validationStatus: zone === 'EQUILIBRIUM' ? 'WARNING' : 'OK',
                    validationMsg: zone === 'EQUILIBRIUM' ? 'Aguardar Confirmação' : 'Setup Validado',
                    referencePrice: sanitizedPrice,
                    stopLoss: status !== SignalStatus.WAIT ? sl : undefined,
                    takeProfit: status !== SignalStatus.WAIT ? tp : undefined,
                    zoneContext: zone as any
                }
            });
            setIsValidating(false);
        }, 1500);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker">
      {/* Network Header */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 sticky top-0 z-20">
         <div className="flex flex-col">
            <h2 className="text-sm font-black text-white italic tracking-tighter leading-none">EURUSD <span className="text-titan-gold text-[10px] ml-1">INSTITUTIONAL</span></h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse' : 'bg-titan-muted'}`}></div>
                <span className="text-[8px] text-titan-muted font-bold tracking-widest">
                    {isBrokerConnected ? `${selectedBroker?.name || 'BRIDGE'} ${activeAccountType}` : 'BRIDGE DISCONNECTED'}
                </span>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => { setIsPanicMode(true); setTimeout(() => {setIsPanicMode(false); onUpdateState({...savedState, isRevealed: false});}, 1500); }} className="p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90">
                {isPanicMode ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
            </button>
            <button onClick={() => { if(!isBrokerConnected) { setModalStep('select'); setShowBrokerModal(true); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all active:scale-95 shadow-lg ${isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold'}`}>
                {isBrokerConnected ? (activeAccountType === 'DEMO' ? 'DEMO SYNC' : 'REAL SYNC') : 'CONECTAR BRIDGE'}
            </button>
         </div>
      </div>

      {/* Balance Unit */}
      <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-gold'} />
                  <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">Saldo Atual</span>
              </div>
              <div>
                  <span className="text-xl font-mono font-bold text-white">$ {balance.toLocaleString()}</span>
                  <p className={`text-[8px] uppercase font-bold ${activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'}`}>{activeAccountType} ACCOUNT</p>
              </div>
          </div>
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-titan-gold" />
                  <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">Risco p/ Trade</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                  {[0.5, 1, 2].map(r => (
                      <button key={r} onClick={() => setRiskPercent(r)} className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${riskPercent === r ? 'bg-titan-gold text-black' : 'bg-white/5 text-titan-muted'}`}>{r}%</button>
                  ))}
              </div>
          </div>
      </div>

      {/* Input de Preço */}
      <div className="px-4 mb-4">
          <div className="bg-titan-card/40 rounded-3xl p-6 border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] text-titan-muted uppercase font-black tracking-widest">Preço da sua Corretora</span>
                    {isBrokerConnected && <span className="text-[9px] text-titan-green font-bold flex items-center gap-1"><Wifi size={10} /> SINC. ATIVA</span>}
                </div>
                <input type="text" inputMode="decimal" value={savedState.userPrice} onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} placeholder="0.00000" disabled={savedState.isRevealed} className="w-full bg-black/60 border border-white/10 text-white font-mono text-4xl p-6 rounded-2xl outline-none focus:border-titan-gold transition-all text-center mb-4" />
                {!savedState.isRevealed ? (
                    <button onClick={handleReveal} disabled={isValidating || !savedState.userPrice} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all">
                        {isValidating ? <Loader2 className="animate-spin" size={24} /> : <Shield size={24} />} Processar Análise
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 text-center relative overflow-hidden bg-black/80 min-h-[200px] transition-all duration-500 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-titan-gold'
                        }`}>
                            <span className="text-[10px] text-titan-gold font-bold uppercase tracking-[0.4em] mb-4 block">Titan Signal</span>
                            <h3 className={`font-black italic tracking-tighter leading-none transition-all ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-titan-gold text-5xl'
                            }`}>
                                {savedState.analysisSnapshot?.status}
                            </h3>
                            <p className="text-white font-bold text-xs uppercase opacity-80 mt-2">{savedState.analysisSnapshot?.shortSummary}</p>
                        </div>
                        
                        {/* Box de Explicação Educacional */}
                        <div className="bg-titan-dark/60 border border-white/5 rounded-2xl p-4">
                            <h4 className="text-titan-gold text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info size={12} /> Por que este sinal?
                            </h4>
                            <p className="text-[11px] text-titan-muted leading-relaxed italic">
                                "{savedState.analysisSnapshot?.detailedAnalysis}"
                            </p>
                        </div>

                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-3 text-titan-muted text-xs uppercase font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <RotateCcw size={14} /> Novo Input
                        </button>
                    </div>
                )}
          </div>
      </div>

      {/* Trading Plan (SL/TP Sugeridos) */}
      {savedState.isRevealed && savedState.analysisSnapshot?.status !== SignalStatus.WAIT && (
          <div className="px-4 mb-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-titan-card/50 border border-titan-gold/20 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-titan-gold" />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Plano Sugerido (SMC)</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-[9px] text-titan-muted font-bold uppercase tracking-widest block ml-1">Stop Loss</span>
                        <div className="bg-black/40 border border-red-500/30 p-4 rounded-xl flex items-center justify-between group">
                            <span className="text-red-400 font-mono font-bold text-lg">{savedState.analysisSnapshot?.stopLoss}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot!.stopLoss!, 'sl')} className="text-titan-muted hover:text-white">
                                {copiedField === 'sl' ? <CheckCircle2 size={16} className="text-titan-green" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[9px] text-titan-muted font-bold uppercase tracking-widest block ml-1">Take Profit</span>
                        <div className="bg-black/40 border border-titan-green/30 p-4 rounded-xl flex items-center justify-between">
                            <span className="text-titan-green font-mono font-bold text-lg">{savedState.analysisSnapshot?.takeProfit}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot!.takeProfit!, 'tp')} className="text-titan-muted hover:text-white">
                                {copiedField === 'tp' ? <CheckCircle2 size={16} className="text-titan-green" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-[10px] px-1">
                    <span className="text-titan-muted font-bold uppercase">Risco:Retorno</span>
                    <span className="text-titan-gold font-mono font-bold">1 : 3.0</span>
                </div>
              </div>
          </div>
      )}

      {/* Execution Box */}
      <div className="p-4">
          <div className={`bg-titan-card/50 rounded-3xl p-6 border shadow-inner ${activeAccountType === 'DEMO' ? 'border-blue-500/20' : 'border-white/5'}`}>
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest block mb-1">Cálculo de Lote</span>
                    <h4 className="text-white font-black text-2xl flex items-center gap-2">
                        {calculatedLot.toFixed(2)} <span className="text-titan-gold text-xs">LOTS</span>
                    </h4>
                  </div>
                  <div className="text-right">
                      <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest block mb-1">Risco Final</span>
                      <span className="text-red-400 font-mono font-bold">$ {(balance * (riskPercent / 100)).toFixed(2)}</span>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button disabled={!isBrokerConnected || !savedState.analysisSnapshot?.stopLoss} className={`py-6 rounded-2xl font-black text-3xl italic tracking-tighter border-b-4 transition-all shadow-xl flex flex-col items-center justify-center ${isBrokerConnected && savedState.analysisSnapshot?.stopLoss ? 'bg-titan-red border-red-900 text-white active:scale-95' : 'bg-white/5 text-titan-muted opacity-20'}`}>
                    <ArrowDownCircle size={24} className="mb-1" />
                    SELL
                  </button>
                  <button disabled={!isBrokerConnected || !savedState.analysisSnapshot?.stopLoss} className={`py-6 rounded-2xl font-black text-3xl italic tracking-tighter border-b-4 transition-all shadow-xl flex flex-col items-center justify-center ${isBrokerConnected && savedState.analysisSnapshot?.stopLoss ? 'bg-titan-green border-green-900 text-white active:scale-95' : 'bg-white/5 text-titan-muted opacity-20'}`}>
                    <ArrowUpCircle size={24} className="mb-1" />
                    BUY
                  </button>
              </div>
          </div>
      </div>

      {/* Bridge Modal */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-titan-card border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Bridge Sync</h3>
                        <p className="text-[8px] text-titan-muted uppercase tracking-[0.2em]">Institutional API Connection</p>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white/40 hover:text-white transition-colors p-2">✕</button>
                </div>
                <div className="p-6">
                    {modalStep === 'select' && (
                        <div className="space-y-4">
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-2">
                                <button onClick={() => onAccountTypeChange('DEMO')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeAccountType === 'DEMO' ? 'bg-blue-600 text-white shadow-lg' : 'text-titan-muted hover:text-white'}`}>DEMO</button>
                                <button onClick={() => onAccountTypeChange('REAL')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeAccountType === 'REAL' ? 'bg-titan-gold text-black shadow-lg' : 'text-titan-muted hover:text-white'}`}>REAL</button>
                            </div>
                            <div className="space-y-3">
                                {brokers.map((b) => (
                                    <button key={b.id} onClick={() => { setSelectedBroker(b); setModalStep('login'); }} className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/40 transition-all group active:scale-98">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${b.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}><b.icon size={22} className="text-white" /></div>
                                            <div className="text-left"><p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p><p className="text-[9px] text-titan-muted uppercase tracking-tighter">Gateway Institutional</p></div>
                                        </div>
                                        <ChevronRight size={18} className="text-titan-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {modalStep === 'login' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                <selectedBroker.icon size={16} className="text-titan-gold" />
                                <span className="text-[10px] text-white font-bold uppercase">Login {selectedBroker.name}</span>
                            </div>
                            <div className="space-y-3">
                                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account ID" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-titan-gold transition-all" />
                                <input type="password" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} placeholder="Terminal Key" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-titan-gold transition-all" />
                            </div>
                            <button onClick={processAuth} disabled={isLinking || !accountNumber || !accountPass} className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 active:scale-95 shadow-xl">
                                {isLinking ? <Loader2 className="animate-spin mx-auto" size={20} /> : `INICIAR SYNC ${activeAccountType}`}
                            </button>
                            <button onClick={() => setModalStep('select')} className="w-full text-[10px] text-titan-muted hover:text-white py-2 flex items-center justify-center gap-2"><ArrowLeft size={10} /> Voltar</button>
                        </div>
                    )}
                    {modalStep === 'success' && (
                        <div className="py-10 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 shadow-lg ${activeAccountType === 'DEMO' ? 'bg-blue-600/20 border-blue-500 shadow-blue-500/30' : 'bg-titan-green/20 border-titan-green shadow-green-500/30'}`}><ShieldCheck size={40} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'} /></div>
                            <h4 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase leading-none">{activeAccountType} ONLINE</h4>
                            <p className="text-[10px] text-titan-muted uppercase tracking-widest font-bold">Bridge Sincronizada com {selectedBroker?.name}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
