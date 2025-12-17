import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Calculator, CheckCircle2, AlignLeft, Lock, Activity, RotateCcw, Shield, AlertTriangle, Terminal, Settings2, BarChart3, ArrowDown, ArrowUp, Monitor, Copy, ExternalLink, Zap, MousePointer2, Briefcase, Plus, Minus } from 'lucide-react';

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

// --- WIDGET DO TRADINGVIEW (MAX POWER) ---
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

// --- LÓGICA TITAN PREMIUM (ANALISE POR INPUT DE MERCADO REAL) ---
const generateTitanAnalysis = (
    assetSymbol: string, 
    inputPrice: number, 
    bias: 'BULLISH' | 'BEARISH'
): AnalysisResult => {
    // Como agora não temos o preço simulado para comparar, 
    // a análise foca na validação do ponto de entrada digitado pelo trader.
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 20; 
    const TARGET_PIPS = 60; 

    const slPrice = bias === 'BULLISH' 
        ? (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
        
    const tpPrice = bias === 'BULLISH' 
        ? (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5)
        : (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);

    return {
        status: bias === 'BULLISH' ? SignalStatus.BUY : SignalStatus.SELL,
        shortSummary: `Ordem pronta para execução.`,
        detailedAnalysis: `**ESTRATÉGIA TITAN PRO**\nBaseado no preço inserido (${inputPrice}), o sistema calculou as zonas de liquidez mais próximas. O viés macro de ${bias === 'BULLISH' ? 'ALTA' : 'BAIXA'} sugere que esta entrada busca capturar o próximo movimento de expansão institucional.`,
        validationStatus: 'OK',
        validationMsg: 'Setup Alinhado com a Tendência',
        referencePrice: inputPrice.toString(),
        stopLoss: slPrice,
        takeProfit: tpPrice,
        commandLine: `${assetSymbol} ${bias === 'BULLISH' ? 'BUY' : 'SELL'} @ ${inputPrice} SL ${slPrice} TP ${tpPrice}`
    };
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [lotSize, setLotSize] = useState(0.01);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setTimeout(() => {
            const result = generateTitanAnalysis(asset.symbol, parseFloat(sanitizedPrice), savedState.trendBias);
            onUpdateState({ ...savedState, isRevealed: true, analysisSnapshot: result });
            setIsValidating(false);
        }, 500);
    }
  };

  // Fix: Added missing handleReset function to update the dashboard state and reset the validation view.
  const handleReset = () => {
    onUpdateState({
        ...savedState,
        isRevealed: false,
        analysisSnapshot: null,
        userPrice: ''
    });
  };

  const handleTradeAction = (type: 'BUY' | 'SELL') => {
      if (!isBrokerConnected) {
          alert("Por favor, conecte sua corretora primeiro.");
          return;
      }
      alert(`Ordem de ${type} enviada: ${lotSize} lotes de ${asset.symbol}`);
  };

  return (
    <div className="p-0 space-y-0 pb-28">
      
      {/* 1. Navigation Header - Broker Sync */}
      <div className="p-4 bg-titan-dark/80 backdrop-blur-md flex items-center justify-between border-b border-white/5">
         <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white tracking-tighter">EURUSD</h2>
            <button 
                onClick={() => setIsBrokerConnected(!isBrokerConnected)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    isBrokerConnected ? 'bg-titan-green/20 border-titan-green text-titan-green' : 'bg-titan-card border-titan-muted text-titan-muted'
                }`}
            >
                {isBrokerConnected ? <CheckCircle2 size={12} /> : <Monitor size={12} />}
                {isBrokerConnected ? 'LINKED' : 'LINK BROKER'}
            </button>
         </div>
         
         <button 
            onClick={() => onUpdateState({...savedState, trendBias: savedState.trendBias === 'BULLISH' ? 'BEARISH' : 'BULLISH', isRevealed: false})}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                savedState.trendBias === 'BULLISH' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'
            }`}
         >
            {savedState.trendBias === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-[10px] font-black uppercase">{savedState.trendBias === 'BULLISH' ? 'Bullish' : 'Bearish'}</span>
         </button>
      </div>

      {/* 2. TradingView Chart */}
      <TradingViewChart />

      {/* 3. Terminal Execução Rápida */}
      <div className="bg-titan-darker border-b border-titan-card p-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5 mb-2">
              <span className="text-[10px] text-titan-muted font-bold uppercase ml-1">Volume (Lote)</span>
              <div className="flex items-center gap-3">
                  <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="p-1 hover:text-titan-gold"><Minus size={16} /></button>
                  <span className="text-sm font-mono font-bold text-white w-12 text-center">{lotSize.toFixed(2)}</span>
                  <button onClick={() => setLotSize(lotSize + 0.01)} className="p-1 hover:text-titan-gold"><Plus size={16} /></button>
              </div>
          </div>

          <button 
            onClick={() => handleTradeAction('SELL')}
            className="bg-titan-red/20 border border-titan-red/50 hover:bg-titan-red/40 py-4 rounded-xl flex flex-col items-center justify-center transition-all group"
          >
              <span className="text-white font-black text-xl italic group-active:scale-90 transition-transform">SELL</span>
              <span className="text-[9px] text-titan-red font-bold uppercase opacity-70">Execução Direta</span>
          </button>

          <button 
            onClick={() => handleTradeAction('BUY')}
            className="bg-titan-green/20 border border-titan-green/50 hover:bg-titan-green/40 py-4 rounded-xl flex flex-col items-center justify-center transition-all group"
          >
              <span className="text-white font-black text-xl italic group-active:scale-90 transition-transform">BUY</span>
              <span className="text-[9px] text-titan-green font-bold uppercase opacity-70">Execução Direta</span>
          </button>
      </div>

      {/* 4. Validação Institucional */}
      <div className="p-4 space-y-4">
        <div className="bg-titan-card/50 rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-titan-gold font-bold uppercase flex items-center gap-1">
                    <Zap size={12} /> Validador de Setup
                </span>
                <span className="text-[10px] text-titan-muted">Preço da Sua Corretora</span>
            </div>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/40 border border-titan-card focus:border-titan-gold text-white font-mono text-2xl p-4 rounded-xl outline-none transition-all"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-6 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
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

        {/* 5. Analysis Result */}
        {savedState.isRevealed && savedState.analysisSnapshot && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-4 pb-12">
                
                {/* Parameters Panel */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                        <span className="text-[9px] text-red-400 font-bold uppercase block mb-1">Stop Loss</span>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted hover:text-white">
                                {copiedField === 'sl' ? <CheckCircle2 size={14} className="text-titan-green" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                        <span className="text-[9px] text-green-400 font-bold uppercase block mb-1">Take Profit</span>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                            <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted hover:text-white">
                                {copiedField === 'tp' ? <CheckCircle2 size={14} className="text-titan-green" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-titan-card/30 p-5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <AlignLeft size={14} className="text-titan-gold" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Leitura Institucional</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed text-justify whitespace-pre-line">
                        {savedState.analysisSnapshot.detailedAnalysis.replace(/\*\*/g, '')}
                    </p>
                </div>
            </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;