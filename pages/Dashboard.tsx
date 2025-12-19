
import React, { useState } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  Loader2,
  RotateCcw,
  Terminal,
  Search,
  ShieldAlert,
  Target,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Info
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
  translations: any;
  activeAccountType?: 'DEMO' | 'REAL';
  onAccountTypeChange?: (type: 'DEMO' | 'REAL') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState, translations: t }) => {
  const [isValidating, setIsValidating] = useState(false);

  const generateInstitutionalAnalysis = (price: number): AnalysisResult => {
    // Lógica de Equilíbrio baseada em níveis reais de EURUSD
    const equilibrium = 1.05450;
    const isPremium = price > equilibrium + 0.00030;
    const isDiscount = price < equilibrium - 0.00030;
    
    let status = SignalStatus.WAIT;
    let motive = "PREÇO EM EQUILÍBRIO";
    let zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';

    if (isPremium) {
        zone = 'PREMIUM';
        status = SignalStatus.SELL;
        motive = "REJEIÇÃO EM ZONA DE PRÊMIO";
    } else if (isDiscount) {
        zone = 'DISCOUNT';
        status = SignalStatus.BUY;
        motive = "DEFESA EM ZONA DE DESCONTO";
    }

    const priceStr = price.toFixed(5);

    return {
        status,
        statusMotive: motive,
        referencePrice: priceStr,
        zoneContext: zone,
        institutionalContext: `O mercado apresenta estrutura de ${price > equilibrium ? 'distribuição' : 'acumulação'} no intraday. O preço atual em ${priceStr} interage com níveis de liquidez institucional de H1. Notamos defesa clara em regiões psicológicas.`,
        zones: {
            support: ["1.05100 – 1.05000", "1.04850 – 1.04550"],
            resistance: ["1.05800 – 1.06000", "1.06250 – 1.06500"]
        },
        buyPlan: {
            isIdeal: isDiscount,
            reason: isDiscount ? undefined : "Preço muito próximo de alvo ou em região de prêmio.",
            entry: isDiscount ? "Faixa de 1.05100 – 1.05200" : undefined,
            stop: isDiscount ? "Abaixo de 1.05000" : undefined,
            targets: isDiscount ? "1.05800 (T1) / 1.06200 (T2)" : undefined,
            rr: isDiscount ? "Mínimo 2:1" : undefined
        },
        sellPlan: {
            isIdeal: isPremium,
            reason: isPremium ? undefined : "Mercado ainda com viés comprador ou em região de suporte.",
            entry: isPremium ? "Faixa de 1.05800 – 1.05900" : undefined,
            stop: isPremium ? "Acima de 1.06050" : undefined,
            targets: isPremium ? "1.05200 (T1) / 1.04850 (T2)" : undefined,
            rr: isPremium ? "Mínimo 2:1" : undefined
        },
        riskManagement: "Risco por operação: entre 0.5% e 1% do capital total. Nunca aumentar lote para recuperar prejuízo.",
        officialGuideline: `Enquanto o preço estiver em ${zone}, o foco é ${status === SignalStatus.WAIT ? 'AGUARDAR gatilho limpo' : status + ' alinhado ao fluxo'}. Nenhuma entrada agressiva contra a tendência principal.`
    };
  };

  const handleContextScan = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    const priceNum = parseFloat(sanitizedPrice);
    
    if (!isNaN(priceNum)) {
        setIsValidating(true);
        setTimeout(() => {
            const result = generateInstitutionalAnalysis(priceNum);
            onUpdateState({ 
                ...savedState, 
                isRevealed: true, 
                analysisSnapshot: result
            });
            setIsValidating(false);
        }, 1200);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker animate-in fade-in duration-500">
      {/* Header Profissional */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-titan-dark/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Terminal size={20} className="text-titan-gold" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">
            EURUSD <span className="text-titan-gold/60">INSTITUTIONAL SETUP</span>
          </h2>
        </div>
        <div className="bg-titan-gold/10 px-3 py-1 rounded-full border border-titan-gold/20">
            <span className="text-[9px] font-black text-titan-gold uppercase tracking-tighter">Mesa Proprietária</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input de Preço de Execução */}
        <div className="bg-titan-card/20 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target size={80} />
          </div>
          
          <div className="flex flex-col items-center gap-5 relative z-10">
            <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-titan-gold uppercase tracking-[0.4em] mb-1">
                    Preço Atual Broker
                </label>
                <p className="text-[9px] text-titan-muted uppercase tracking-widest font-bold">Intraday / Swing Curto</p>
            </div>
            
            <input 
                type="text" 
                inputMode="decimal" 
                value={savedState.userPrice} 
                onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                placeholder="1.05450" 
                disabled={savedState.isRevealed} 
                className={`w-full bg-black/60 border-2 text-center font-mono text-5xl py-8 rounded-[2rem] transition-all outline-none ${
                    savedState.isRevealed ? 'border-titan-gold/10 text-titan-muted/50' : 'border-white/10 text-white focus:border-titan-gold/40'
                }`} 
            />

            {!savedState.isRevealed ? (
                <button 
                    onClick={handleContextScan} 
                    disabled={isValidating || !savedState.userPrice} 
                    className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all"
                >
                    {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />} 
                    ATUALIZAR SETUP
                </button>
            ) : (
                <button 
                    onClick={() => onUpdateState({...savedState, isRevealed: false})} 
                    className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl text-[10px] text-white uppercase font-black tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                    <RotateCcw size={14} /> NOVO PREÇO
                </button>
            )}
          </div>
        </div>

        {/* Relatório Estruturado */}
        {savedState.isRevealed && savedState.analysisSnapshot && (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                
                {/* Linha 1: STATUS OFICIAL */}
                <div className={`p-8 rounded-[2rem] border-2 flex flex-col items-center text-center shadow-2xl ${
                    savedState.analysisSnapshot.status === SignalStatus.BUY ? 'bg-titan-green/10 border-titan-green' : 
                    savedState.analysisSnapshot.status === SignalStatus.SELL ? 'bg-titan-red/10 border-titan-red' : 'bg-titan-gold/10 border-titan-gold'
                }`}>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-4">Status Oficial</span>
                    <h3 className={`font-black italic tracking-tighter leading-none text-4xl uppercase ${
                        savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                        savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                    }`}>
                        STATUS: {savedState.analysisSnapshot.status} – {savedState.analysisSnapshot.statusMotive}
                    </h3>
                </div>

                {/* Seção: Contexto Institucional */}
                <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-titan-gold" />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Contexto Institucional</h4>
                    </div>
                    <p className="text-[13px] text-titan-muted leading-relaxed font-medium">
                        {savedState.analysisSnapshot.institutionalContext}
                    </p>
                </div>

                {/* Seção: Zonas de Preço */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-titan-card/30 border border-titan-green/20 rounded-3xl p-5">
                        <h4 className="text-[9px] font-black text-titan-green uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ArrowUpCircle size={12} /> Suporte / Desconto
                        </h4>
                        <ul className="space-y-1">
                            {savedState.analysisSnapshot.zones.support.map((z, i) => (
                                <li key={i} className="text-[11px] font-mono text-white/80">{z}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-titan-card/30 border border-titan-red/20 rounded-3xl p-5">
                        <h4 className="text-[9px] font-black text-titan-red uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ArrowDownCircle size={12} /> Prêmio / Resistência
                        </h4>
                        <ul className="space-y-1">
                            {savedState.analysisSnapshot.zones.resistance.map((z, i) => (
                                <li key={i} className="text-[11px] font-mono text-white/80">{z}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Seção: Planos de Execução */}
                <div className="space-y-4">
                    {/* Plano de Compra */}
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.buyPlan.isIdeal ? 'bg-titan-green/5 border-titan-green/30' : 'bg-black/20 border-white/5 opacity-60'}`}>
                        <h4 className="text-[10px] font-black text-titan-green uppercase tracking-widest mb-4">Plano de Compra</h4>
                        {savedState.analysisSnapshot.buyPlan.isIdeal ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Entrada</span>
                                    <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot.buyPlan.entry}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Stop Técnico</span>
                                    <span className="text-xs font-mono font-bold text-titan-red">{savedState.analysisSnapshot.buyPlan.stop}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Alvos Principais</span>
                                    <span className="text-xs font-mono font-bold text-titan-green">{savedState.analysisSnapshot.buyPlan.targets}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">R:R Esperado</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.buyPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] text-titan-muted italic">{savedState.analysisSnapshot.buyPlan.reason}</p>
                        )}
                    </div>

                    {/* Plano de Venda */}
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.sellPlan.isIdeal ? 'bg-titan-red/5 border-titan-red/30' : 'bg-black/20 border-white/5 opacity-60'}`}>
                        <h4 className="text-[10px] font-black text-titan-red uppercase tracking-widest mb-4">Plano de Venda</h4>
                        {savedState.analysisSnapshot.sellPlan.isIdeal ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Entrada</span>
                                    <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot.sellPlan.entry}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Stop Técnico</span>
                                    <span className="text-xs font-mono font-bold text-titan-red">{savedState.analysisSnapshot.sellPlan.stop}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Alvos Principais</span>
                                    <span className="text-xs font-mono font-bold text-titan-green">{savedState.analysisSnapshot.sellPlan.targets}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">R:R Esperado</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.sellPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] text-titan-muted italic">{savedState.analysisSnapshot.sellPlan.reason}</p>
                        )}
                    </div>
                </div>

                {/* Seção: Gestão de Risco */}
                <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 flex gap-4">
                    <div className="text-red-500 shrink-0"><AlertTriangle size={24} /></div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Gestão de Risco Obrigatória</h4>
                        <p className="text-[11px] text-white/70 leading-relaxed">{savedState.analysisSnapshot.riskManagement}</p>
                    </div>
                </div>

                {/* Seção: Diretriz Oficial */}
                <div className="bg-titan-gold/5 border border-titan-gold/20 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-titan-gold" />
                        <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest">Diretriz Oficial do Setup</h4>
                    </div>
                    <p className="text-[12px] text-white font-medium italic border-l-2 border-titan-gold/40 pl-4 leading-relaxed">
                        "{savedState.analysisSnapshot.officialGuideline}"
                    </p>
                </div>
                
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
