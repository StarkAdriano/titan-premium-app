
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
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
  Copy as LucideCopy, 
  Loader2 
} from 'lucide-react';

interface DashboardState {
    userPrice: string;
    isRevealed: boolean;
    analysisSnapshot: AnalysisResult | null;
    trendBias: 'BULLISH' | 'BEARISH'; 
    referencePrice: string;
}

interface DashboardProps {
  asset: Asset; 
  savedState: DashboardState;
  onUpdateState: (newState: DashboardState) => void;
}

// Componente de Ícone de Cópia Customizado para evitar conflito
const CustomCopyIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

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
    <div className="w-full h-[400px] bg-black border-b border-titan-card relative z-0" ref={container}>
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

  const generateTitanAnalysis = (inputPrice: number, bias: 'BULLISH' | 'BEARISH'): AnalysisResult => {
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 12; 
    const TARGET_PIPS = 36; 

    const slPrice = bias === 'BULLISH' 
        ? (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
        
    const tpPrice = bias === 'BULLISH' 
        ? (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);

    return {
        status: bias === 'BULLISH' ? SignalStatus.BUY : SignalStatus.SELL,
        shortSummary: `Set Institucional Confirmado.`,
        detailedAnalysis: `Conexão via ${selectedBroker || 'Titan Core'}. O nível ${inputPrice} identifica uma zona de mitigação bancária. Fluxo de ordens validado para entrada imediata.`,
        validationStatus: 'OK',
        validationMsg: 'Sinal Confirmado',
        referencePrice: inputPrice.toString(),
        stopLoss: slPrice,
        takeProfit: tpPrice,
        commandLine: `EURUSD ${bias === 'BULLISH' ? 'BUY' : 'SELL'} @ ${inputPrice} SL ${slPrice} TP ${tpPrice}`
    };
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setTimeout(() => {
            const result = generateTitanAnalysis(parseFloat(sanitizedPrice), savedState.trendBias);
            onUpdateState({ ...savedState, isRevealed: true, analysisSnapshot: result });
            setIsValidating(false);
        }, 800);
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
      
      {/* 1. Sub-Header (Colado no gráfico) */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 relative z-10">
         <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white italic tracking-tighter">EURUSD</h2>
            <button 
                onClick={() => setShowBrokerModal(true)}
                disabled={isLinking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                    isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold shadow-lg shadow-gold-900/20'
                }`}
            >
                {isLinking ? <Loader2 size={12} className="animate-spin" /> : (isBrokerConnected ? <CheckCircle2 size={12} /> : <Zap size={12} />)}
                {isBrokerConnected ? selectedBroker?.toUpperCase() : 'LINCAR CORRETORA'}
            </button>
         </div>
         
         <button 
            onClick={() => onUpdateState({...savedState, trendBias: savedState.trendBias === 'BULLISH' ? 'BEARISH' : 'BULLISH', isRevealed: false})}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                savedState.trendBias === 'BULLISH' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'
            }`}
         >
            {savedState.trendBias === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-[10px] font-black uppercase">{savedState.trendBias === 'BULLISH' ? 'COMPRA' : 'VENDA'}</span>
         </button>
      </div>

      {/* 2. TradingView Widget (Alinhamento 1:1) */}
      <TradingViewChart />

      {/* 3. Painel de Controle e Sinais */}
      <div className="p-4 space-y-4">
          
          {/* Validador de Preço */}
          <div className="bg-titan-card/30 rounded-2xl p-4 border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-titan-gold font-bold uppercase tracking-[0.2em]">Preço da Corretora</span>
                  <span className="text-[9px] text-titan-muted italic">Sincronize para validar</span>
              </div>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/60 border border-titan-card focus:border-titan-gold text-white font-mono text-2xl p-4 rounded-xl outline-none transition-all"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-6 rounded-xl font-black flex items-center justify-center active:scale-95 transition-transform shadow-xl"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={24} /> : <Shield size={24} />}
                    </button>
                ) : (
                    <button onClick={handleReset} className="bg-titan-card text-titan-muted px-6 rounded-xl border border-white/5">
                        <RotateCcw size={20} />
                    </button>
                )}
              </div>
          </div>

          {/* BOX DE SINAL (RESTAURADO COM DESTAQUE) */}
          {savedState.isRevealed && savedState.analysisSnapshot && (
              <div className="animate-in zoom-in-95 duration-500 space-y-4">
                  <div className={`p-8 rounded-[2.5rem] border-[6px] text-center shadow-[0_0_50px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-xl relative overflow-hidden ${
                      savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green' : 
                      savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red' : 'border-titan-gold'
                  }`}>
                      <div className={`absolute inset-0 opacity-10 animate-pulse ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'bg-titan-green' : 'bg-titan-red'
                      }`}></div>
                      
                      <span className="text-[10px] text-titan-muted font-bold uppercase tracking-[0.4em] mb-2 block relative z-10">Titan Premium Signal</span>
                      
                      <h3 className={`text-7xl font-black italic tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] relative z-10 ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                      }`}>
                          {savedState.analysisSnapshot.status}
                      </h3>
                      
                      <p className="text-white font-bold text-sm mt-3 uppercase tracking-tighter opacity-90 relative z-10">
                        {savedState.analysisSnapshot.shortSummary}
                      </p>
                  </div>

                  {/* Parâmetros de Execução */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl flex flex-col items-center">
                          <span className="text-[9px] text-red-400 font-bold uppercase mb-1">Stop Loss</span>
                          <div className="flex items-center gap-2">
                              <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                              <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted">
                                  <CustomCopyIcon size={14} className={copiedField === 'sl' ? 'text-titan-green' : ''} />
                              </button>
                          </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-2xl flex flex-col items-center">
                          <span className="text-[9px] text-green-400 font-bold uppercase mb-1">Take Profit</span>
                          <div className="flex items-center gap-2">
                              <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                              <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted">
                                  <CustomCopyIcon size={14} className={copiedField === 'tp' ? 'text-titan-green' : ''} />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Terminal de Execução Rápida */}
          <div className="bg-titan-card/20 rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest">Volume (Lote)</span>
                  <div className="flex items-center gap-5 bg-black/60 px-5 py-2 rounded-full border border-white/10 shadow-inner">
                      <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="text-titan-gold"><Minus size={20} /></button>
                      <span className="text-xl font-mono font-bold text-white w-14 text-center">{lotSize.toFixed(2)}</span>
                      <button onClick={() => setLotSize(lotSize + 0.01)} className="text-titan-gold"><Plus size={20} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all ${
                        isBrokerConnected ? 'bg-titan-red text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] active:scale-95' : 'bg-titan-card text-titan-muted opacity-40'
                    }`}
                  >
                      SELL
                  </button>
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all ${
                        isBrokerConnected ? 'bg-titan-green text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-95' : 'bg-titan-card text-titan-muted opacity-40'
                    }`}
                  >
                      BUY
                  </button>
              </div>
              {!isBrokerConnected && (
                  <p className="text-[10px] text-titan-gold/60 text-center font-bold uppercase tracking-[0.2em] animate-pulse">
                    Conecte-se para liberar execução instantânea
                  </p>
              )}
          </div>
      </div>

      {/* MODAL DE LINCAGEM (FIXED) */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-titan-card border border-titan-gold/30 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-titan-dark">
                    <div>
                        <h3 className="text-xl font-bold text-white">Lincar Corretora</h3>
                        <p className="text-[9px] text-titan-muted uppercase tracking-[0.3em]">Institutional API</p>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white opacity-40 hover:opacity-100 p-2 text-2xl">✕</button>
                </div>
                <div className="p-5 space-y-3">
                    {brokers.map((b) => (
                        <button 
                            key={b.id}
                            onClick={() => connectBroker(b.id)}
                            disabled={isLinking}
                            className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/40 transition-all active:scale-98"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                    <b.icon size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-bold text-white">{b.name}</p>
                                    <p className="text-[10px] text-titan-muted">Latência 0ms</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-titan-muted" />
                        </button>
                    ))}
                    <div className="p-4 bg-titan-gold/5 border border-titan-gold/10 rounded-2xl mt-4">
                        <p className="text-[10px] text-titan-gold/70 leading-relaxed text-center italic">
                          A lincagem permite que o Titan envie ordens diretamente para sua plataforma de preferência com o spread otimizado.
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
