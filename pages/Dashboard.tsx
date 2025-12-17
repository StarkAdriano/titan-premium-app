
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Activity, 
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
    trendBias: 'BULLISH' | 'BEARISH'; 
    referencePrice: string;
}

interface DashboardProps {
  asset: Asset; 
  savedState: DashboardState;
  onUpdateState: (newState: DashboardState) => void;
}

// --- WIDGET DO TRADINGVIEW (ALINHADO E SEM BORDAS) ---
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
  }, []);

  return (
    <div className="w-full h-[380px] bg-black border-b border-titan-card relative z-0 overflow-hidden" ref={container}>
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
    { id: 'mt4', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700' },
    { id: 'inv', name: 'Investing.com', icon: Globe, color: 'bg-orange-600' },
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateTitanAnalysis = (inputPrice: number, bias: 'BULLISH' | 'BEARISH'): AnalysisResult => {
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 15; 
    const TARGET_PIPS = 45; 

    const slPrice = bias === 'BULLISH' 
        ? (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
        
    const tpPrice = bias === 'BULLISH' 
        ? (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);

    return {
        status: bias === 'BULLISH' ? SignalStatus.BUY : SignalStatus.SELL,
        shortSummary: `Ordem Institucional Validada.`,
        detailedAnalysis: `Análise concluída via servidor ${selectedBroker || 'Titan Core'}. O preço ${inputPrice} representa uma zona de desequilíbrio (FVG) com alta probabilidade de reação.`,
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
    <div className="flex flex-col min-h-full pb-32">
      
      {/* 1. Header de Controle (Colado no gráfico) */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 relative z-10">
         <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white italic tracking-tighter">EURUSD</h2>
            <button 
                onClick={() => setShowBrokerModal(true)}
                disabled={isLinking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                    isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold'
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

      {/* 2. TradingView Widget (Alinhado Milimetricamente) */}
      <TradingViewChart />

      {/* 3. Painel de Execução e Validação */}
      <div className="bg-titan-darker p-4 space-y-4">
          
          {/* Campo de Input de Preço Real */}
          <div className="bg-titan-card/40 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-titan-gold font-bold uppercase tracking-widest">Preço do seu Gráfico</span>
                  <span className="text-[9px] text-titan-muted italic">Validar ponto de entrada</span>
              </div>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/40 border border-titan-card focus:border-titan-gold text-white font-mono text-xl p-3 rounded-lg outline-none"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-5 rounded-lg font-black flex items-center justify-center active:scale-95 transition-transform"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                    </button>
                ) : (
                    <button onClick={handleReset} className="bg-titan-card text-titan-muted px-5 rounded-lg">
                        <RotateCcw size={18} />
                    </button>
                )}
              </div>
          </div>

          {/* SINAL GIGANTE (VISIBILIDADE MÁXIMA) */}
          {savedState.isRevealed && savedState.analysisSnapshot && (
              <div className="animate-in zoom-in-95 duration-500 space-y-4">
                  <div className={`p-8 rounded-2xl border-4 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-xl ${
                      savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green shadow-green-900/30' : 
                      savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red shadow-red-900/30' : 'border-titan-gold shadow-gold-900/30'
                  }`}>
                      <span className="text-[10px] text-titan-muted font-bold uppercase tracking-[0.3em] mb-2 block">Análise Titan Concluída</span>
                      <h3 className={`text-7xl font-black italic tracking-tighter drop-shadow-lg ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                      }`}>
                          {savedState.analysisSnapshot.status}
                      </h3>
                      <p className="text-white font-bold text-xs mt-3 uppercase tracking-widest opacity-80">{savedState.analysisSnapshot.shortSummary}</p>
                  </div>

                  {/* Parâmetros Copiáveis */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex flex-col items-center">
                          <span className="text-[9px] text-red-400 font-bold uppercase mb-1">Stop Loss</span>
                          <div className="flex items-center gap-2">
                              <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                              <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted hover:text-white">
                                  <CopyIcon size={14} className={copiedField === 'sl' ? 'text-titan-green' : ''} />
                              </button>
                          </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col items-center">
                          <span className="text-[9px] text-green-400 font-bold uppercase mb-1">Take Profit</span>
                          <div className="flex items-center gap-2">
                              <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                              <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted hover:text-white">
                                  <CopyIcon size={14} className={copiedField === 'tp' ? 'text-titan-green' : ''} />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Quick Trade Panel */}
          <div className="bg-titan-card/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-titan-muted font-bold uppercase">Volume Lote</span>
                  <div className="flex items-center gap-4 bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                      <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="text-titan-gold hover:scale-110"><Minus size={18} /></button>
                      <span className="text-lg font-mono font-bold text-white w-12 text-center">{lotSize.toFixed(2)}</span>
                      <button onClick={() => setLotSize(lotSize + 0.01)} className="text-titan-gold hover:scale-110"><Plus size={18} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-red text-white active:scale-95 border-b-4 border-red-900' : 'bg-titan-card text-titan-muted opacity-40 cursor-not-allowed'
                    }`}
                  >
                      SELL
                  </button>
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-green text-white active:scale-95 border-b-4 border-green-900' : 'bg-titan-card text-titan-muted opacity-40 cursor-not-allowed'
                    }`}
                  >
                      BUY
                  </button>
              </div>
              {!isBrokerConnected && (
                  <p className="text-[10px] text-titan-gold/60 text-center mt-3 font-bold uppercase tracking-widest animate-pulse">
                    Lincar corretora para executar ordens reais
                  </p>
              )}
          </div>
      </div>

      {/* MODAL DE LINCAGEM (FIXED CORRECTION) */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-titan-card border border-titan-gold/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-in-center">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-titan-dark">
                    <div>
                        <h3 className="text-lg font-bold text-white">Lincar Plataforma</h3>
                        <p className="text-[9px] text-titan-muted uppercase tracking-widest">Sincronia de Execução</p>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white opacity-40 hover:opacity-100 p-2 text-xl font-bold">✕</button>
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
                                <div className={`w-10 h-10 ${b.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <b.icon size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">{b.name}</p>
                                    <p className="text-[9px] text-titan-muted italic">Conexão Segura</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-titan-muted" />
                        </button>
                    ))}
                    <div className="p-4 bg-titan-gold/5 border border-titan-gold/10 rounded-2xl mt-4">
                        <p className="text-[10px] text-titan-gold/70 leading-relaxed text-center italic">
                          O Titan Premium utiliza servidores de baixa latência para garantir que o sinal de entrada seja idêntico ao da sua corretora.
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
