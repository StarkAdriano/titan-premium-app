
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
  translations: any;
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

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState, activeAccountType = 'REAL', onAccountTypeChange, translations: t }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [showTradeTicket, setShowTradeTicket] = useState(false);
  const [pendingSide, setPendingSide] = useState<'BUY' | 'SELL' | null>(null);

  const brokers = [
    { id: 'pepperstone', name: 'Pepperstone', icon: Zap, color: 'bg-red-600' },
    { id: 'oanda', name: 'OANDA', icon: Globe, color: 'bg-blue-700' },
    { id: 'forex', name: 'FOREX.com', icon: Landmark, color: 'bg-slate-800' },
    { id: 'ic', name: 'IC Markets', icon: Activity, color: 'bg-emerald-600' }
  ];

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
            let rationaleKey = "rationale_wait";

            if (lastDigit <= 3 && zone === 'DISCOUNT') {
                status = SignalStatus.BUY;
                rationaleKey = "rationale_buy";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                rationaleKey = "rationale_sell";
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
                    rationale: t[rationaleKey], // Tradução dinâmica aqui
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
      <div className="px-4 py-1.5 bg-black/80 text-[7px] flex justify-between items-center border-b border-white/5 font-mono tracking-widest opacity-70">
         <div className="flex gap-4">
             <span className="flex items-center gap-1"><Server size={8} /> CLUSTER: EUR-LDN-05</span>
             <span className="flex items-center gap-1 text-titan-green"><Wifi size={8} /> 24ms</span>
         </div>
         <div className="flex gap-4 uppercase">
             <span className="text-titan-gold flex items-center gap-1"><Fingerprint size={8} /> SECURE BRIDGE</span>
             <span>ID: TITAN-PROTOCOL</span>
         </div>
      </div>

      <div className="px-4 py-4 bg-titan-dark flex items-center justify-between border-b border-white/5 sticky top-0 z-20 shadow-lg">
         <div className="flex flex-col">
            <h2 className="text-xs font-black text-white italic tracking-tighter leading-none flex items-center gap-2 uppercase">
                <Terminal size={14} className="text-titan-gold" />
                EURUSD <span className="text-titan-gold">{t.terminal}</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1 h-1 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-titan-muted'}`}></div>
                <span className="text-[7px] text-titan-muted font-black tracking-[0.2em] uppercase">
                    {isBrokerConnected ? `${selectedBroker?.name} ACTIVE` : 'DISCONNECTED'}
                </span>
            </div>
         </div>
         <button onClick={() => { if(!isBrokerConnected) setShowBrokerModal(true); }} className={`px-4 py-2 rounded-xl text-[8px] font-black border transition-all active:scale-95 ${isBrokerConnected ? 'bg-titan-green/5 border-titan-green/30 text-titan-green' : 'bg-titan-gold text-black border-titan-gold shadow-lg'}`}>
            {isBrokerConnected ? 'BRIDGE ON' : t.connect}
         </button>
      </div>

      <div className="px-4 py-2">
          <div className="bg-titan-card/40 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden mt-4">
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
                        {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />} {t.run_analysis}
                    </button>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 text-center bg-black/80 min-h-[220px] transition-all duration-700 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_60px_rgba(16,185,129,0.1)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_60px_rgba(239,68,68,0.1)]' : 'border-slate-800'
                        }`}>
                            <h3 className={`font-black italic tracking-tighter leading-none ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-slate-600 text-5xl'
                            }`}>
                                {savedState.analysisSnapshot?.status === SignalStatus.BUY ? t.buy : savedState.analysisSnapshot?.status === SignalStatus.SELL ? t.sell : t.wait}
                            </h3>
                        </div>
                        
                        <div className="bg-titan-dark/40 border border-white/5 rounded-3xl p-5">
                            <h4 className="text-titan-gold text-[7px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={10} /> {t.institutional_rationale}
                            </h4>
                            <p className="text-[11px] text-titan-muted leading-relaxed font-medium italic">
                                "{savedState.analysisSnapshot?.rationale}"
                            </p>
                        </div>

                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-2 text-titan-muted text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <RotateCcw size={12} /> {t.clear_memory}
                        </button>
                    </div>
                )}
          </div>
      </div>

      {savedState.isRevealed && savedState.analysisSnapshot?.status !== SignalStatus.WAIT && (
          <div className="px-4 py-2 space-y-4">
              <div className="bg-titan-card/50 rounded-[2.5rem] p-8 border border-titan-gold/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <Target size={14} className="text-titan-gold" />
                          <span className="text-[9px] text-white font-black uppercase tracking-widest">{t.trade_plan}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                      <button 
                        onClick={() => { setPendingSide('SELL'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-7 rounded-3xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-red-600 border-red-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowDownCircle size={24} className="mb-1" /> {t.sell}
                      </button>
                      <button 
                        onClick={() => { setPendingSide('BUY'); setShowTradeTicket(true); }}
                        disabled={!isBrokerConnected} 
                        className={`py-7 rounded-3xl font-black text-2xl italic tracking-tighter border-b-4 transition-all flex flex-col items-center justify-center ${isBrokerConnected ? 'bg-titan-green border-green-900 text-white active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'}`}
                      >
                        <ArrowUpCircle size={24} className="mb-1" /> {t.buy}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showBrokerModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
            <div className="bg-titan-card border border-white/10 rounded-[3.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">Bridge Gateway</h3>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full">✕</button>
                </div>
                <div className="p-10 max-h-[500px] overflow-y-auto">
                    {brokers.map((b) => (
                        <button key={b.id} onClick={() => { setSelectedBroker(b); setIsBrokerConnected(true); setShowBrokerModal(false); }} className="w-full flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-3xl mb-3 hover:border-titan-gold/40 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}><b.icon size={22} className="text-white" /></div>
                                <div className="text-left">
                                    <p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-titan-muted" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
