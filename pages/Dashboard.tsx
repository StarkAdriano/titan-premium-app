
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Calculator, CheckCircle2, AlignLeft, Lock, Activity, RotateCcw, Shield, AlertTriangle, Terminal, Settings2, BarChart3, ArrowDown, ArrowUp, Monitor, Copy, ExternalLink, Zap } from 'lucide-react';

// Fix: Add referencePrice to match the state structure used in App.tsx
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
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "br",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });
    if (container.current) {
        container.current.innerHTML = '';
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-[350px] bg-black rounded-xl overflow-hidden border border-titan-card mb-6 shadow-2xl" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

// --- LÓGICA TITAN PREMIUM (REFINADA COM PREÇO AUTOMÁTICO) ---
const generateTitanAnalysis = (
    assetSymbol: string, 
    inputPrice: number, 
    marketPrice: number,
    bias: 'BULLISH' | 'BEARISH'
): AnalysisResult => {
    const deviation = inputPrice - marketPrice;
    const pipsDeviation = (Math.abs(deviation) * 10000).toFixed(1); 
    const isPremium = deviation > 0;
    
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 20; 
    const TARGET_PIPS = 60; 

    if (bias === 'BULLISH') {
        if (!isPremium) { // Discount Zone
            const slPrice = (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5);
            return {
                status: SignalStatus.BUY,
                shortSummary: `Execução Autorizada. Preço em Desconto Institucional.`,
                detailedAnalysis: `**ALVO: LIQUIDEZ COMPRADORA**\nO preço de ${inputPrice} está abaixo do equilíbrio de mercado (${marketPrice.toFixed(5)}). Setup de reversão em Discount validado.`,
                validationStatus: 'OK',
                validationMsg: 'Contexto de Alta Confirmado',
                referencePrice: marketPrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                commandLine: `${assetSymbol} BUY @ ${inputPrice.toFixed(5)} SL ${slPrice} TP ${tpPrice}`
            };
        }
    } else {
        if (isPremium) { // Premium Zone
            const slPrice = (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);
            return {
                status: SignalStatus.SELL,
                shortSummary: `Execução Autorizada. Preço em Premium Institucional.`,
                detailedAnalysis: `**ALVO: LIQUIDEZ VENDEDORA**\nO preço de ${inputPrice} está acima do equilíbrio de mercado (${marketPrice.toFixed(5)}). Setup de rejeição em Premium validado.`,
                validationStatus: 'OK',
                validationMsg: 'Contexto de Baixa Confirmado',
                referencePrice: marketPrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                commandLine: `${assetSymbol} SELL @ ${inputPrice.toFixed(5)} SL ${slPrice} TP ${tpPrice}`
            };
        }
    }

    return {
        status: SignalStatus.WAIT,
        shortSummary: `Aguarde Localização Melhor.`,
        detailedAnalysis: `O preço atual não oferece uma relação Risco/Retorno favorável neste exato momento. Aguarde o preço atingir as extremidades de Premium/Discount para agir.`,
        validationStatus: 'WARNING',
        validationMsg: 'Preço em Zona de Briga',
        referencePrice: marketPrice.toFixed(5)
    };
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const currentMarketPrice = parseFloat(asset.price);

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
            const inputVal = parseFloat(sanitizedPrice);
            const result = generateTitanAnalysis(asset.symbol, inputVal, currentMarketPrice, savedState.trendBias);
            // Fix: Sync the calculated referencePrice to the top-level state
            onUpdateState({ 
              ...savedState, 
              isRevealed: true, 
              analysisSnapshot: result,
              referencePrice: result.referencePrice 
            });
            setIsValidating(false);
        }, 600);
    }
  };

  const handleReset = () => {
      onUpdateState({ ...savedState, userPrice: '', isRevealed: false, analysisSnapshot: null });
  };

  return (
    <div className="p-4 space-y-6 pb-28">
      
      {/* 1. Header & Live Price */}
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                {asset.symbol} <span className="text-[10px] bg-titan-gold/20 text-titan-gold px-2 py-0.5 rounded">LIVE</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-titan-green animate-pulse"></div>
                <span className="text-xl font-mono font-bold text-white">{asset.price}</span>
            </div>
         </div>
         
         <button 
            onClick={() => onUpdateState({...savedState, trendBias: savedState.trendBias === 'BULLISH' ? 'BEARISH' : 'BULLISH', isRevealed: false})}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                savedState.trendBias === 'BULLISH' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'
            }`}
         >
            {savedState.trendBias === 'BULLISH' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-xs font-black">{savedState.trendBias === 'BULLISH' ? 'BUY ONLY' : 'SELL ONLY'}</span>
         </button>
      </div>

      {/* 2. TradingView Widget */}
      <TradingViewChart />

      {/* 3. Execution Input */}
      <div className="bg-titan-card/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
        <div className="flex flex-col items-center gap-5">
            <div className="w-full">
                <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-[10px] text-titan-gold font-bold uppercase tracking-widest flex items-center gap-1">
                        <Zap size={12} /> Preço de Entrada (MT4/MT5)
                    </span>
                    <span className="text-[10px] text-titan-muted">Insira o preço da sua corretora</span>
                </div>
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="0.00000"
                    disabled={savedState.isRevealed}
                    className="w-full bg-black/40 border-2 border-titan-card focus:border-titan-gold text-white font-mono text-4xl py-4 text-center outline-none transition-all rounded-xl placeholder-gray-800"
                />
            </div>

            {!savedState.isRevealed ? (
                <button 
                    onClick={handleReveal}
                    disabled={isValidating || !savedState.userPrice}
                    className="w-full bg-titan-gold text-black font-black uppercase tracking-widest py-5 rounded-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    {isValidating ? <Activity className="animate-spin" /> : <Shield size={20} />}
                    {isValidating ? "Processando..." : "Validar Operação"}
                </button>
            ) : (
                <button onClick={handleReset} className="text-xs text-titan-muted hover:text-white flex items-center gap-2 uppercase tracking-tighter">
                    <RotateCcw size={14} /> Limpar e Nova Análise
                </button>
            )}
        </div>
      </div>

      {/* 4. Analysis & Fast Execution Panel */}
      {savedState.isRevealed && savedState.analysisSnapshot && (
        <div className="animate-in slide-in-from-bottom-6 fade-in duration-500 space-y-4">
            
            {/* Status Header */}
            <div className={`p-6 rounded-2xl border-2 text-center shadow-2xl bg-black/40 ${
                savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green shadow-green-900/20' : 
                savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red shadow-red-900/20' : 'border-titan-gold'
            }`}>
                <span className={`text-5xl font-black italic tracking-tighter ${
                    savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                    savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                }`}>
                    {savedState.analysisSnapshot.status}
                </span>
                <p className="text-xs text-gray-400 mt-2 font-medium">{savedState.analysisSnapshot.shortSummary}</p>
            </div>

            {/* Quick Copy Panel (The Real Tool) */}
            {savedState.analysisSnapshot.status !== SignalStatus.WAIT && (
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')}
                        className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex flex-col items-center gap-1 active:bg-red-900/40 transition-colors"
                    >
                        <span className="text-[10px] text-red-400 font-bold uppercase">STOP LOSS</span>
                        <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                        <span className="text-[8px] text-red-500/50">{copiedField === 'sl' ? 'COPIADO!' : 'CLIQUE PARA COPIAR'}</span>
                    </button>

                    <button 
                        onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')}
                        className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex flex-col items-center gap-1 active:bg-green-900/40 transition-colors"
                    >
                        <span className="text-[10px] text-green-400 font-bold uppercase">TAKE PROFIT</span>
                        <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                        <span className="text-[8px] text-green-500/50">{copiedField === 'tp' ? 'COPIADO!' : 'CLIQUE PARA COPIAR'}</span>
                    </button>
                </div>
            )}

            {/* Detailed Rationale */}
            <div className="bg-titan-card/30 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                    <AlignLeft size={14} className="text-titan-gold" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Racional de Entrada</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                    {savedState.analysisSnapshot.detailedAnalysis.replace(/\*\*/g, '')}
                </p>
            </div>

            {/* Global Command */}
            {savedState.analysisSnapshot.commandLine && (
                <div 
                    onClick={() => handleCopy(savedState.analysisSnapshot?.commandLine || '', 'cmd')}
                    className="bg-black border border-titan-gold/30 p-4 rounded-xl cursor-pointer hover:bg-titan-gold/5 transition-colors group"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-titan-muted font-bold uppercase">Comando de Execução Rápida</span>
                        {copiedField === 'cmd' ? <CheckCircle2 size={12} className="text-titan-green" /> : <Copy size={12} className="text-titan-gold" />}
                    </div>
                    <code className="text-[11px] font-mono text-titan-gold group-hover:text-white transition-colors">
                        {savedState.analysisSnapshot.commandLine}
                    </code>
                </div>
            )}
        </div>
      )}

      {/* Manual Broker Link */}
      <div className="pt-4 opacity-50 text-center">
         <p className="text-[9px] text-titan-muted uppercase tracking-[0.3em]">Titan Institutional Trading Engine</p>
      </div>

    </div>
  );
};

export default Dashboard;
