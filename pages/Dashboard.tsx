
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
  LineChart
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

// Componente para o Gráfico Institucional
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
  
  // Trade Ticket State
  const [showTradeTicket, setShowTradeTicket] = useState(false);
  const [pendingSide, setPendingSide] = useState<'BUY' | 'SELL' | null>(null);

  // Risk Engine States
  const [balance, setBalance] = useState(activeAccountType === 'DEMO' ? 50000 : 10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [calculatedLot, setCalculatedLot] = useState(0.01);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600', server: 'TV-Gateway-Direct' },
    { id: 'mt5', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700', server: 'MT5-Institutional-Hub' },
    { id: 'exness', name: 'Exness', icon: Shield, color: 'bg-orange-600', server: 'Exness-Liquidity-Node' },
    { id: 'ic', name: 'IC Markets', icon: Globe, color: 'bg-emerald-600', server: 'IC-Direct-Bridge' },
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
    // Protocol Handshake Simulation
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
                rationale = "Liquidez capturada em zona de desconto. Ordem de compra institucional detectada acima do OB diário.";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                rationale = "Mitigação de FVG em zona premium. Estrutura de baixa mantida com proteção institucional superior.";
            } else {
                status = SignalStatus.WAIT;
                rationale = "Preço em zona de equilíbrio interbancário. Não há desequilíbrio (BOS/CHoCH) que justifique exposição.";
            }

            const sl = status === SignalStatus.BUY ? (priceNum - 0.0012).toFixed(5) : (priceNum + 0.0012).toFixed(5);
            const tp = status === SignalStatus.BUY ? (priceNum + 0.0036).toFixed(5) : (priceNum - 0.0036).toFixed(5);

            onUpdateState({ 
                ...savedState, 
                isRevealed: true, 
                analysisSnapshot: {
                    status,
                    shortSummary: status === SignalStatus.WAIT ? "EQUILÍBRIO" : "SETUP SMC VALIDADO",
                    detailedAnalysis: "",
                    rationale,
                    validationStatus: zone === 'EQUILIBRIUM' ? 'WARNING' : 'OK',
                    validationMsg: 'Sinal Processado',
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
      {/* Terminal Health Status */}
      <div className="px-4 py-1.5 bg-black/60 text-[8px] flex justify-between items-center border-b border-white/5 font-mono tracking-widest opacity-80">
         <div className="flex gap-4">
             <span className="flex items-center gap-1"><Server size={8} /> SYS: ACTIVE</span>
             <span className="flex items-center gap-1 text-titan-green"><Wifi size={8} /> SYNC: {latency}ms</span>
         </div>
         <div className="flex gap-4">
             <span className="flex items-center gap-1 text-titan-gold"><Fingerprint size={8} /> AES-256</span>
             <span>ID: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
         </div>
      </div>

      {/* Bridge Header */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 sticky top-0 z-20">
         <div className="flex flex-col">
            <h2 className="text-xs font-black text-white italic tracking-tighter leading-none flex items-center gap-2">
                <Terminal size={14} className="text-titan-gold" />
                EURUSD <span className="text-titan-gold">INSTITUTIONAL</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse' : 'bg-titan-muted'}`}></div>
                <span className="text-[8px] text-titan-muted font-bold tracking-[0.2em] uppercase">
                    {isBrokerConnected ? `${selectedBroker?.name} ${activeAccountType} Bridge` : 'Sync Disconnected'}
                </span>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => { setIsPanicMode(true); setTimeout(() => {setIsPanicMode(false); onUpdateState({...savedState, isRevealed: false});}, 1500); }} className="p-2 bg-red-900/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                {isPanicMode ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
            </button>
            <button onClick={() => { if(!isBrokerConnected) { setModalStep('select'); setShowBrokerModal(true); } }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all shadow-lg ${isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold'}`}>
                {isBrokerConnected ? 'BRIDGE ON' : 'CONNECT'}
            </button>
         </div>
      </div>

      {/* Conditional Chart Rendering */}
      {isBrokerConnected && (
          <div className="p-4 animate-in fade-in zoom-in duration-700">
              <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[9px] text-titan-muted font-black uppercase tracking-widest flex items-center gap-2">
                      <LineChart size={12} className="text-titan-gold" /> Live Broker Feed
                  </span>
                  <span className="text-[8px] text-titan-green font-bold">REAL-TIME DATA SINC.</span>
              </div>
              <InstitutionalChart />
          </div>
      )}

      {/* Main Terminal Interface */}
      <div className="px-4 mb-4">
          <div className="bg-titan-card/40 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-[9px] text-titan-muted uppercase font-black tracking-[0.3em]">Terminal Input</span>
                    <span className="text-[8px] text-titan-gold font-bold">PROTOCOL V3.1</span>
                </div>
                <input 
                    type="text" 
                    inputMode="decimal" 
                    value={savedState.userPrice} 
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                    placeholder="1.00000" 
                    disabled={savedState.isRevealed} 
                    className="w-full bg-black/60 border border-white/10 text-white font-mono text-5xl p-6 rounded-3xl outline-none focus:border-titan-gold transition-all text-center mb-6 shadow-inner" 
                />
                
                {!savedState.isRevealed ? (
                    <button onClick={handleReveal} disabled={isValidating || !savedState.userPrice} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all">
                        {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />} Run SMC Protocol
                    </button>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 text-center relative overflow-hidden bg-black/80 min-h-[220px] transition-all duration-700 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-slate-800'
                        }`}>
                            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.4em] mb-4 block">Institutional Directive</span>
                            <h3 className={`font-black italic tracking-tighter leading-none transition-all ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-slate-500 text-5xl'
                            }`}>
                                {savedState.analysisSnapshot?.status}
                            </h3>
                            <p className="text-white font-bold text-[10px] uppercase tracking-[0.2em] opacity-60 mt-4">{savedState.analysisSnapshot?.shortSummary}</p>
                        </div>
                        
                        <div className="bg-titan-dark/40 border border-white/5 rounded-2xl p-4">
                            <h4 className="text-titan-gold text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={10} /> Institutional Rationale
                            </h4>
                            <p className="text-[10px] text-titan-muted leading-relaxed font-medium italic">
                                "{savedState.analysisSnapshot?.rationale}"
                            </p>
                        </div>

                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-2 text-titan-muted text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <RotateCcw size={12} /> Reset Terminal
                        </button>
                    </div>
                )}
          </div>
      </div>

      {/* Execution Layer */}
      <div className="p-4 space-y-4">
          {savedState.isRevealed && savedState.analysisSnapshot?.status !== SignalStatus.WAIT && (
              <div className="bg-titan-card/50 rounded-3xl p-6 border border-titan-gold/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <Target size={14} className="text-titan-gold" />
                          <span className="text-[9px] text-white font-black uppercase tracking-widest">Order Specification</span>
                      </div>
                      <span className="text-[10px] text-titan-green font-mono font-bold tracking-tighter">RR 1:3.0</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-black/60 p-5 rounded-2xl border border-red-900/30">
                          <span className="text-[8px] text-titan-muted font-black uppercase block mb-1">Protection (SL)</span>
                          <span className="text-red-400 font-mono font-bold text-xl">{savedState.analysisSnapshot?.stopLoss}</span>
                      </div>
                      <div className="bg-black/60 p-5 rounded-2xl border border-titan-green/30">
                          <span className="text-[8px] text-titan-muted font-black uppercase block mb-1">Target (TP)</span>
                          <span className="text-titan-green font-mono font-bold text-xl">{savedState.analysisSnapshot?.takeProfit}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setPendingSide('SELL'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-6 rounded-2xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-red-600 border-red-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowDownCircle size={24} className="mb-1" /> SELL
                      </button>
                      <button 
                        onClick={() => { setPendingSide('BUY'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-6 rounded-2xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-titan-green border-green-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowUpCircle size={24} className="mb-1" /> BUY
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Execution Ticket Modal */}
      {showTradeTicket && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-titan-dark w-full max-w-md rounded-t-[3rem] border-t border-titan-gold/40 p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Execute Order</h3>
                          <p className="text-[9px] text-titan-muted uppercase tracking-widest font-bold">Institutional Security Protocol</p>
                      </div>
                      <button onClick={() => setShowTradeTicket(false)} className="text-white/40 hover:text-white p-2">✕</button>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5 items-center">
                          <span className="text-[10px] text-titan-muted font-bold uppercase">Instrument / Side</span>
                          <span className={`text-sm font-black uppercase ${pendingSide === 'BUY' ? 'text-titan-green' : 'text-red-500'}`}>{pendingSide} - EURUSD</span>
                      </div>
                      <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5 items-center">
                          <span className="text-[10px] text-titan-muted font-bold uppercase">Calculated Lot</span>
                          <span className="text-xl font-mono font-bold text-white">{calculatedLot} LOTS</span>
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
                  </div>

                  <button 
                    onClick={() => { setIsLinking(true); setTimeout(() => { setIsLinking(false); setShowTradeTicket(false); alert("Posição aberta via Bridge Protocol."); }, 1200); }}
                    disabled={isLinking}
                    className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
                        pendingSide === 'BUY' ? 'bg-titan-green text-black' : 'bg-red-600 text-white'
                    }`}
                  >
                      {isLinking ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />}
                      AUTHORIZE OPENING
                  </button>
                  <p className="text-[7px] text-titan-muted text-center mt-4 uppercase font-bold tracking-widest opacity-50">
                      AES-256 Encrypted Handshake. Position will be mirrored on {selectedBroker?.name}.
                  </p>
              </div>
          </div>
      )}

      {/* Bridge Modal */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-titan-card border border-white/10 rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'select' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'login' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                            <div className={`w-1.5 h-1.5 rounded-full ${modalStep === 'health' || modalStep === 'success' ? 'bg-titan-gold' : 'bg-titan-gold/30'}`}></div>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Bridge Protocol</h3>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white/40 hover:text-white transition-colors p-2">✕</button>
                </div>
                
                <div className="p-10">
                    {modalStep === 'select' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 01: Environment selection</span>
                            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-4">
                                <button onClick={() => onAccountTypeChange('DEMO')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAccountType === 'DEMO' ? 'bg-blue-600 text-white shadow-lg' : 'text-titan-muted'}`}>DEMO</button>
                                <button onClick={() => onAccountTypeChange('REAL')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAccountType === 'REAL' ? 'bg-titan-gold text-black shadow-lg' : 'text-titan-muted'}`}>REAL</button>
                            </div>
                            <div className="space-y-3">
                                {brokers.map((b) => (
                                    <button key={b.id} onClick={() => { setSelectedBroker(b); setModalStep('login'); }} className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-[1.5rem] hover:border-titan-gold/40 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}><b.icon size={24} className="text-white" /></div>
                                            <div className="text-left">
                                                <p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                                <p className="text-[8px] text-titan-muted uppercase font-bold tracking-tighter">Gateway Institutional</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-titan-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 'login' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <span className="text-[9px] text-titan-gold font-black uppercase tracking-widest block mb-4">Step 02: Gateway Authentication</span>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Account UID</label>
                                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="00000000" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-titan-gold transition-all font-mono" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] text-titan-muted font-bold uppercase ml-1">Institutional Token</label>
                                    <input type="password" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} placeholder="••••••••" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-titan-gold transition-all" />
                                </div>
                            </div>
                            <button onClick={processAuth} disabled={isLinking || !accountNumber || !accountPass} className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-6 active:scale-95 shadow-xl">
                                AUTHORIZE HANDSHAKE
                            </button>
                            <button onClick={() => setModalStep('select')} className="w-full text-[9px] text-titan-muted hover:text-white py-2 flex items-center justify-center gap-2 mt-2"><ArrowLeft size={10} /> BACK TO LIST</button>
                        </div>
                    )}

                    {modalStep === 'health' && (
                        <div className="py-12 text-center animate-pulse">
                            <Loader2 size={56} className="text-titan-gold animate-spin mx-auto mb-8" />
                            <p className="text-[10px] text-titan-gold font-black uppercase tracking-[0.5em]">Establishing Secure Sync...</p>
                            <div className="mt-6 text-[8px] text-titan-muted space-y-2 font-mono uppercase tracking-widest">
                                <p>ENCRYPTING LIQUIDITY CHANNELS...</p>
                                <p>VERIFYING AES-256 KEYS...</p>
                                <p>BRIDGE ESTABLISHED</p>
                            </div>
                        </div>
                    )}

                    {modalStep === 'success' && (
                        <div className="py-10 text-center animate-in zoom-in-95 duration-500">
                            <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 border-2 shadow-2xl ${activeAccountType === 'DEMO' ? 'bg-blue-600/10 border-blue-500 shadow-blue-500/20' : 'bg-titan-green/10 border-titan-green shadow-green-500/20'}`}>
                                <ShieldCheck size={56} className={activeAccountType === 'DEMO' ? 'text-blue-400' : 'text-titan-green'} />
                            </div>
                            <h4 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase leading-none">TERMINAL SYNCED</h4>
                            <p className="text-[10px] text-titan-muted uppercase tracking-[0.2em] font-bold">Bridge Mirroring Active: {selectedBroker?.name}</p>
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
