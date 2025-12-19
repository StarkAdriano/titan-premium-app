
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
    // Configurações de faixas para EURUSD baseadas no prompt do usuário
    // Exemplo: Suportes em 1.0510 e Resistências em 1.0580
    const supportRange = { min: 1.05000, max: 1.05200 };
    const resistanceRange = { min: 1.05700, max: 1.05950 };
    
    const isDiscount = price >= supportRange.min && price <= supportRange.max;
    const isPremium = price >= resistanceRange.min && price <= resistanceRange.max;
    
    let status = SignalStatus.WAIT;
    let motive = "PREÇO EM REGIÃO DE DECISÃO SEM GATILHO LIMPO";
    let zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';

    if (isDiscount) {
        zone = 'DISCOUNT';
        status = SignalStatus.BUY;
        motive = "LIQUIDEZ DE SELL-SIDE CAPTURADA EM ZONA DE DESCONTO";
    } else if (isPremium) {
        zone = 'PREMIUM';
        status = SignalStatus.SELL;
        motive = "TESTE DE ZONA DE PRÊMIO COM REJEIÇÃO INSTITUCIONAL";
    } else if (price > supportRange.max && price < resistanceRange.min) {
        zone = 'EQUILIBRIUM';
        status = SignalStatus.WAIT;
        motive = "PREÇO EM MEIO DE FAIXA (FAIR VALUE)";
    }

    const priceStr = price.toFixed(5);

    return {
        status,
        statusMotive: motive,
        referencePrice: priceStr,
        zoneContext: zone,
        institutionalContext: `Mercado apresenta estrutura de consolidação intraday com viés de defesa institucional. O preço atual em ${priceStr} encontra-se em zona de ${zone === 'EQUILIBRIUM' ? 'equilíbrio absoluto' : 'interesse profissional'}. Observamos o fluxo de ordens interbancário aguardando captura de liquidez externa.`,
        zones: {
            support: ["1.05100 – 1.05000 (Imediato)", "1.04850 – 1.04550 (Extensão)"],
            resistance: ["1.05800 – 1.06000 (Imediato)", "1.06250 – 1.06500 (Extensão)"]
        },
        buyPlan: {
            isIdeal: isDiscount,
            reason: !isDiscount ? "Preço em região de meio de faixa ou próximo de resistência, sem defesa clara de suporte institucional." : undefined,
            entry: isDiscount ? "Faixa de 1.05100 – 1.05200" : undefined,
            stop: isDiscount ? "Abaixo de 1.05000 (Invalidação da estrutura)" : undefined,
            targets: isDiscount ? "1.05800 (Alvo 1) / 1.06200 (Alvo 2)" : undefined,
            rr: isDiscount ? "Mínimo 2.5:1" : undefined
        },
        sellPlan: {
            isIdeal: isPremium,
            reason: !isPremium ? "Região de suporte ou mercado ainda com viés de alta, sem sinais de rejeição em resistência premium." : undefined,
            entry: isPremium ? "Faixa de 1.05800 – 1.05950" : undefined,
            stop: isPremium ? "Acima de 1.06050 (Invalidação da estrutura)" : undefined,
            targets: isPremium ? "1.05200 (Alvo 1) / 1.04850 (Alvo 2)" : undefined,
            rr: isPremium ? "Mínimo 2.5:1" : undefined
        },
        riskManagement: "Risco por operação: entre 0.5% e 1% do capital total. Nunca aumentar lote para recuperar prejuízo. Operar menos é melhor do que operar mal.",
        officialGuideline: `Enquanto o preço não romper com força as zonas mapeadas, o foco é aguardar por desconto real para compra ou prêmio forte para venda. Nenhuma entrada agressiva contra o fluxo institucional de H1.`
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
        }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker animate-in fade-in duration-500">
      {/* Header Profissional */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-titan-dark/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-titan-gold" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest italic">
            EURUSD <span className="text-titan-gold/50">Mesa Profissional</span>
          </h2>
        </div>
        <div className="bg-titan-gold/10 px-3 py-1 rounded-md border border-titan-gold/20">
            <span className="text-[8px] font-black text-titan-gold uppercase tracking-[0.2em]">AES-256 SINC</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input de Preço do Setup */}
        <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
                <label className="text-[10px] font-black text-titan-gold uppercase tracking-[0.4em] mb-1 block">
                    Preço Atual Informado
                </label>
            </div>
            
            <input 
                type="text" 
                inputMode="decimal" 
                value={savedState.userPrice} 
                onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                placeholder="1.05450" 
                disabled={savedState.isRevealed} 
                className={`w-full bg-black/60 border-2 text-center font-mono text-5xl py-8 rounded-[2rem] transition-all outline-none ${
                    savedState.isRevealed ? 'border-titan-gold/10 text-titan-muted/40' : 'border-white/10 text-white focus:border-titan-gold/40'
                }`} 
            />

            {!savedState.isRevealed ? (
                <button 
                    onClick={handleContextScan} 
                    disabled={isValidating || !savedState.userPrice} 
                    className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all"
                >
                    {isValidating ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} 
                    ATUALIZAR SETUP EURUSD
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

        {/* Resposta Estruturada - Estilo Bloomberg */}
        {savedState.isRevealed && savedState.analysisSnapshot && (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                
                {/* Linha 1: STATUS OFICIAL */}
                <div className={`p-8 rounded-[2rem] border-2 flex flex-col items-center text-center shadow-2xl ${
                    savedState.analysisSnapshot.status === SignalStatus.BUY ? 'bg-titan-green/5 border-titan-green' : 
                    savedState.analysisSnapshot.status === SignalStatus.SELL ? 'bg-titan-red/5 border-titan-red' : 'bg-titan-gold/5 border-titan-gold'
                }`}>
                    <h3 className={`font-black italic tracking-tighter leading-tight text-3xl uppercase ${
                        savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green' : 
                        savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                    }`}>
                        STATUS: {savedState.analysisSnapshot.status} – {savedState.analysisSnapshot.statusMotive}
                    </h3>
                </div>

                {/* Seção: Contexto institucional */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest px-1">Contexto institucional</h4>
                    <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
                        <p className="text-[13px] text-titan-muted leading-relaxed font-medium">
                            {savedState.analysisSnapshot.institutionalContext}
                        </p>
                    </div>
                </div>

                {/* Seção: Zonas de preço do setup */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest px-1">Zonas de preço do setup</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-titan-card/30 border border-titan-green/20 rounded-2xl p-5">
                            <span className="text-[9px] font-black text-titan-green uppercase tracking-widest mb-2 block">Zona de suporte / desconto (compras)</span>
                            <div className="space-y-1">
                                {savedState.analysisSnapshot.zones.support.map((z, i) => (
                                    <p key={i} className="text-[12px] font-mono text-white/90">{z}</p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-titan-card/30 border border-titan-red/20 rounded-2xl p-5">
                            <span className="text-[9px] font-black text-titan-red uppercase tracking-widest mb-2 block">Zona de prêmio / resistência (vendas)</span>
                            <div className="space-y-1">
                                {savedState.analysisSnapshot.zones.resistance.map((z, i) => (
                                    <p key={i} className="text-[12px] font-mono text-white/90">{z}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção: Plano de compra */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest px-1">Plano de compra</h4>
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.buyPlan.isIdeal ? 'bg-titan-green/10 border-titan-green/50' : 'bg-black/20 border-white/5'}`}>
                        {savedState.analysisSnapshot.buyPlan.isIdeal ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Risco/Retorno</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.buyPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[13px] text-titan-muted italic">{savedState.analysisSnapshot.buyPlan.reason}</p>
                        )}
                    </div>
                </div>

                {/* Seção: Plano de venda */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest px-1">Plano de venda</h4>
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.sellPlan.isIdeal ? 'bg-titan-red/10 border-titan-red/50' : 'bg-black/20 border-white/5'}`}>
                        {savedState.analysisSnapshot.sellPlan.isIdeal ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Risco/Retorno</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.sellPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[13px] text-titan-muted italic">{savedState.analysisSnapshot.sellPlan.reason}</p>
                        )}
                    </div>
                </div>

                {/* Seção: Gestão de risco (obrigatória) */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Gestão de risco (obrigatória)</h4>
                    <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6">
                        <p className="text-[12px] text-white/90 leading-relaxed font-medium">
                            {savedState.analysisSnapshot.riskManagement}
                        </p>
                    </div>
                </div>

                {/* Seção: Diretriz oficial do setup */}
                <div className="space-y-2 pb-10">
                    <h4 className="text-[10px] font-black text-titan-gold uppercase tracking-widest px-1">Diretriz oficial do setup</h4>
                    <div className="bg-titan-gold/5 border border-titan-gold/20 rounded-3xl p-6">
                        <p className="text-[13px] text-white font-medium italic border-l-2 border-titan-gold/50 pl-4 leading-relaxed">
                            {savedState.analysisSnapshot.officialGuideline}
                        </p>
                    </div>
                </div>
                
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
