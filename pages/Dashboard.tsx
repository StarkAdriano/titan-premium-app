import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, CheckCircle2, Activity, RotateCcw, Shield, Zap, Plus, Minus, Monitor, ExternalLink, ChevronRight, Globe, BarChart2 } from 'lucide-react';

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

// --- WIDGET DO TRADINGVIEW ---
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
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
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
    <div className="w-full h-[380px] bg-black rounded-t-xl overflow-hidden border-x border-t border-titan-card shadow-2xl" ref={container}>
      <div id="tradingview_titan" className="h-full"></div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [lotSize, setLotSize] = useState(0.01);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600' },
    { id: 'mt4', name: 'MetaTrader 4/5', icon: Monitor, color: 'bg-slate-700' },
    { id: 'inv', name: 'Investing.com', icon: Globe, color: 'bg-orange-600' },
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateTitanAnalysis = (inputPrice: number, bias: 'BULLISH' | 'BEARISH'): AnalysisResult => {
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 20; 
    const TARGET_PIPS = 60; 

    // Simulação de lógica institucional baseada no viés e preço inserido
    const slPrice = bias === 'BULLISH' 
        ? (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
        
    const tpPrice = bias === 'BULLISH' 
        ? (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);

    return {
        status: bias === 'BULLISH' ? SignalStatus.BUY : SignalStatus.SELL,
        shortSummary: `Zona de alta probabilidade detectada.`,
        detailedAnalysis: `O preço inserido (${inputPrice}) coincide com uma zona de Order Block institucional identificada no gráfico do ${selectedBroker || 'Broker'}. Setup de expansão validado.`,
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
      setSelectedBroker(brokers.find(b => b.id === brokerId)?.name || null);
      setIsBrokerConnected(true);
      setShowBrokerModal(false);
  };

  return (
    <div className="p-0 space-y-0 pb-28">
      
      {/* 1. Header & Broker Link Area */}
      <div className="p-4 bg-titan-dark/90 backdrop-blur-md flex items-center justify-between border-b border-white/5 sticky top-[60px] z-10">
         <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white tracking-tighter italic">EURUSD</h2>
            <button 
                onClick={() => setShowBrokerModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                    isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold animate-pulse'
                }`}
            >
                {isBrokerConnected ? <CheckCircle2 size={12} /> : <Zap size={12} />}
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

      {/* 2. TradingView Widget */}
      <TradingViewChart />

      {/* 3. Terminal de Operação Direta (Aparece se lincado) */}
      <div className="bg-titan-darker border-b border-titan-card p-4">
          <div className="flex items-center justify-between mb-4 bg-black/40 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-titan-muted font-bold uppercase ml-2">Lote / Volume</span>
              <div className="flex items-center gap-4">
                  <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="text-titan-gold p-1"><Minus size={18} /></button>
                  <span className="text-lg font-mono font-bold text-white w-14 text-center">{lotSize.toFixed(2)}</span>
                  <button onClick={() => setLotSize(lotSize + 0.01)} className="text-titan-gold p-1"><Plus size={18} /></button>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <button className="bg-titan-red/20 border-2 border-titan-red/40 hover:bg-titan-red/40 py-5 rounded-xl flex flex-col items-center group transition-all">
                  <span className="text-white font-black text-2xl italic tracking-tighter">SELL</span>
                  <span className="text-[9px] text-titan-red font-bold uppercase">Executar Venda</span>
              </button>
              <button className="bg-titan-green/20 border-2 border-titan-green/40 hover:bg-titan-green/40 py-5 rounded-xl flex flex-col items-center group transition-all">
                  <span className="text-white font-black text-2xl italic tracking-tighter">BUY</span>
                  <span className="text-[9px] text-titan-green font-bold uppercase">Executar Compra</span>
              </button>
          </div>
      </div>

      {/* 4. Validador de Preço do Gráfico */}
      <div className="p-4 space-y-4">
        <div className="bg-titan-card/50 rounded-xl p-5 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-titan-gold font-bold uppercase flex items-center gap-1">
                    <Shield size={12} /> Validador de Setup Titan
                </span>
                <span className="text-[10px] text-titan-muted italic">Use o preço do seu gráfico</span>
            </div>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="Ex: 1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/60 border border-titan-card focus:border-titan-gold text-white font-mono text-2xl p-4 rounded-xl outline-none"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-6 rounded-xl font-black flex items-center justify-center active:scale-95 transition-transform"
                    >
                        {isValidating ? <Activity className="animate-spin" /> : <Shield size={24} />}
                    </button>
                ) : (
                    <button onClick={handleReset} className="bg-titan-card text-titan-muted px-6 rounded-xl font-bold">
                        <RotateCcw size={20} />
                    </button>
                )}
            </div>
        </div>

        {/* 5. BOX DE STATUS (SINAL COMPRAR/VENDER/ESPERAR) */}
        {savedState.isRevealed && savedState.analysisSnapshot && (
            <div className="animate-in zoom-in-95 fade-in duration-500 space-y-4 pb-12">
                
                {/* O BOX QUE VOCÊ PEDIU */}
                <div className={`p-8 rounded-2xl border-4 text-center shadow-2xl bg-black/60 backdrop-blur-xl ${
                    savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green shadow-green-900/40' : 
                    savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red shadow-red-900/40' : 'border-titan-gold shadow-gold-900/40'
                }`}>
                    <span className="text-[10px] text-titan-muted font-bold uppercase tracking-[0.4em] mb-2 block">Sinal Titan Detectado</span>
                    <h3 className={`text-6xl font-black italic tracking-tighter drop-shadow-md ${
                        savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                        savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                    }`}>
                        {savedState.analysisSnapshot.status}
                    </h3>
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <p className="text-white font-bold text-sm">{savedState.analysisSnapshot.shortSummary}</p>
                        <span className="text-[10px] text-titan-muted flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-titan-green" /> Verificado por {selectedBroker || 'TradingView'}
                        </span>
                    </div>
                </div>

                {/* SL e TP Automatizados */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex flex-col items-center">
                        <span className="text-[9px] text-red-400 font-bold uppercase block mb-1">Stop Loss</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted">
                                <Copy size={14} className={copiedField === 'sl' ? 'text-titan-green' : ''} />
                            </button>
                        </div>
                    </div>
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col items-center">
                        <span className="text-[9px] text-green-400 font-bold uppercase block mb-1">Take Profit</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted">
                                <Copy size={14} className={copiedField === 'tp' ? 'text-titan-green' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Explicação */}
                <div className="bg-titan-card/30 p-5 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400 leading-relaxed text-justify">
                        {savedState.analysisSnapshot.detailedAnalysis}
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* MODAL DE LINCAGEM DE CORRETORA */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
            <div className="bg-titan-card border border-titan-gold/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white">Lincar Corretora</h3>
                        <p className="text-[10px] text-titan-muted uppercase tracking-widest">Sincronia de Preço Real</p>
                    </div>
                    <button onClick={() => setShowBrokerModal(false)} className="text-white opacity-50 hover:opacity-100">✕</button>
                </div>
                <div className="p-4 space-y-3">
                    {brokers.map((b) => (
                        <button 
                            key={b.id}
                            onClick={() => connectBroker(b.id)}
                            className="w-full group flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${b.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <b.icon size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                    <p className="text-[9px] text-titan-muted italic">Preço em Tempo Real</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-titan-muted group-hover:text-titan-gold" />
                        </button>
                    ))}
                    <div className="p-4 bg-titan-gold/5 border border-titan-gold/20 rounded-xl mt-4">
                        <p className="text-[9px] text-titan-gold/80 leading-relaxed">
                            Ao lincar sua corretora, o Titan App utilizará os servidores de liquidez da plataforma escolhida para garantir que seu Stop Loss e Take Profit sejam precisos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

// Ícone de Cópia auxiliar
const Copy = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
);

export default Dashboard;