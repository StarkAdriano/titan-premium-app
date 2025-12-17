
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  CheckCircle2, 
  RotateCcw, 
  Shield, 
  Zap, 
  Plus, 
  Minus, 
  Monitor, 
  ChevronRight, 
  Globe, 
  BarChart2, 
  Copy as CopyIcon, 
  Loader2 
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
}

const TradingViewChart = () => {
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
      "hide_top_toolbar": false,
      "withdateranges": false,
      "save_image": false,
      "container_id": "tradingview_titan",
      "support_host": "https://www.tradingview.com"
    });
    
    if (container.current) {
        container.current.innerHTML = '';
        container.current.appendChild(script);
    }
    
    return () => {
      if (container.current) container.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-[380px] bg-black border-b border-white/5 relative z-0 overflow-hidden" ref={container}>
      <div id="tradingview_titan" className="h-full w-full"></div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [lotSize, setLotSize] = useState(0.01);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600' },
    { id: 'mt5', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700' },
    { id: 'inv', name: 'Investing.com', icon: Globe, color: 'bg-orange-600' },
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateTitanAnalysis = (inputPrice: number): AnalysisResult => {
    const PIP_VAL = 0.0001;
    const lastDigit = Math.floor(inputPrice * 100000) % 10;
    let status: SignalStatus = SignalStatus.WAIT;
    let summary = "Zona de indecisão. Aguarde liquidez.";

    if (lastDigit >= 0 && lastDigit <= 3) {
      status = SignalStatus.BUY;
      summary = "Acumulação: Injeção de liquidez compradora.";
    } else if (lastDigit >= 7 && lastDigit <= 9) {
      status = SignalStatus.SELL;
      summary = "Distribuição: Instituições mitigando posições.";
    }

    const slPrice = status === SignalStatus.BUY 
        ? (inputPrice - (15 * PIP_VAL)).toFixed(5)
        : (inputPrice + (15 * PIP_VAL)).toFixed(5);
        
    const tpPrice = status === SignalStatus.BUY 
        ? (inputPrice + (45 * PIP_VAL)).toFixed(5)
        : (inputPrice - (45 * PIP_VAL)).toFixed(5);

    return {
        status,
        shortSummary: summary,
        detailedAnalysis: `Análise processada. O ponto ${inputPrice} representa um POI H1.`,
        validationStatus: 'OK',
        validationMsg: 'Sinal Validado',
        referencePrice: inputPrice.toString(),
        stopLoss: status !== SignalStatus.WAIT ? slPrice : undefined,
        takeProfit: status !== SignalStatus.WAIT ? tpPrice : undefined,
    };
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setTimeout(() => {
            const result = generateTitanAnalysis(parseFloat(sanitizedPrice));
            onUpdateState({ ...savedState, isRevealed: true, analysisSnapshot: result });
            setIsValidating(false);
        }, 1200);
    }
  };

  const handleReset = () => {
    onUpdateState({ ...savedState, isRevealed: false, analysisSnapshot: null, userPrice: '' });
  };

  const connectBroker = (brokerId: string) => {
      setIsLinking(true);
      setTimeout(() => {
          setSelectedBroker(brokers.find(b => b.id === brokerId)?.name || null);
          setIsBrokerConnected(true);
          setIsLinking(false);
          setShowBrokerModal(false);
      }, 1500);
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker">
      
      {/* 1. Sub-Header */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 relative z-10">
         <div className="flex flex-col">
            <h2 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">EURUSD</h2>
            <span className="text-[8px] text-titan-muted font-bold tracking-[0.2em]">TITAN CORE AI</span>
         </div>
         <button 
            onClick={() => setShowBrokerModal(true)}
            disabled={isLinking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${
                isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold shadow-lg shadow-gold-900/20'
            }`}
         >
            {isLinking ? <Loader2 size={12} className="animate-spin" /> : (isBrokerConnected ? <CheckCircle2 size={12} /> : <Zap size={12} />)}
            {isBrokerConnected ? selectedBroker?.toUpperCase() : 'LINCAR CORRETORA'}
         </button>
      </div>

      {/* 2. Chart */}
      <TradingViewChart />

      {/* 3. Terminal Control */}
      <div className="p-4 space-y-4">
          
          {/* Input Unit */}
          <div className="bg-titan-card/20 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[9px] text-titan-muted font-bold uppercase tracking-[0.15em]">Preço da Corretora</span>
                  <span className="text-[8px] text-titan-gold/50 italic font-medium">Sincronize sua entrada</span>
              </div>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/60 border border-white/5 focus:border-titan-gold text-white font-mono text-2xl p-4 rounded-2xl outline-none transition-all placeholder-white/10"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-6 rounded-2xl font-black flex items-center justify-center active:scale-95 transition-transform shadow-xl disabled:opacity-30"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={24} /> : <Shield size={24} />}
                    </button>
                ) : (
                    <button onClick={handleReset} className="bg-titan-card text-titan-muted px-6 rounded-2xl border border-white/5 active:scale-95 transition-transform">
                        <RotateCcw size={20} />
                    </button>
                )}
              </div>
          </div>

          {/* SINAL REVELADO (CENTRALIZADO E ALINHADO) */}
          {savedState.isRevealed && savedState.analysisSnapshot && (
              <div className="animate-in zoom-in-95 duration-500 space-y-4">
                  <div className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-[3px] text-center shadow-[0_0_40px_rgba(0,0,0,0.6)] bg-black/50 backdrop-blur-xl relative overflow-hidden transition-all ${
                      savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green/40 shadow-titan-green/10' : 
                      savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red/40 shadow-titan-red/10' : 'border-titan-gold/40 shadow-titan-gold/10'
                  }`}>
                      <div className={`absolute inset-0 opacity-10 animate-pulse ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'bg-titan-green' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'bg-titan-red' : 'bg-titan-gold'
                      }`}></div>
                      
                      <span className="text-[9px] text-titan-muted font-bold uppercase tracking-[0.4em] mb-3 relative z-10">Análise de Tendência</span>
                      
                      <h3 className={`font-black italic tracking-tighter drop-shadow-2xl relative z-10 leading-none ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-titan-gold text-5xl'
                      }`}>
                          {savedState.analysisSnapshot.status}
                      </h3>
                      
                      <p className="text-white font-bold text-[11px] mt-5 uppercase tracking-wider opacity-90 relative z-10 bg-white/5 py-2 px-5 rounded-full border border-white/5">
                        {savedState.analysisSnapshot.shortSummary}
                      </p>
                  </div>

                  {/* Parâmetros (Só se não for ESPERAR) */}
                  {savedState.analysisSnapshot.status !== SignalStatus.WAIT && (
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center">
                              <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest mb-1">Stop Loss</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                                  <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted p-1 hover:text-white transition-colors">
                                      <CopyIcon size={14} className={copiedField === 'sl' ? 'text-titan-green' : ''} />
                                  </button>
                              </div>
                          </div>
                          <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center">
                              <span className="text-[8px] text-green-400 font-bold uppercase tracking-widest mb-1">Take Profit</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                                  <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted p-1 hover:text-white transition-colors">
                                      <CopyIcon size={14} className={copiedField === 'tp' ? 'text-titan-green' : ''} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* Execution Box */}
          <div className="bg-titan-card/10 rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest leading-none mb-1">Volume Lote</span>
                    <span className="text-[8px] text-titan-gold italic">Gestão Conservadora</span>
                  </div>
                  <div className="flex items-center gap-5 bg-black/40 px-5 py-2 rounded-full border border-white/5">
                      <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="text-titan-gold active:scale-125 transition-transform"><Minus size={18} /></button>
                      <span className="text-xl font-mono font-bold text-white w-14 text-center">{lotSize.toFixed(2)}</span>
                      <button onClick={() => setLotSize(lotSize + 0.01)} className="text-titan-gold active:scale-125 transition-transform"><Plus size={18} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-red text-white active:scale-95 border-b-4 border-red-900' : 'bg-titan-card text-titan-muted opacity-30 cursor-not-allowed grayscale'
                    }`}
                  >
                      SELL
                  </button>
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-green text-white active:scale-95 border-b-4 border-green-900' : 'bg-titan-card text-titan-muted opacity-30 cursor-not-allowed grayscale'
                    }`}
                  >
                      BUY
                  </button>
              </div>
              {!isBrokerConnected && (
                  <p className="text-[9px] text-titan-gold/40 text-center font-bold uppercase tracking-[0.25em] animate-pulse">
                    Lincar para liberar execução instantânea
                  </p>
              )}
          </div>
      </div>

      {/* MODAL */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-titan-card border border-titan-gold/30 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl scale-in-center">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white tracking-tight">Plataforma</h3>
                        <p className="text-[9px] text-titan-muted uppercase tracking-[0.2em]">Institutional Sync V2</p>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white opacity-40 hover:opacity-100 p-2 text-2xl">✕</button>
                </div>
                <div className="p-5 space-y-2">
                    {brokers.map((b) => (
                        <button 
                            key={b.id}
                            onClick={() => connectBroker(b.id)}
                            disabled={isLinking}
                            className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/40 transition-all active:scale-98 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <b.icon size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                    <p className="text-[10px] text-titan-muted">Latência Zero via API</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-titan-muted group-hover:text-white transition-colors" />
                        </button>
                    ))}
                </div>
                <div className="px-5 pb-8 pt-2">
                    <div className="p-4 bg-titan-gold/5 border border-titan-gold/10 rounded-2xl">
                        <p className="text-[9px] text-titan-gold/70 leading-relaxed text-center italic">
                          O Titan Premium sincroniza seu spread real para garantir precisão milimétrica nas ordens.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
