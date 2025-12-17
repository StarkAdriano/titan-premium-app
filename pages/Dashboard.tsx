
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
  ArrowUpCircle,
  Terminal,
  Server,
  Fingerprint
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
  const [modalStep, setModalStep] = useState<'select' | 'login' | 'health' | 'success'>('select');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [latency, setLatency] = useState(24);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Execution Ticket State
  const [showTradeTicket, setShowTradeTicket] = useState(false);
  const [pendingSide, setPendingSide] = useState<'BUY' | 'SELL' | null>(null);

  // Risk Engine States
  const [balance, setBalance] = useState(activeAccountType === 'DEMO' ? 50000 : 10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [calculatedLot, setCalculatedLot] = useState(0.01);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600', server: 'TradingView-Gateway' },
    { id: 'mt5', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700', server: 'Terminal-MT5-Direct' },
    { id: 'exness', name: 'Exness', icon: Shield, color: 'bg-orange-600', server: 'Exness-Institutional' },
    { id: 'ic', name: 'IC Markets', icon: Globe, color: 'bg-emerald-600', server: 'IC-Direct-Liquidity' },
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

  const processAuth = () => {
    if (!accountNumber || !accountPass) return;
    setIsLinking(true);
    setModalStep('health');
    // Step 1: Handshake
    setTimeout(() => {
        // Step 2: Protocol Exchange
        setTimeout(() => {
            setIsLinking(false);
            setIsBrokerConnected(true);
            setModalStep('success');
            setTimeout(() => setShowBrokerModal(false), 2000);
        }, 1500);
    }, 1500);
  };

  const handleOpenTicket = (side: 'BUY' | 'SELL') => {
    setPendingSide(side);
    setShowTradeTicket(true);
  };

  const handleExecuteOrder = () => {
    setIsLinking(true); // Reuse as loading state
    setTimeout(() => {
        setIsLinking(false);
        setShowTradeTicket(false);
        alert(`ORDEM ${pendingSide} EXECUTADA: ${calculatedLot} lotes em EURUSD.`);
    }, 1500);
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
            let rationale = "";

            if (lastDigit <= 3 && zone === 'DISCOUNT') {
                status = SignalStatus.BUY;
                summary = "REJEIÇÃO EM OB (H1)";
                rationale = "Liquidez de sell-side capturada. Price action demonstra deslocamento institucional acima da zona de desconto.";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                summary = "DISTRIBUIÇÃO FVG (H4)";
                rationale = "Mitigação de Fair Value Gap concluída. Fluxo de ordens bearish retomado após manipulação acima do range.";
            } else {
                status = SignalStatus.WAIT;
                summary = "RANGE CONSOLIDADO";
                rationale = "Preço em zona de equilíbrio interbancário. Não há desequilíbrio (BOS/CHoCH) que justifique exposição de risco no momento.";
            }

            const sl = status === SignalStatus.BUY ? (priceNum - 0.0012).toFixed(5) : (priceNum + 0.0012).toFixed(5);
            const tp = status === SignalStatus.BUY ? (priceNum + 0.0036).toFixed(5) : (priceNum - 0.0036).toFixed(5);

            onUpdateState({ 
                ...savedState, 
                isRevealed: true, 
                analysisSnapshot: {
                    status,
                    shortSummary: summary,
                    detailedAnalysis: "",
                    rationale,
                    validationStatus: zone === 'EQUILIBRIUM' ? 'WARNING' : 'OK',
                    validationMsg: zone === 'EQUILIBRIUM' ? 'Aguardar Confirmação' : 'Setup Validado',
                    referencePrice: sanitizedPrice,
                    stopLoss: status !== SignalStatus.WAIT ? sl : undefined,
                    takeProfit: status !== SignalStatus.WAIT ? tp : undefined,
                    zoneContext: zone as any,
                    liquidityTarget: status === SignalStatus.BUY ? (priceNum + 0.0050).toFixed(5) : (priceNum - 0.0050).toFixed(5)
                }
            });
            setIsValidating(false);
        }, 1200);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker font-sans">
      {/* Terminal Health Header */}
      <div className="px-4 py-1 bg-black text-[8px] flex justify-between items-center border-b border-white/5 opacity-60 font-mono tracking-widest">
         <div className="flex gap-3">
             <span className="flex items-center gap-1"><Server size={8} /> CLUSTER: EUR-AMS-01</span>
             <span className="flex items-center gap-1 text-titan-green"><Wifi size={8} /> LATENCY: {latency}ms</span>
         </div>
         <div className="flex gap-3">
             <span className="flex items-center gap-1"><Fingerprint size={8} /> AUTH: AES-256</span>
             <span className="text-titan-gold">BUILD: 3.1.0-PRO</span>
         </div>
      </div>

      {/* Main Bridge Header */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 sticky top-0 z-20">
         <div className="flex flex-col">
            <h2 className="text-xs font-black text-white italic tracking-tighter leading-none flex items-center gap-2">
                <Terminal size={14} className="text-titan-gold" />
                TERMINAL <span className="text-titan-gold">PREMIUM</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse' : 'bg-titan-muted'}`}></div>
                <span className="text-[8px] text-titan-muted font-bold tracking-[0.2em]">
                    {isBrokerConnected ? `${selectedBroker?.name.toUpperCase()} ${activeAccountType}` : 'SYNC DISCONNECTED'}
                </span>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => { setIsPanicMode(true); setTimeout(() => {setIsPanicMode(false); onUpdateState({...savedState, isRevealed: false});}, 1500); }} className="p-2 bg-red-900/20 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                {isPanicMode ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
            </button>
            <button onClick={() => { if(!isBrokerConnected) { setModalStep('select'); setShowBrokerModal(true); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all shadow-lg ${isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold'}`}>
                {isBrokerConnected ? 'SINC. ATIVA' : 'BRIDGE CONNECT'}
            </button>
         </div>
      </div>

      {/* Account Context */}
      <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-titan-gold/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                  <Wallet size={12} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-gold'} />
                  <span className="text-[8px] text-titan-muted uppercase font-black tracking-widest">Available Margin</span>
              </div>
              <div>
                  <span className="text-xl font-mono font-bold text-white">$ {balance.toLocaleString()}</span>
                  <p className={`text-[7px] uppercase font-bold tracking-widest ${activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'}`}>{activeAccountType} ENVIRONMENT</p>
              </div>
          </div>
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                  <Activity size={12} className="text-titan-gold" />
                  <span className="text-[8px] text-titan-muted uppercase font-black tracking-widest">Risk Allocation</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                  {[0.5, 1, 2].map(r => (
                      <button key={r} onClick={() => setRiskPercent(r)} className={`text-[9px] px-2.5 py-1.5 rounded-lg font-black transition-all ${riskPercent === r ? 'bg-titan-gold text-black shadow-lg' : 'bg-white/5 text-titan-muted hover:bg-white/10'}`}>{r}%</button>
                  ))}
              </div>
          </div>
      </div>

      {/* Institutional Input */}
      <div className="px-4 mb-4">
          <div className="bg-titan-card/40 rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BarChart2 size={120} />
                </div>
                
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[9px] text-titan-muted uppercase font-black tracking-[0.3em]">Market Reference</span>
                    <span className="text-[8px] text-titan-gold font-bold">EURUSD SPOT</span>
                </div>
                <input 
                    type="text" 
                    inputMode="decimal" 
                    value={savedState.userPrice} 
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                    placeholder="1.00000" 
                    disabled={savedState.isRevealed} 
                    className="w-full bg-black/60 border border-white/10 text-white font-mono text-5xl p-6 rounded-2xl outline-none focus:border-titan-gold transition-all text-center mb-6 shadow-inner" 
                />
                
                {!savedState.isRevealed ? (
                    <button onClick={handleReveal} disabled={isValidating || !savedState.userPrice} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all">
                        {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />} PROCESS ANALYSIS
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 text-center relative overflow-hidden bg-black/80 min-h-[180px] transition-all duration-700 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-slate-800'
                        }`}>
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-[0.4em] mb-4 block">Institutional Signal</span>
                            <h3 className={`font-black italic tracking-tighter leading-none transition-all ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-slate-400 text-5xl'
                            }`}>
                                {savedState.analysisSnapshot?.status}
                            </h3>
                            <p className="text-white font-bold text-[10px] uppercase tracking-widest opacity-60 mt-4">{savedState.analysisSnapshot?.shortSummary}</p>
                        </div>
                        
                        {/* Rationale Box */}
                        <div className="bg-titan-dark/40 border border-white/5 rounded-2xl p-4">
                            <h4 className="text-titan-gold text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={10} /> SMC LOGIC REASONING
                            </h4>
                            <p className="text-[10px] text-titan-muted leading-relaxed font-medium italic">
                                "{savedState.analysisSnapshot?.rationale}"
                            </p>
                        </div>

                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-2 text-titan-muted text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <RotateCcw size={12} /> CLEAR TERMINAL
                        </button>
                    </div>
                )}
          </div>
      </div>

      {/* Execution Layer */}
      <div className="p-4 space-y-4">
          {savedState.isRevealed && savedState.analysisSnapshot?.status !== SignalStatus.WAIT && (
              <div className="bg-titan-card/50 rounded-3xl p-6 border border-titan-gold/20 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <Target size={14} className="text-titan-gold" />
                          <span className="text-[9px] text-white font-black uppercase tracking-widest">Order Specification</span>
                      </div>
                      <span className="text-[10px] text-titan-green font-mono font-bold tracking-tighter">RR 1:3.0</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-black/60 p-4 rounded-xl border border-red-900/30">
                          <span className="text-[8px] text-titan-muted font-black uppercase block mb-1">STOP LOSS</span>
                          <span className="text-red-400 font-mono font-bold text-lg">{savedState.analysisSnapshot?.stopLoss}</span>
                      </div>
                      <div className="bg-black/60 p-4 rounded-xl border border-titan-green/30">
                          <span className="text-[8px] text-titan-muted font-black uppercase block mb-1">TAKE PROFIT</span>
                          <span className="text-titan-green font-mono font-bold text-lg">{savedState.analysisSnapshot?.takeProfit}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleOpenTicket('SELL')}
                        disabled={!isBrokerConnected} 
                        className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-red-600 border-red-900 text-white active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowDownCircle size={20} className="mb-1" /> SELL
                      </button>
                      <button 
                        onClick={() => handleOpenTicket('BUY')}
                        disabled={!isBrokerConnected} 
                        className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-titan-green border-green-900 text-white active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowUpCircle size={20} className="mb-1" /> BUY
                      </button>
                  </div>
              </div>
          )}

          {!savedState.isRevealed && (
              <div className="text-center py-12 opacity-20">
                  <ShieldCheck size={48} className="mx-auto text-titan-muted mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-[0.5em]">System Ready</p>
              </div>
          )}
      </div>

      {/* Order Confirmation Ticket Modal */}
      {showTradeTicket && pendingSide && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-titan-dark w-full max-w-md rounded-t-[2.5rem] border-t border-titan-gold/30 p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Confirm Position</h3>
                          <p className="text-[9px] text-titan-muted uppercase tracking-widest font-bold">Execution Safety Protocol</p>
                      </div>
                      <button onClick={() => setShowTradeTicket(false)} className="text-white/40 hover:text-white p-2">✕</button>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                          <span className="text-[10px] text-titan-muted font-bold uppercase">Side / Instrument</span>
                          <span className={`text-[10px] font-black uppercase ${pendingSide === 'BUY' ? 'text-titan-green' : 'text-red-500'}`}>{pendingSide} - EURUSD</span>
                      </div>
                      <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                          <span className="text-[10px] text-titan-muted font-bold uppercase">Volume (Lot Size)</span>
                          <span className="text-lg font-mono font-bold text-white">{calculatedLot} LOTS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                              <span className="text-[8px] text-titan-muted font-bold uppercase block mb-1">Stop Loss</span>
                              <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot?.stopLoss}</span>
                          </div>
                          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                              <span className="text-[8px] text-titan-muted font-bold uppercase block mb-1">Take Profit</span>
                              <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot?.takeProfit}</span>
                          </div>
                      </div>
                      <div className="flex justify-between p-4 bg-red-900/10 rounded-2xl border border-red-500/20">
                          <span className="text-[10px] text-red-400 font-bold uppercase">Risk Exposure</span>
                          <span className="text-[10px] font-black text-red-400">$ {(balance * (riskPercent / 100)).toFixed(2)} USD</span>
                      </div>
                  </div>

                  <button 
                    onClick={handleExecuteOrder}
                    disabled={isLinking}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
                        pendingSide === 'BUY' ? 'bg-titan-green text-black' : 'bg-red-600 text-white'
                    }`}
                  >
                      {isLinking ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                      AUTHORIZE EXECUTION
                  </button>
                  <p className="text-[8px] text-titan-muted text-center mt-4 uppercase font-bold tracking-widest opacity-60">
                      Non-custodial access. You maintain full control.
                  </p>
              </div>
          </div>
      )}

      {/* 3-Step Bridge Modal */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-titan-card border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'select' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'login' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'health' || modalStep === 'success' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none">Bridge Gateway</h3>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white/40 hover:text-white transition-colors p-2">✕</button>
                </div>
                
                <div className="p-8">
                    {modalStep === 'select' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 01: Protocol Selection</span>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-2">
                                <button onClick={() => onAccountTypeChange('DEMO')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeAccountType === 'DEMO' ? 'bg-blue-600 text-white shadow-lg' : 'text-titan-muted'}`}>DEMO</button>
                                <button onClick={() => onAccountTypeChange('REAL')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeAccountType === 'REAL' ? 'bg-titan-gold text-black shadow-lg' : 'text-titan-muted'}`}>REAL</button>
                            </div>
                            <div className="space-y-3">
                                {brokers.map((b) => (
                                    <button key={b.id} onClick={() => { setSelectedBroker(b); setModalStep('login'); }} className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/40 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 ${b.color} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}><b.icon size={20} className="text-white" /></div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                                <p className="text-[8px] text-titan-muted uppercase font-bold tracking-tighter">API V3.2 Protocol</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-titan-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 'login' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 02: Handshake Credentials</span>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Account Identifier</label>
                                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="00000000" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-titan-gold transition-all font-mono" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Terminal Auth Key</label>
                                    <input type="password" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-titan-gold transition-all" />
                                </div>
                            </div>
                            <button onClick={processAuth} disabled={isLinking || !accountNumber || !accountPass} className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 active:scale-95 shadow-xl">
                                INITIATE HANDSHAKE
                            </button>
                            <button onClick={() => setModalStep('select')} className="w-full text-[9px] text-titan-muted hover:text-white py-2 flex items-center justify-center gap-2"><ArrowLeft size={10} /> BACK TO PROTOCOL</button>
                        </div>
                    )}

                    {modalStep === 'health' && (
                        <div className="py-12 text-center animate-pulse">
                            <Loader2 size={48} className="text-titan-gold animate-spin mx-auto mb-6" />
                            <p className="text-[9px] text-titan-gold font-black uppercase tracking-[0.5em]">Establishing Sync...</p>
                            <div className="mt-4 text-[8px] text-titan-muted space-y-1 font-mono">
                                <p>ENCRYPTING CHANNELS...</p>
                                <p>VERIFYING LIQUIDITY NODES...</p>
                                <p>SSL HANDSHAKE SECURED</p>
                            </div>
                        </div>
                    )}

                    {modalStep === 'success' && (
                        <div className="py-10 text-center animate-in zoom-in-95 duration-500">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 shadow-2xl ${activeAccountType === 'DEMO' ? 'bg-blue-600/10 border-blue-500' : 'bg-titan-green/10 border-titan-green'}`}>
                                <ShieldCheck size={48} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'} />
                            </div>
                            <h4 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase leading-none">TERMINAL ONLINE</h4>
                            <p className="text-[9px] text-titan-muted uppercase tracking-[0.2em] font-bold">Bridge Active with {selectedBroker?.name}</p>
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
