import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Calculator, CheckCircle2, Clock, AlignLeft, Lock, Activity, RotateCcw, Shield, AlertTriangle, Terminal, Settings2, Edit3, Save } from 'lucide-react';

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

// --- LÓGICA TITAN PREMIUM (CORRIGIDA E SINCRONIZADA) ---
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
    
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Configurações de Risco (Stop Técnico vs Financeiro)
    // Padrão EURUSD: Stop 20 pips, Alvo 60 pips (1:3)
    const PIP_VAL = 0.0001;
    const STOP_PIPS = 20;
    const TARGET_PIPS = 60;

    // --- CENÁRIO 1: TENDÊNCIA DE ALTA (BULLISH) ---
    if (bias === 'BULLISH') {
        // Se estamos em ALTA, queremos comprar BARATO (Desconto)
        if (isDiscount) {
            const slPrice = (inputPrice - (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice + (TARGET_PIPS * PIP_VAL)).toFixed(5);
            const command = `${assetSymbol} BUY @ ${inputPrice.toFixed(5)} | SL: ${slPrice} | TP: ${tpPrice}`;

            return {
                status: SignalStatus.BUY,
                shortSummary: `Oportunidade de Compra a Favor da Tendência.`,
                detailedAnalysis: `**ANÁLISE INSTITUCIONAL (BULLISH)**\n
                **Contexto:** O mercado tem fluxo comprador. O preço recuou para a zona de **Desconto** (-${pipsDeviation} pips do Ref).\n
                **Ação:** Compra validada. Estamos comprando barato para seguir o fluxo principal.\n
                **Alvo:** Liquidez nos topos anteriores (Buy Side Liquidity).`,
                validationStatus: 'OK',
                validationMsg: 'Setup Aprovado (Trend + Discount)',
                referencePrice: referencePrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                rrRatio: '1:3',
                commandLine: command
            };
        } 
        // Se estamos em ALTA mas o preço está CARO (Premium)
        else {
             return {
                status: SignalStatus.WAIT,
                shortSummary: `Preço esticado (Premium). Aguarde retração.`,
                detailedAnalysis: `**MODO DE ESPERA**\n
                **Contexto:** A tendência é de Alta, mas o preço já subiu muito (+${pipsDeviation} pips acima do Ref).\n
                **Risco:** Comprar agora é comprar topo. Vender é contra a tendência.\n
                **Ação:** Aguarde o preço retornar ao Preço Justo (${referencePrice.toFixed(5)}) ou formar um novo bloco de suporte.`,
                validationStatus: 'WARNING',
                validationMsg: 'Aguardar Retração (Pullback)',
                referencePrice: referencePrice.toFixed(5),
                commandLine: `${assetSymbol} - AGUARDAR RETRAÇÃO`
            };
        }
    }

    // --- CENÁRIO 2: TENDÊNCIA DE BAIXA (BEARISH) ---
    else {
        // Se estamos em BAIXA, queremos vender CARO (Premium)
        if (isPremium) {
            const slPrice = (inputPrice + (STOP_PIPS * PIP_VAL)).toFixed(5);
            const tpPrice = (inputPrice - (TARGET_PIPS * PIP_VAL)).toFixed(5);
            const command = `${assetSymbol} SELL @ ${inputPrice.toFixed(5)} | SL: ${slPrice} | TP: ${tpPrice}`;

            return {
                status: SignalStatus.SELL,
                shortSummary: `Oportunidade de Venda a Favor da Tendência.`,
                detailedAnalysis: `**ANÁLISE INSTITUCIONAL (BEARISH)**\n
                **Contexto:** O mercado tem fluxo vendedor. O preço subiu para a zona **Premium** (+${pipsDeviation} pips do Ref).\n
                **Ação:** Venda validada. Estamos vendendo caro para capturar a liquidez nos fundos.\n
                **Alvo:** Liquidez nos fundos anteriores (Sell Side Liquidity).`,
                validationStatus: 'OK',
                validationMsg: 'Setup Aprovado (Trend + Premium)',
                referencePrice: referencePrice.toFixed(5),
                stopLoss: slPrice,
                takeProfit: tpPrice,
                rrRatio: '1:3',
                commandLine: command
            };
        }
        // Se estamos em BAIXA mas o preço está BARATO (Desconto)
        else {
            return {
                status: SignalStatus.WAIT,
                shortSummary: `Preço muito baixo. Perigoso vender fundo.`,
                detailedAnalysis: `**MODO DE ESPERA**\n
                **Contexto:** A tendência é de Baixa, mas o preço já caiu demais (-${pipsDeviation} pips abaixo do Ref).\n
                **Risco:** Vender agora é "Vender Fundo". Comprar é contra a tendência.\n
                **Ação:** Aguarde o preço corrigir (subir) até o Preço Justo (${referencePrice.toFixed(5)}) para buscar novas vendas.`,
                validationStatus: 'WARNING',
                validationMsg: 'Aguardar Correção (Inducement)',
                referencePrice: referencePrice.toFixed(5),
                commandLine: `${assetSymbol} - AGUARDAR CORREÇÃO`
            };
        }
    }
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingRef, setIsEditingRef] = useState(false);
  const [tempRefPrice, setTempRefPrice] = useState('');
  
  const isMounted = useRef(true);

  // Initialize defaults if missing
  useEffect(() => {
    isMounted.current = true;
    if (!savedState.referencePrice) {
        onUpdateState({
            ...savedState,
            referencePrice: asset.price,
            trendBias: 'BEARISH' // Default conservador
        });
    }
    return () => { isMounted.current = false; };
  }, []);

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
          // Reset analysis if context changes
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

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    const refPrice = parseFloat(savedState.referencePrice || asset.price);
    
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setCopied(false);
        
        setTimeout(() => {
            if (!isMounted.current) return;

            const inputVal = parseFloat(sanitizedPrice);
            
            // Core Logic Call
            const result = generateTitanAnalysis(asset.symbol, inputVal, refPrice, savedState.trendBias);

            onUpdateState({
                ...savedState,
                isRevealed: true,
                analysisSnapshot: result
            });

            setIsValidating(false);
        }, 1000);
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
         <div className="bg-titan-card rounded-lg p-3 border border-titan-card flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] text-titan-muted uppercase tracking-wider flex items-center gap-1">
                    <Settings2 size={10} /> Ref. Institucional (Equilibrium)
                </span>
                
                {isEditingRef ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            className="bg-black/50 text-white font-mono text-sm p-1 rounded w-24 border border-titan-gold focus:outline-none"
                            value={tempRefPrice}
                            onChange={(e) => setTempRefPrice(e.target.value)}
                        />
                        <button onClick={saveRefPrice} className="text-green-400"><Save size={16} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-1 cursor-pointer group" onClick={startEditingRef}>
                        <span className="text-sm font-mono font-bold text-white group-hover:text-titan-gold transition-colors">
                            {savedState.referencePrice || asset.price}
                        </span>
                        <Edit3 size={12} className="text-titan-muted opacity-50 group-hover:opacity-100" />
                    </div>
                )}
            </div>
            <div className="text-right">
                <span className="text-[9px] text-gray-500 block">Preço Atual (Simulado)</span>
                <span className="text-xs font-mono text-gray-300">{asset.price}</span>
            </div>
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
                        Calculando Setup...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Gerar Sinal
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
                    <p className="text-[10px] text-titan-muted uppercase mb-4 tracking-[0.2em] font-bold animate-pulse">Setup Confirmado</p>

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
                        <span className="text-xs font-mono text-titan-gold">Ref: {savedState.analysisSnapshot.referencePrice}</span>
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