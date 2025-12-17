import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Calculator, CheckCircle2, AlignLeft, Lock, Activity, RotateCcw, Shield, AlertTriangle, Terminal, Settings2, Edit3, Save, BarChart3, ArrowDown, ArrowUp, Monitor, Copy } from 'lucide-react';

interface DashboardState {
    userPrice: string;
    isRevealed: boolean;
    analysisSnapshot: AnalysisResult | null;
    referencePrice: string; // Preço Justo / Equilibrium
    trendBias: 'BULLISH' | 'BEARISH'; // Tendência Macro
}

interface DashboardProps {
  asset: Asset; 
  savedState: DashboardState;
  onUpdateState: (newState: DashboardState) => void;
}

// --- GERADOR DINÂMICO DE SCRIPT TRADINGVIEW (V8 - HYBRID MODE) ---
// Adicionamos a opção de DESLIGAR o filtro para ver o passado (Backtest)
const getDynamicPineScript = (currentRef: string, currentBias: 'BULLISH' | 'BEARISH') => {
    // Normalização dos valores
    const price = currentRef.replace(',', '.') || '1.05450';
    const biasPine = currentBias === 'BULLISH' ? 'Bullish' : 'Bearish';
    
    return `//@version=5
indicator("Titan Premium - Institutional Setup", overlay=true, shorttitle="TITAN PRO")

// --- CORES INSTITUCIONAIS ---
var titanGold = color.new(#d4af37, 0)
var redZone = color.new(#ef4444, 90)   // Vermelho transparente
var greenZone = color.new(#10b981, 90) // Verde transparente

// --- CONFIGURAÇÃO ---
refPrice = input.float(${price}, title="Preço de Referência (Fair Value)")
trendBias = input.string("${biasPine}", title="Tendência Macro (App)", options=["Bullish", "Bearish"])
useTrendFilter = input.bool(true, title="Filtrar Sinais pelo Viés Atual?") // OPÇÃO NOVA
showZones = input.bool(true, title="Mostrar Zonas Premium/Discount")

// --- LÓGICA ---
isPremium = close > refPrice
isDiscount = close < refPrice

// --- VISUALIZAÇÃO ---
bgcolor(showZones and isPremium ? redZone : na, title="Premium Zone")
bgcolor(showZones and isDiscount ? greenZone : na, title="Discount Zone")
plot(refPrice, "Equilibrium", color=titanGold, linewidth=2, style=plot.style_linebr)

// --- FILTRO DE DIREÇÃO INTELIGENTE ---
// Se 'useTrendFilter' for true (Padrão), obedece o App (Segurança).
// Se 'useTrendFilter' for false, mostra tudo (Estudo/Backtest).
canBuy = useTrendFilter ? (trendBias == "Bullish") : true
canSell = useTrendFilter ? (trendBias == "Bearish") : true

// --- GATILHOS ---
// Venda: Premium + Rejeição (+ Filtro de Tendência opcional)
bearSignal = canSell and isPremium and (high - close) > (close - open) * 2
plotshape(bearSignal, title="Venda Titan", location=location.abovebar, color=color.red, style=shape.labeldown, text="SELL", textcolor=color.white)

// Compra: Desconto + Força (+ Filtro de Tendência opcional)
bullSignal = canBuy and isDiscount and close > open
plotshape(bullSignal, title="Compra Titan", location=location.belowbar, color=color.green, style=shape.labelup, text="BUY", textcolor=color.black)

// --- PAINEL DE CONTROLE VISUAL ---
var table panel = table.new(position.top_right, 2, 4, border_width=1)
if barstate.islast
    // Cabeçalho
    table.cell(panel, 0, 0, "TITAN MONITOR", bgcolor=color.black, text_color=titanGold)
    
    // Linha 1: Viés Atual
    table.cell(panel, 0, 1, "Viés App:", bgcolor=color.black, text_color=color.white)
    table.cell(panel, 1, 1, trendBias, bgcolor=trendBias == "Bullish" ? color.green : color.red, text_color=color.white)
    
    // Linha 2: Status do Filtro
    table.cell(panel, 0, 2, "Filtro:", bgcolor=color.black, text_color=color.white)
    table.cell(panel, 1, 2, useTrendFilter ? "ATIVADO" : "DESLIGADO", bgcolor=useTrendFilter ? color.blue : color.gray, text_color=color.white)
    
    // Linha 3: Zona Atual
    table.cell(panel, 0, 3, "Zona:", bgcolor=color.black, text_color=color.white)
    table.cell(panel, 1, 3, isPremium ? "PREMIUM" : "DESCONTO", bgcolor=isPremium ? color.red : color.green, text_color=color.white)`;
};

