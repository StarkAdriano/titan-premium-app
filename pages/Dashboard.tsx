import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { TrendingUp, Calculator, CheckCircle2, Clock, AlignLeft, Lock, Activity, RotateCcw, Shield, AlertTriangle, AlertOctagon, BookOpen, BarChart3, Target, Crosshair, Copy, Terminal } from 'lucide-react';

interface DashboardState {
    userPrice: string;
    isRevealed: boolean;
    analysisSnapshot: AnalysisResult | null;
}

interface DashboardProps {
  asset: Asset; 
  savedState: DashboardState;
  onUpdateState: (newState: DashboardState) => void;
}

// --- LOGIC: TITAN INSTITUTIONAL BRAIN ---
const generateTitanAnalysis = (assetSymbol: string, inputPrice: number, marketPrice: number): AnalysisResult => {
    const deviation = inputPrice - marketPrice;
    const pips = (deviation * 10000).toFixed(1); // Calculate Pip distance
    const THRESHOLD = 0.0005;
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Dynamic Institutional References
    const bearishStructures = ['Order Block H4', 'Breaker Block H1', 'Mitigation Block M15', 'Supply Zone Diária'];
    const bullishStructures = ['Order Block H1', 'Bullish Breaker H4', 'Demand Zone M30', 'Liquidity Sweep (SSL)'];
    
    const bearRef = bearishStructures[Math.floor(Math.random() * bearishStructures.length)];
    const bullRef = bullishStructures[Math.floor(Math.random() * bullishStructures.length)];

    // CALCULATE SL & TP (Standard 1:3 RR)
    const PIP_VALUE = 0.0001;
    const STOP_SIZE = 20 * PIP_VALUE; 
    const TARGET_SIZE = 60 * PIP_VALUE; 

    // SCENARIO 1: PREMIUM ZONE (SELL)
    if (deviation > THRESHOLD) {
        const slPrice = (inputPrice + STOP_SIZE).toFixed(5);
        const tpPrice = (inputPrice - TARGET_SIZE).toFixed(5);
        const commandLine = `${assetSymbol} @ ${inputPrice.toFixed(5)} – STATUS: VENDER, STOP: ${slPrice}, TP: ${tpPrice}, RISCO: 0,5% a 1%, R/R: 1:3`;

        return {
            status: SignalStatus.SELL,
            shortSummary: `Preço em Premium (+${pips} pips). ${bearRef} identificado.`,
            detailedAnalysis: `**ANÁLISE INSTITUCIONAL (${currentTime})**\n
            **Contexto:** O input ${inputPrice} está na zona Premium (+${pips} pips). O Smart Money busca liquidez nestes níveis para distribuir.\n
            **Estrutura:** Reação em **${bearRef}** confirmada.\n
            **Ação:** Venda validada pela rejeição de topo. Alvo na liquidez interna.`,
            validationStatus: 'OK',
            validationMsg: 'Sincronia Institucional Confirmada.',
            referencePrice: marketPrice.toFixed(5),
            stopLoss: slPrice,
            takeProfit: tpPrice,
            rrRatio: '1:3',
            commandLine: commandLine
        };
    }

    // SCENARIO 2: DISCOUNT ZONE (BUY)
    else if (deviation < -THRESHOLD) {
        const slPrice = (inputPrice - STOP_SIZE).toFixed(5);
        const tpPrice = (inputPrice + TARGET_SIZE).toFixed(5);
        const commandLine = `${assetSymbol} @ ${inputPrice.toFixed(5)} – STATUS: COMPRAR, STOP: ${slPrice}, TP: ${tpPrice}, RISCO: 0,5% a 1%, R/R: 1:3`;

        return {
            status: SignalStatus.BUY,
            shortSummary: `Preço em Desconto (${pips} pips). ${bullRef} acionado.`,
            detailedAnalysis: `**ANÁLISE INSTITUCIONAL (${currentTime})**\n
            **Contexto:** O input ${inputPrice} está na zona de Desconto (${pips} pips). Estamos baratos em relação ao Fair Value.\n
            **Estrutura:** Teste de **${bullRef}** validado.\n
            **Ação:** Compra autorizada após captura de liquidez (SSL). Alvo nos topos iguais.`,
            validationStatus: 'OK',
            validationMsg: 'Sincronia Institucional Confirmada.',
            referencePrice: marketPrice.toFixed(5),
            stopLoss: slPrice,
            takeProfit: tpPrice,
            rrRatio: '1:3',
            commandLine: commandLine
        };
    }

    // SCENARIO 3: EQUILIBRIUM (WAIT)
    else {
        const commandLine = `${assetSymbol} @ ${inputPrice.toFixed(5)} – STATUS: ESPERAR`;
        
        return {
            status: SignalStatus.WAIT,
            shortSummary: `Zona de Equilíbrio (Spread: ${pips} pips). Sem vantagem estatística.`,
            detailedAnalysis: `**ANÁLISE INSTITUCIONAL (${currentTime})**\n
            **Contexto:** O preço está no "Fair Value". Mercado em acumulação/range.\n
            **Ação:** Mãos fora do mouse. Não há prêmio para vender, nem desconto para comprar. Aguarde o preço buscar extremidades.`,
            validationStatus: 'OK',
            validationMsg: 'Aguardando Deslocamento.',
            referencePrice: marketPrice.toFixed(5),
            commandLine: commandLine
        };
    }
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);
  
  // Destructure from saved props
  const { userPrice, isRevealed, analysisSnapshot } = savedState;

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

  const getStatusTextOnly = (status: SignalStatus) => {
    switch (status) {
      case SignalStatus.BUY: return 'text-titan-green';
      case SignalStatus.SELL: return 'text-titan-red';
      case SignalStatus.WAIT: return 'text-titan-gold';
    }
  };

  const handleReveal = () => {
    const sanitizedPrice = userPrice.replace(',', '.');
    
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setCopied(false);
        
        setTimeout(() => {
            if (!isMounted.current) return;

            const inputVal = parseFloat(sanitizedPrice);
            const marketVal = parseFloat(asset.price); 

            if (isNaN(inputVal)) {
                setIsValidating(false);
                return;
            }

            const result = generateTitanAnalysis(asset.symbol, inputVal, marketVal);

            const diff = Math.abs(inputVal - marketVal);
            if (diff > 0.0020) {
                result.validationStatus = 'WARNING';
                result.validationMsg = 'Alerta: Divergência de preço elevada.';
            }

            onUpdateState({
                userPrice,
                isRevealed: true,
                analysisSnapshot: result
            });

            setIsValidating(false);
        }, 1500);
    }
  };

  const handleReset = () => {
      setCopied(false);
      onUpdateState({
          userPrice: '',
          isRevealed: false,
          analysisSnapshot: null
      });
  };

  const handleCopyCommand = () => {
      if (analysisSnapshot?.commandLine) {
          navigator.clipboard.writeText(analysisSnapshot.commandLine);
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
      
      {/* 1. Header & Live Ticker */}
      <div className="text-center pt-4">
         <h2 className="text-3xl font-black text-white tracking-tighter">{asset.symbol}</h2>
         <div className="inline-flex items-center gap-2 bg-titan-card px-3 py-1 rounded-full mt-2 border border-titan-gold/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-mono text-titan-gold tracking-widest">
                REF: {asset.price}
            </p>
         </div>
      </div>

      {/* 2. Input Section */}
      <div className={`bg-titan-card/40 backdrop-blur-sm rounded-xl p-6 border transition-all duration-500 ${isRevealed ? 'border-titan-card' : 'border-titan-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]'}`}>
        <div className="flex flex-col items-center gap-4">
            
            <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Target size={16} className="text-titan-gold" />
                    <label className="text-xs text-titan-gold uppercase font-bold tracking-wider">
                    Sua Execução
                    </label>
                </div>
                <div className="relative flex items-center max-w-[240px] mx-auto">
                    <input 
                    type="text" 
                    inputMode="decimal"
                    value={userPrice}
                    onChange={handleInputChange}
                    placeholder="0.00000"
                    disabled={isRevealed}
                    className={`w-full bg-titan-darker border-b-2 ${isRevealed ? 'border-titan-muted text-gray-500' : 'border-titan-card focus:border-titan-gold text-white'} font-mono text-3xl py-3 text-center focus:outline-none transition-all placeholder-gray-700 rounded-t-lg`}
                    />
                </div>
            </div>

            <button 
                onClick={handleReveal}
                disabled={isValidating || !userPrice || isRevealed}
                className={`mt-2 w-full font-bold uppercase tracking-wider py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait ${
                    isRevealed 
                    ? 'hidden' 
                    : 'bg-titan-gold text-black hover:bg-titan-goldLight hover:scale-[1.02]'
                }`}
            >
                {isValidating ? (
                    <>
                        <Activity size={18} className="animate-spin" />
                        Calculando Viés...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Processar Análise
                    </>
                )}
            </button>

            {isRevealed && (
                 <button 
                 onClick={handleReset}
                 className="mt-1 flex items-center gap-2 text-xs text-titan-muted hover:text-white uppercase tracking-wider border border-titan-card px-4 py-2 rounded-full hover:bg-titan-card transition-colors"
                >
                 <RotateCcw size={14} /> Nova Consulta
                </button>
            )}
        </div>
      </div>

      {/* 3. Analysis Result (Conditional) */}
      {isRevealed && analysisSnapshot ? (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-6">
            
            {/* Main Signal Card */}
            <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-titan-card via-titan-dark to-black border border-titan-gold/30 rounded-2xl"></div>
                
                <div className="relative p-8 text-center z-10">
                    <p className="text-[10px] text-titan-muted uppercase mb-4 tracking-[0.2em] font-bold animate-pulse">Sinal em Tempo Real</p>

                    <div className={`inline-block px-8 py-3 rounded-lg border ${getStatusColor(analysisSnapshot.status)} ${getStatusBg(analysisSnapshot.status)} backdrop-blur-md mb-6 shadow-2xl`}>
                        <span className="text-4xl font-black tracking-widest uppercase drop-shadow-lg flex items-center justify-center gap-3">
                            {analysisSnapshot.status}
                        </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-snug max-w-[90%] mx-auto font-medium">
                        {analysisSnapshot.shortSummary}
                    </p>
                </div>
            </div>

            {/* --- COMMAND LINE (NEW - MATCHES MANUAL SETUP) --- */}
            {analysisSnapshot.commandLine && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="flex items-center gap-2 px-1 mb-2">
                        <Terminal size={14} className="text-titan-gold" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Comando Operacional (Setup Titan)
                        </h3>
                    </div>
                    <div className="bg-black/40 border border-titan-gold/30 rounded-lg p-3 relative group">
                        <code className="text-[10px] md:text-xs font-mono text-green-400 break-all block leading-relaxed pr-8">
                            {analysisSnapshot.commandLine}
                        </code>
                        <button 
                            onClick={handleCopyCommand}
                            className={`absolute top-2 right-2 p-1.5 rounded transition-all ${copied ? 'bg-green-500 text-black' : 'bg-titan-card text-titan-muted hover:text-white'}`}
                        >
                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Validation Feedback */}
            <div className={`px-4 py-3 rounded-lg border flex items-center justify-between gap-3 ${
                analysisSnapshot.validationStatus === 'OK' 
                ? 'bg-titan-green/5 border-titan-green/20' 
                : 'bg-titan-red/5 border-titan-red/20'
            }`}>
                <div className="flex items-center gap-2">
                    {analysisSnapshot.validationStatus === 'OK' ? (
                        <CheckCircle2 size={16} className="text-titan-green" />
                    ) : (
                        <AlertTriangle size={16} className="text-titan-red" />
                    )}
                    <span className={`text-[10px] font-bold uppercase ${
                        analysisSnapshot.validationStatus === 'OK' ? 'text-titan-green' : 'text-titan-red'
                    }`}>
                        {analysisSnapshot.validationMsg}
                    </span>
                </div>
            </div>

            {/* --- TRADE PARAMETERS (SL/TP - VISUAL) --- */}
            {analysisSnapshot.status !== SignalStatus.WAIT && analysisSnapshot.stopLoss && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-2">
                            <Crosshair size={16} className="text-titan-gold" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                Parâmetros Visuais
                            </h3>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {/* STOP LOSS */}
                        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-3 text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider mb-1">Stop Loss</span>
                            <span className="text-sm font-mono font-bold text-white">{analysisSnapshot.stopLoss}</span>
                        </div>

                        {/* ENTRY */}
                        <div className="bg-titan-card border border-titan-gold/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                            <span className="text-[9px] text-titan-gold font-bold uppercase tracking-wider mb-1">Entrada</span>
                            <span className="text-sm font-mono font-bold text-white">{userPrice}</span>
                        </div>

                        {/* TAKE PROFIT */}
                        <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-3 text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider mb-1">Take Profit</span>
                            <span className="text-sm font-mono font-bold text-white">{analysisSnapshot.takeProfit}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Rationale */}
            <div className="space-y-3 delay-150 animate-in slide-in-from-bottom-4 duration-700 fill-mode-backwards">
                <div className="flex items-center gap-2 px-1">
                    <AlignLeft size={16} className="text-titan-gold" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Racional do Trade
                    </h3>
                </div>
                
                <div className="bg-titan-card/30 rounded-xl p-5 border border-titan-card hover:border-titan-gold/10 transition-colors">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                        <span className="text-[10px] text-titan-muted uppercase">Base de Cálculo</span>
                        <span className="text-xs font-mono text-titan-gold">Ref: {analysisSnapshot.referencePrice}</span>
                    </div>
                    <div className="text-gray-300 leading-7 text-sm text-justify font-sans whitespace-pre-line">
                        {analysisSnapshot.detailedAnalysis.split('\n').map((line, i) => (
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

            {/* History Section */}
            <div className="space-y-4 pt-4 pb-4">
                <h3 className="text-xs font-bold text-titan-muted uppercase tracking-wider pl-1 border-l-2 border-titan-muted/30 ml-1 pl-3">
                Histórico de Sinais Anteriores
                </h3>
                <div className="space-y-0 pl-2">
                {asset.history.length > 0 ? (
                    asset.history.map((entry) => (
                    <div key={entry.id} className="relative pl-6 pb-8 border-l border-titan-card last:pb-0 last:border-0">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-titan-dark border border-titan-muted"></div>
                        <div className="flex flex-col bg-titan-card/20 p-3 rounded-lg border border-transparent hover:border-titan-card transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold ${getStatusTextOnly(entry.status)}`}>
                            {entry.status}
                            </span>
                            <span className="text-[10px] text-titan-muted uppercase flex items-center gap-1">
                            <Clock size={10} /> {entry.date}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {entry.summary}
                        </p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-xs text-titan-muted pl-6 italic">Sem histórico recente.</p>
                )}
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
                  Aguardando input de preço para gerar cenário.
              </p>
          </div>
      )}

    </div>
  );
};

export default Dashboard;