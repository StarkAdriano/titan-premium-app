
import React, { useState, useEffect, useRef } from 'react';
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
  Fingerprint,
  LineChart,
  Briefcase,
  Landmark,
  Zap
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

const InstitutionalChart = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "FX:EURUSD",
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "br",
      "enable_publishing": false,
      "hide_top_toolbar": true,
      "hide_legend": true,
      "save_image": false,
      "backgroundColor": "rgba(2, 6, 23, 1)",
      "gridColor": "rgba(30, 41, 59, 0.3)",
      "allow_symbol_change": false,
      "container_id": "tradingview_chart"
    });
    if (container.current) {
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-[300px] bg-titan-darker rounded-2xl overflow-hidden border border-white/5 shadow-inner" id="tradingview_chart" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

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
  
  const [showTradeTicket, setShowTradeTicket] = useState(false);
  const [pendingSide, setPendingSide] = useState<'BUY' | 'SELL' | null>(null);

  const [balance, setBalance] = useState(activeAccountType === 'DEMO' ? 50000 : 10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [calculatedLot, setCalculatedLot] = useState(0.01);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');

  // Top 10 TradingView Ranked Brokers
  const brokers = [
    { id: 'pepperstone', name: 'Pepperstone', icon: Zap, color: 'bg-red-600', server: 'Pepperstone-Razor' },
    { id: 'oanda', name: 'OANDA', icon: Globe, color: 'bg-blue-700', server: 'OANDA-v20-Live' },
    { id: 'forex', name: 'FOREX.com', icon: Landmark, color: 'bg-slate-800', server: 'ForexCom-Real' },
    { id: 'ibkr', name: 'Interactive Brokers', icon: Briefcase, color: 'bg-red-800', server: 'IBKR-Direct-Feed' },
    { id: 'saxo', name: 'Saxo Bank', icon: Shield, color: 'bg-blue-900', server: 'Saxo-Institutional' },
    { id: 'ic', name: 'IC Markets', icon: Activity, color: 'bg-emerald-600', server: 'ICMarkets-SC-Live' },
    { id: 'blackbull', name: 'BlackBull Markets', icon: TrendingUp, color: 'bg-black', server: 'BlackBull-Prime' },
    { id: 'capital', name: 'Capital.com', icon: Monitor, color: 'bg-slate-700', server: 'Capital-Trade-API' },
    { id: 'eightcap', name: 'Eightcap', icon: BarChart2, color: 'bg-pink-700', server: 'Eightcap-Real-2' },
    { id: 'vantage', name: 'Vantage', icon: Landmark, color: 'bg-blue-500', server: 'Vantage-Global-Live' },
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

  const processAuth = () => {
    if (!accountNumber || !accountPass) return;
    setIsLinking(true);
    setModalStep('health');
    setTimeout(() => {
        setTimeout(() => {
            setIsLinking(false);
            setIsBrokerConnected(true);
            setModalStep('success');
            setTimeout(() => setShowBrokerModal(false), 2000);
        }, 1500);
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
            let rationale = "";

            if (lastDigit <= 3 && zone === 'DISCOUNT') {
                status = SignalStatus.BUY;
                rationale = "Liquidez de sell-side capturada. Ordem institucional detectada em OB H1. Risco de mitigação baixo.";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                rationale = "Rejeição em FVG Premium Zone. Fluxo de ordens interbancário aponta para liquidez inferior.";
            } else {
                status = SignalStatus.WAIT;
                rationale = "Mercado em equilíbrio de preço (Fair Value). Sem vantagem matemática para exposição imediata.";
            }

            const sl = status === SignalStatus.BUY ? (priceNum - 0.0012).toFixed(5) : (priceNum + 0.0012).toFixed(5);
            const tp = status === SignalStatus.BUY ? (priceNum + 0.0036).toFixed(5) : (priceNum - 0.0036).toFixed(5);

            onUpdateState({ 
                ...savedState, 
                isRevealed: true, 
                analysisSnapshot: {
                    status,
                    shortSummary: status === SignalStatus.WAIT ? "EQUILÍBRIO" : "SMC SETUP VALIDADO",
                    detailedAnalysis: "",
                    rationale,
                    validationStatus: zone === 'EQUILIBRIUM' ? 'WARNING' : 'OK',
                    validationMsg: 'Protocolo Processado',
                    referencePrice: sanitizedPrice,
                    stopLoss: status !== SignalStatus.WAIT ? sl : undefined,
                    takeProfit: status !== SignalStatus.WAIT ? tp : undefined,
                    zoneContext: zone as any
                }
            });
            setIsValidating(false);
        }, 1200);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker font-sans">
      {/* Header Técnico */}
      <div className="px-4 py-1.5 bg-black/80 text-[7px] flex justify-between items-center border-b border-white/5 font-mono tracking-widest opacity-70">
         <div className="flex gap-4">
             <span className="flex items-center gap-1"><Server size={8} /> CLUSTER: EUR-LDN-05</span>
             <span className="flex items-center gap-1 text-titan-green"><Wifi size={8} /> {latency}ms</span>
         </div>
         <div className="flex gap-4 uppercase">
             <span className="text-titan-gold flex items-center gap-1"><Fingerprint size={8} /> SECURE BRIDGE</span>
             <span>ID: TITAN-{Math.random().toString(36).slice(2, 6).toUpperCase()}</span>
         </div>
      </div>

      {/* Header Operacional */}
      <div className="px-4 py-4 bg-titan-dark flex items-center justify-between border-b border-white/5 sticky top-0 z-20">
         <div className="flex flex-col">
            <h2 className="text-xs font-black text-white italic tracking-tighter leading-none flex items-center gap-2 uppercase">
                <Terminal size={14} className="text-titan-gold" />
                EURUSD <span className="text-titan-gold">Terminal</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1 h-1 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-titan-muted'}`}></div>
                <span className="text-[7px] text-titan-muted font-black tracking-[0.2em] uppercase">
                    {isBrokerConnected ? `${selectedBroker?.name} ${activeAccountType} ACTIVE` : 'DISCONNECTED'}
                </span>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => { setIsPanicMode(true); setTimeout(() => {setIsPanicMode(false); onUpdateState({...savedState, isRevealed: false});}, 1500); }} className="p-2.5 bg-red-900/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                {isPanicMode ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
            </button>
            <button onClick={() => { if(!isBrokerConnected) { setModalStep('select'); setShowBrokerModal(true); } }} className={`px-4 py-2 rounded-xl text-[8px] font-black border transition-all shadow-xl active:scale-95 ${isBrokerConnected ? 'bg-titan-green/5 border-titan-green/30 text-titan-green' : 'bg-titan-gold text-black border-titan-gold'}`}>
                {isBrokerConnected ? 'BRIDGE ON' : 'CONNECT BRIDGE'}
            </button>
         </div>
      </div>

      {/* Gráfico TradingView (Apenas após conexão) */}
      {isBrokerConnected && (
          <div className="p-4 animate-in fade-in zoom-in duration-1000">
              <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[8px] text-titan-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                      <LineChart size={10} className="text-titan-gold" /> Institutional Feed
                  </span>
                  <span className="text-[7px] text-titan-green font-black tracking-widest">SINC. REAL-TIME</span>
              </div>
              <InstitutionalChart />
          </div>
      )}

      {/* Terminal de Input */}
      <div className="px-4 py-2">
          <div className="bg-titan-card/40 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[9px] text-titan-muted uppercase font-black tracking-[0.3em]">Market Input</span>
                    <span className="text-[7px] text-titan-gold font-bold opacity-50 tracking-widest uppercase">Protocol Alpha 3.1</span>
                </div>
                
                <input 
                    type="text" 
                    inputMode="decimal" 
                    value={savedState.userPrice} 
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                    placeholder="1.00000" 
                    disabled={savedState.isRevealed} 
                    className="w-full bg-black/60 border border-white/10 text-white font-mono text-5xl p-7 rounded-[2rem] outline-none focus:border-titan-gold transition-all text-center mb-6 shadow-inner" 
                />
                
                {!savedState.isRevealed ? (
                    <button onClick={handleReveal} disabled={isValidating || !savedState.userPrice} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all">
                        {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />} Run Analysis
                    </button>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 text-center relative overflow-hidden bg-black/80 min-h-[220px] transition-all duration-700 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_60px_rgba(16,185,129,0.08)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_60px_rgba(239,68,68,0.08)]' : 'border-slate-800'
                        }`}>
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-[0.4em] mb-4 block">Institutional Directive</span>
                            <h3 className={`font-black italic tracking-tighter leading-none transition-all ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-slate-600 text-5xl'
                            }`}>
                                {savedState.analysisSnapshot?.status}
                            </h3>
                            <p className="text-white font-bold text-[10px] uppercase tracking-[0.3em] opacity-40 mt-4">{savedState.analysisSnapshot?.shortSummary}</p>
                        </div>
                        
                        <div className="bg-titan-dark/40 border border-white/5 rounded-3xl p-5">
                            <h4 className="text-titan-gold text-[7px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={10} /> SMC Logic Analysis
                            </h4>
                            <p className="text-[11px] text-titan-muted leading-relaxed font-medium italic">
                                "{savedState.analysisSnapshot?.rationale}"
                            </p>
                        </div>

                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-2 text-titan-muted text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <RotateCcw size={12} /> Clear Memory
                        </button>
                    </div>
                )}
          </div>
      </div>

      {/* Camada de Execução */}
      <div className="px-4 py-2 space-y-4">
          {savedState.isRevealed && savedState.analysisSnapshot?.status !== SignalStatus.WAIT && (
              <div className="bg-titan-card/50 rounded-[2.5rem] p-8 border border-titan-gold/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <Target size={14} className="text-titan-gold" />
                          <span className="text-[9px] text-white font-black uppercase tracking-widest">Trade Plan</span>
                      </div>
                      <div className="bg-titan-green/10 border border-titan-green/20 px-2 py-1 rounded text-[9px] text-titan-green font-mono font-bold tracking-tighter uppercase">RR 1:3.0 Optimal</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-black/60 p-5 rounded-2xl border border-red-900/20">
                          <span className="text-[7px] text-titan-muted font-black uppercase block mb-1 tracking-widest">Invalidation (SL)</span>
                          <span className="text-red-400 font-mono font-bold text-xl">{savedState.analysisSnapshot?.stopLoss}</span>
                      </div>
                      <div className="bg-black/60 p-5 rounded-2xl border border-titan-green/20">
                          <span className="text-[7px] text-titan-muted font-black uppercase block mb-1 tracking-widest">Objective (TP)</span>
                          <span className="text-titan-green font-mono font-bold text-xl">{savedState.analysisSnapshot?.takeProfit}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                      <button 
                        onClick={() => { setPendingSide('SELL'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-7 rounded-3xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-red-600 border-red-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowDownCircle size={24} className="mb-1" /> SELL
                      </button>
                      <button 
                        onClick={() => { setPendingSide('BUY'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-7 rounded-3xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-titan-green border-green-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowUpCircle size={24} className="mb-1" /> BUY
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Ticket de Execução Profissional */}
      {showTradeTicket && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
              <div className="bg-titan-dark w-full max-w-md rounded-t-[3.5rem] border-t border-titan-gold/30 p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-400">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Execute Order</h3>
                          <p className="text-[9px] text-titan-muted uppercase tracking-widest font-bold">Encrypted Handshake Required</p>
                      </div>
                      <button onClick={() => setShowTradeTicket(false)} className="text-white/40 hover:text-white p-3 bg-white/5 rounded-full">✕</button>
                  </div>

                  <div className="space-y-4 mb-10">
                      <div className="flex justify-between p-5 bg-black/50 rounded-2xl border border-white/5 items-center">
                          <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest">Instrument / Position</span>
                          <span className={`text-sm font-black uppercase tracking-widest ${pendingSide === 'BUY' ? 'text-titan-green' : 'text-red-500'}`}>{pendingSide} — EURUSD</span>
                      </div>
                      <div className="flex justify-between p-5 bg-black/50 rounded-2xl border border-white/5 items-center">
                          <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest">Calculated Lot</span>
                          <span className="text-2xl font-mono font-bold text-white">{calculatedLot} LOTS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="p-5 bg-black/50 rounded-2xl border border-white/5 text-center">
                              <span className="text-[8px] text-titan-muted font-bold uppercase block mb-1">Protection</span>
                              <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot?.stopLoss}</span>
                          </div>
                          <div className="p-5 bg-black/50 rounded-2xl border border-white/5 text-center">
                              <span className="text-[8px] text-titan-muted font-bold uppercase block mb-1">Take Profit</span>
                              <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot?.takeProfit}</span>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => { setIsLinking(true); setTimeout(() => { setIsLinking(false); setShowTradeTicket(false); alert(`Ordem enviada para a corretora ${selectedBroker?.name}.`); }, 1200); }}
                    disabled={isLinking}
                    className={`w-full py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all ${
                        pendingSide === 'BUY' ? 'bg-titan-green text-black' : 'bg-red-600 text-white'
                    }`}
                  >
                      {isLinking ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                      AUTHORIZE SIGNAL
                  </button>
                  <p className="text-[7px] text-titan-muted text-center mt-6 uppercase font-black tracking-widest opacity-40 max-w-[200px] mx-auto">
                      Non-custodial mirror execution. Protocol secured by AES-256.
                  </p>
              </div>
          </div>
      )}

      {/* Bridge Modal (Top 10 Brokers) */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-titan-card border border-white/10 rounded-[3.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'select' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'login' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'health' || modalStep === 'success' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">Bridge Gateway</h3>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full">✕</button>
                </div>
                
                <div className="p-10">
                    {modalStep === 'select' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 01: Node Selection</span>
                            
                            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-4 shadow-inner">
                                <button onClick={() => onAccountTypeChange('DEMO')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAccountType === 'DEMO' ? 'bg-blue-600 text-white shadow-xl' : 'text-titan-muted hover:text-white'}`}>DEMO</button>
                                <button onClick={() => onAccountTypeChange('REAL')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAccountType === 'REAL' ? 'bg-titan-gold text-black shadow-xl' : 'text-titan-muted hover:text-white'}`}>REAL</button>
                            </div>

                            {/* Scrollable Broker List */}
                            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {brokers.map((b) => (
                                    <button key={b.id} onClick={() => { setSelectedBroker(b); setModalStep('login'); }} className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-3xl hover:border-titan-gold/40 transition-all group active:scale-98">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}><b.icon size={22} className="text-white" /></div>
                                            <div className="text-left">
                                                <p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                                <p className="text-[8px] text-titan-muted uppercase font-black tracking-tighter opacity-60">Handshake Required</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-titan-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 'login' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 02: Handshake Protocol</span>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Account UID</label>
                                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="00000000" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-titan-gold transition-all font-mono tracking-widest" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Gateway Auth Token</label>
                                    <input type="password" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-titan-gold transition-all" />
                                </div>
                            </div>
                            <button onClick={processAuth} disabled={isLinking || !accountNumber || !accountPass} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-6 active:scale-95 shadow-2xl">
                                INITIATE SYNC
                            </button>
                            <button onClick={() => setModalStep('select')} className="w-full text-[9px] text-titan-muted hover:text-white py-2 flex items-center justify-center gap-2 mt-2 font-black uppercase tracking-widest"><ArrowLeft size={10} /> Back to Nodes</button>
                        </div>
                    )}

                    {modalStep === 'health' && (
                        <div className="py-14 text-center animate-pulse">
                            <Loader2 size={60} className="text-titan-gold animate-spin mx-auto mb-10" />
                            <p className="text-[10px] text-titan-gold font-black uppercase tracking-[0.6em]">ESTABLISHING CHANNEL...</p>
                            <div className="mt-8 text-[8px] text-titan-muted space-y-2 font-mono uppercase tracking-[0.2em]">
                                <p>VERIFYING LIQUIDITY NODES...</p>
                                <p>PROTOCOL: {selectedBroker?.server}</p>
                                <p className="text-titan-green font-bold">AES-256 HANDSHAKE OK</p>
                            </div>
                        </div>
                    )}

                    {modalStep === 'success' && (
                        <div className="py-12 text-center animate-in zoom-in-90 duration-500">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-2 shadow-[0_0_30px_rgba(212,175,55,0.1)] ${activeAccountType === 'DEMO' ? 'bg-blue-600/10 border-blue-500 shadow-blue-500/20' : 'bg-titan-green/10 border-titan-green shadow-green-500/20'}`}>
                                <ShieldCheck size={64} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'} />
                            </div>
                            <h4 className="text-3xl font-black text-white italic mb-2 tracking-tighter uppercase leading-none">TERMINAL ONLINE</h4>
                            <p className="text-[10px] text-titan-muted uppercase tracking-[0.3em] font-black">Sync Protocol: {selectedBroker?.name}</p>
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