// --- LÓGICA TITAN PREMIUM (REFINADA) ---
const generateTitanAnalysis = (
    assetSymbol: string, 
    inputPrice: number, 
    referencePrice: number,
    bias: 'BULLISH' | 'BEARISH'
): AnalysisResult => {
    
    // 1. Calcular Desvio (Premium vs Discount)
    const deviation = inputPrice - referencePrice;
    const pipsDeviation = (Math.abs(deviation) * 10000).toFixed(1); 
    const isPremium = deviation > 0;
    const isDiscount = deviation < 0;
    
    // Configurações de Risco
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 20; // Stop curto institucional
    const TARGET_PIPS = 60; // Alvo 1:3

    // LÓGICA DE DECISÃO HÍBRIDA (TREND + LOCATION)

    // CENÁRIO 1: TENDÊNCIA DE ALTA (Procurar compras no Desconto)
    if (bias === 'BULLISH') {
        if (isDiscount) {
            // PERFEITO: Tendência de Alta + Preço Barato
            const slPrice = (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5);
            
            return {
                status: SignalStatus.BUY,
                shortSummary: `Compra Validada (Discount Zone).`,
                detailedAnalysis: `**SETUP DE ALTA PROBABILIDADE**\n
                **1. Tendência:** O viés macro é de ALTA (Bullish).\n
                **2. Localização:** O preço recuou para a Zona de Desconto (-${pipsDeviation} pips do Ref). Isso é "comprar barato".\n
                **3. Gatilho:** O preço atingiu suporte institucional abaixo do preço justo.\n
                **Ação:** Executar COMPRA visando renovação de topo.`,
                validationStatus: 'OK',
                validationMsg: 'Setup Alinhado (Trend + Localização)',
                referencePrice: referencePrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                rrRatio: '1:3',
                commandLine: `${assetSymbol} BUY LIMIT @ ${inputPrice.toFixed(5)} SL ${slPrice} TP ${tpPrice}`
            };
        } else {
            // PERIGO: Tendência de Alta mas Preço Caro
             return {
                status: SignalStatus.WAIT,
                shortSummary: `Zona Premium. Não compre topo.`,
                detailedAnalysis: `**ALERTA DE RISCO**\n
                O viés é de Alta, mas o preço atual (${inputPrice}) está na Zona Premium (Caro).\n
                Comprar agora reduz drasticamente sua relação Risco/Retorno.\n
                **Recomendação:** Aguarde um pullback até pelo menos ${referencePrice.toFixed(5)} para comprar.`,
                validationStatus: 'WARNING',
                validationMsg: 'Preço Esticado (Aguardar Recuo)',
                referencePrice: referencePrice.toFixed(5),
                commandLine: `${assetSymbol} - AGUARDAR PULLBACK`
            };
        }
    }

    // CENÁRIO 2: TENDÊNCIA DE BAIXA (Procurar vendas no Premium)
    else {
        if (isPremium) {
            // PERFEITO: Tendência de Baixa + Preço Caro
            const slPrice = (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);
            
            return {
                status: SignalStatus.SELL,
                shortSummary: `Venda Validada (Premium Zone).`,
                detailedAnalysis: `**SETUP DE ALTA PROBABILIDADE**\n
                **1. Tendência:** O viés macro é de BAIXA (Bearish).\n
                **2. Localização:** O preço subiu para a Zona Premium (+${pipsDeviation} pips do Ref). Isso é "vender caro".\n
                **3. Gatilho:** Rejeição em bloco de ordens acima do preço justo.\n
                **Ação:** Executar VENDA visando liquidez nos fundos.`,
                validationStatus: 'OK',
                validationMsg: 'Setup Alinhado (Trend + Localização)',
                referencePrice: referencePrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                rrRatio: '1:3',
                commandLine: `${assetSymbol} SELL LIMIT @ ${inputPrice.toFixed(5)} SL ${slPrice} TP ${tpPrice}`
            };
        } else {
            // PERIGO: Tendência de Baixa mas Preço Barato
            return {
                status: SignalStatus.WAIT,
                shortSummary: `Zona de Desconto. Não venda fundo.`,
                detailedAnalysis: `**ALERTA DE RISCO**\n
                O viés é de Baixa, mas o preço já caiu muito e está na Zona de Desconto.\n
                Vender agora é "vender fundo" e ficar exposto a um Short Squeeze.\n
                **Recomendação:** Aguarde um repique (Inducement) até ${referencePrice.toFixed(5)} para vender.`,
                validationStatus: 'WARNING',
                validationMsg: 'Preço Esticado (Aguardar Repique)',
                referencePrice: referencePrice.toFixed(5),
                commandLine: `${assetSymbol} - AGUARDAR REPIQUE`
            };
        }
    }
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [isEditingRef, setIsEditingRef] = useState(false);
  const [tempRefPrice, setTempRefPrice] = useState('');
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!savedState.referencePrice) {
        onUpdateState({
            ...savedState,
            referencePrice: asset.price,
            trendBias: 'BEARISH' 
        });
    }
    return () => { isMounted.current = false; };
  }, []);

  // --- LIVE ZONE CALCULATION (O MONITOR EM TEMPO REAL) ---
  const currentInput = parseFloat(savedState.userPrice.replace(',', '.') || '0');
  const refPrice = parseFloat(savedState.referencePrice || asset.price);
  const diff = currentInput - refPrice;
  const isPremium = diff > 0;
  const isDiscount = diff < 0;
  const isZero = diff === 0 || !savedState.userPrice;
  
  // Cores dinâmicas baseadas na posição do preço
  const zoneColor = isZero ? 'text-gray-500' : isPremium ? 'text-titan-red' : 'text-titan-green';
  const zoneLabel = isZero ? 'Neutro' : isPremium ? 'PREMIUM (Venda)' : 'DESCONTO (Compra)';
  const zoneIcon = isZero ? <Activity size={14} /> : isPremium ? <ArrowUp size={14} /> : <ArrowDown size={14} />;

  const getStatusColor = (status: SignalStatus) => {
    switch (status) {
      case SignalStatus.BUY: return 'text-titan-green border-titan-green';
      case SignalStatus.SELL: return 'text-titan-red border-titan-red';
      case SignalStatus.WAIT: return 'text-titan-gold border-titan-gold';
    }
  };

  const getStatusBg = (status: SignalStatus) => {
    switch (status) {
      case SignalStatus.BUY: return 'bg-titan-green/10';
      case SignalStatus.SELL: return 'bg-titan-red/10';
      case SignalStatus.WAIT: return 'bg-titan-gold/10';
    }
  };

  const toggleBias = () => {
      onUpdateState({
          ...savedState,
          trendBias: savedState.trendBias === 'BULLISH' ? 'BEARISH' : 'BULLISH',
          isRevealed: false,
          analysisSnapshot: null
      });
  };

  const saveRefPrice = () => {
      if (tempRefPrice && !isNaN(parseFloat(tempRefPrice))) {
          onUpdateState({
              ...savedState,
              referencePrice: tempRefPrice,
              isRevealed: false, 
              analysisSnapshot: null
          });
          setIsEditingRef(false);
      } else {
          setIsEditingRef(false);
      }
  };

  const startEditingRef = () => {
      setTempRefPrice(savedState.referencePrice || asset.price);
      setIsEditingRef(true);
  };

  // Botão Inteligente: Gera o script com os valores ATUAIS do Dashboard
  const handleCopyScript = () => {
      const dynamicScript = getDynamicPineScript(
          savedState.referencePrice || asset.price,
          savedState.trendBias
      );
      navigator.clipboard.writeText(dynamicScript);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 3000);
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setCopied(false);
        
        setTimeout(() => {
            if (!isMounted.current) return;
            const inputVal = parseFloat(sanitizedPrice);
            const result = generateTitanAnalysis(asset.symbol, inputVal, refPrice, savedState.trendBias);

            onUpdateState({
                ...savedState,
                isRevealed: true,
                analysisSnapshot: result
            });
            setIsValidating(false);
        }, 800);
    }
  };

  const handleReset = () => {
      setCopied(false);
      onUpdateState({
          ...savedState,
          userPrice: '',
          isRevealed: false,
          analysisSnapshot: null
      });
  };

  const handleCopyCommand = () => {
      if (savedState.analysisSnapshot?.commandLine) {
          navigator.clipboard.writeText(savedState.analysisSnapshot.commandLine);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^[\d,.]*$/.test(val)) {
          onUpdateState({
              ...savedState,
              userPrice: val
          });
      }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      
      {/* 1. Header & Context Config */}
      <div className="pt-2">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black text-white tracking-tighter">{asset.symbol}</h2>
            
            {/* Trend Toggle */}
            <button 
                onClick={toggleBias}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    savedState.trendBias === 'BULLISH' 
                    ? 'bg-green-900/30 border-green-500/50 text-green-400' 
                    : 'bg-red-900/30 border-red-500/50 text-red-400'
                }`}
            >
                {savedState.trendBias === 'BULLISH' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-xs font-bold">{savedState.trendBias === 'BULLISH' ? 'ALTA' : 'BAIXA'}</span>
            </button>
         </div>

         {/* Reference Price Config */}
         <div className="bg-titan-card rounded-lg p-3 border border-titan-card flex flex-col justify-between">
             
             {/* Label Header com Botão Script */}
             <div className="flex items-center justify-between mb-2 w-full">
                <span className="text-[10px] text-titan-muted uppercase tracking-wider flex items-center gap-1">
                    <Settings2 size={10} /> PREÇO DE REFERÊNCIA (FAIR VALUE)
                </span>
                
                <button 
                    onClick={handleCopyScript} 
                    className={`flex items-center gap-1 text-[9px] font-bold px-3 py-1.5 rounded border transition-all ${
                        scriptCopied 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                        : 'bg-titan-dark text-titan-gold border-titan-gold/30 hover:bg-titan-gold/10 hover:border-titan-gold/60'
                    }`}
                >
                    {scriptCopied ? <CheckCircle2 size={12} /> : <Monitor size={12} />}
                    {scriptCopied ? 'COPIADO!' : 'SCRIPT TRADINGVIEW'}
                </button>
             </div>
                
            {/* Input / Display */}
            {isEditingRef ? (
                <div className="flex items-center gap-2">
                    <input 
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        className="bg-black/50 text-white font-mono text-sm p-1 rounded w-full border border-titan-gold focus:outline-none"
                        value={tempRefPrice}
                        onChange={(e) => setTempRefPrice(e.target.value)}
                    />
                    <button onClick={saveRefPrice} className="text-green-400"><Save size={16} /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 cursor-pointer group" onClick={startEditingRef}>
                    <span className="text-sm font-mono font-bold text-white group-hover:text-titan-gold transition-colors border-b border-dashed border-gray-600">
                        {savedState.referencePrice || asset.price}
                    </span>
                    <Edit3 size={12} className="text-titan-muted opacity-50 group-hover:opacity-100" />
                </div>
            )}
         </div>
      </div>

      {/* 2. Input Section */}
      <div className={`bg-titan-card/40 backdrop-blur-sm rounded-xl p-6 border transition-all duration-500 ${savedState.isRevealed ? 'border-titan-card' : 'border-titan-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]'}`}>
        <div className="flex flex-col items-center gap-4">
            
            <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator size={16} className="text-titan-gold" />
                    <label className="text-xs text-titan-gold uppercase font-bold tracking-wider">
                    Sua Entrada (Preço Atual)
                    </label>
                </div>
                <div className="relative flex items-center max-w-[240px] mx-auto">
                    <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={handleInputChange}
                    placeholder="0.00000"
                    disabled={savedState.isRevealed}
                    className={`w-full bg-titan-darker border-b-2 ${savedState.isRevealed ? 'border-titan-muted text-gray-500' : 'border-titan-card focus:border-titan-gold text-white'} font-mono text-3xl py-3 text-center focus:outline-none transition-all placeholder-gray-700 rounded-t-lg`}
                    />
                </div>
                
                {/* --- MONITOR DE ZONA EM TEMPO REAL --- */}
                {/* Isso garante que você saiba onde está antes de gerar o sinal */}
                {!savedState.isRevealed && savedState.userPrice && (
                    <div className="flex items-center justify-center gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                        <span className={`text-xs font-bold uppercase flex items-center gap-1 ${zoneColor}`}>
                            {zoneIcon} {zoneLabel}
                        </span>
                    </div>
                )}
            </div>

            <button 
                onClick={handleReveal}
                disabled={isValidating || !savedState.userPrice || savedState.isRevealed}
                className={`mt-2 w-full font-bold uppercase tracking-wider py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait ${
                    savedState.isRevealed 
                    ? 'hidden' 
                    : 'bg-titan-gold text-black hover:bg-titan-goldLight hover:scale-[1.02]'
                }`}
            >
                {isValidating ? (
                    <>
                        <Activity size={18} className="animate-spin" />
                        Validando Setup...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Analisar Entrada
                    </>
                )}
            </button>

            {savedState.isRevealed && (
                 <button 
                 onClick={handleReset}
                 className="mt-1 flex items-center gap-2 text-xs text-titan-muted hover:text-white uppercase tracking-wider border border-titan-card px-4 py-2 rounded-full hover:bg-titan-card transition-colors"
                >
                 <RotateCcw size={14} /> Nova Análise
                </button>
            )}
        </div>
      </div>

      {/* 3. Analysis Result (Conditional) */}
      {savedState.isRevealed && savedState.analysisSnapshot ? (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-6">
            
            {/* Main Signal Card */}
            <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-titan-card via-titan-dark to-black border border-titan-gold/30 rounded-2xl"></div>
                
                <div className="relative p-8 text-center z-10">
                    <p className="text-[10px] text-titan-muted uppercase mb-4 tracking-[0.2em] font-bold animate-pulse">Sinal Institucional</p>

                    <div className={`inline-block px-8 py-3 rounded-lg border ${getStatusColor(savedState.analysisSnapshot.status)} ${getStatusBg(savedState.analysisSnapshot.status)} backdrop-blur-md mb-6 shadow-2xl`}>
                        <span className="text-4xl font-black tracking-widest uppercase drop-shadow-lg flex items-center justify-center gap-3">
                            {savedState.analysisSnapshot.status}
                        </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-snug max-w-[90%] mx-auto font-medium">
                        {savedState.analysisSnapshot.shortSummary}
                    </p>
                </div>
            </div>

            {/* Validation Feedback */}
            <div className={`px-4 py-3 rounded-lg border flex items-center justify-between gap-3 ${
                savedState.analysisSnapshot.validationStatus === 'OK' 
                ? 'bg-titan-green/5 border-titan-green/20' 
                : 'bg-titan-gold/5 border-titan-gold/20'
            }`}>
                <div className="flex items-center gap-2">
                    {savedState.analysisSnapshot.validationStatus === 'OK' ? (
                        <CheckCircle2 size={16} className="text-titan-green" />
                    ) : (
                        <AlertTriangle size={16} className="text-titan-gold" />
                    )}
                    <span className={`text-[10px] font-bold uppercase ${
                        savedState.analysisSnapshot.validationStatus === 'OK' ? 'text-titan-green' : 'text-titan-gold'
                    }`}>
                        {savedState.analysisSnapshot.validationMsg}
                    </span>
                </div>
            </div>

            {/* --- TRADE PARAMETERS (SL/TP - VISUAL) --- */}
            {savedState.analysisSnapshot.status !== SignalStatus.WAIT && savedState.analysisSnapshot.stopLoss && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="grid grid-cols-3 gap-2">
                        {/* STOP LOSS */}
                        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-3 text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider mb-1">Stop Loss</span>
                            <span className="text-sm font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                            <span className="text-[8px] text-red-500/70 mt-1">20 pips</span>
                        </div>

                        {/* ENTRY */}
                        <div className="bg-titan-card border border-titan-gold/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                            <span className="text-[9px] text-titan-gold font-bold uppercase tracking-wider mb-1">Entrada</span>
                            <span className="text-sm font-mono font-bold text-white">{savedState.userPrice}</span>
                        </div>

                        {/* TAKE PROFIT */}
                        <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-3 text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider mb-1">Take Profit</span>
                            <span className="text-sm font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                            <span className="text-[8px] text-green-500/70 mt-1">60 pips</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- COMMAND LINE --- */}
            {savedState.analysisSnapshot.commandLine && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="bg-black/40 border border-titan-gold/30 rounded-lg p-3 relative group">
                        <div className="flex items-center gap-2 mb-1">
                            <Terminal size={12} className="text-titan-muted" />
                            <span className="text-[10px] text-titan-muted uppercase">Comando Operacional</span>
                        </div>
                        <code className="text-[11px] font-mono text-green-400 break-all block leading-relaxed pr-8">
                            {savedState.analysisSnapshot.commandLine}
                        </code>
                        <button 
                            onClick={handleCopyCommand}
                            className={`absolute top-2 right-2 p-1.5 rounded transition-all ${copied ? 'bg-green-500 text-black' : 'bg-titan-card text-titan-muted hover:text-white'}`}
                        >
                            {copied ? <CheckCircle2 size={14} /> : <Terminal size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Detailed Rationale */}
            <div className="space-y-3 delay-150 animate-in slide-in-from-bottom-4 duration-700 fill-mode-backwards">
                <div className="flex items-center gap-2 px-1">
                    <AlignLeft size={16} className="text-titan-gold" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Racional Institucional
                    </h3>
                </div>
                
                <div className="bg-titan-card/30 rounded-xl p-5 border border-titan-card hover:border-titan-gold/10 transition-colors">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                        <span className="text-[10px] text-titan-muted uppercase">Viés: <span className={savedState.trendBias === 'BULLISH' ? 'text-green-400' : 'text-red-400'}>{savedState.trendBias === 'BULLISH' ? 'Alta (Bull)' : 'Baixa (Bear)'}</span></span>
                        <div className="flex items-center gap-1">
                            <BarChart3 size={12} className="text-titan-gold" />
                            <span className="text-xs font-mono text-titan-gold">Ref: {savedState.analysisSnapshot.referencePrice}</span>
                        </div>
                    </div>
                    <div className="text-gray-300 leading-7 text-sm text-justify font-sans whitespace-pre-line">
                        {savedState.analysisSnapshot.detailedAnalysis.split('\n').map((line, i) => (
                            <span key={i} className="block mb-2">
                                {line.includes('**') ? (
                                    <strong className="text-white">{line.replace(/\*\*/g, '')}</strong>
                                ) : (
                                    line
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risk Management (Footer) */}
            <div className="pt-4 delay-200 animate-in slide-in-from-bottom-4 duration-700">
                <div className="bg-titan-card rounded-xl border border-titan-card overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Shield size={14} className="text-titan-gold" />
                            <span className="text-[10px] font-bold text-white uppercase">Gestão Titan</span>
                         </div>
                         <span className="text-[10px] text-titan-muted">Risco Sugerido: 0.5% - 1%</span>
                    </div>
                </div>
            </div>

          </div>
      ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 opacity-40 space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-titan-card border-2 border-titan-card flex items-center justify-center mb-4">
                  <Calculator size={24} className="text-titan-muted" />
              </div>
              <p className="text-xs text-titan-muted uppercase tracking-wider text-center max-w-[200px]">
                  Insira o preço e valide o contexto institucional.
              </p>
          </div>
      )}

    </div>
  );
};

export default Dashboard;