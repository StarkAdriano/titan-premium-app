
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
    // Configurações de faixas para EURUSD (Exemplo de níveis institucionais)
    const supportRange = { min: 1.05000, max: 1.05200 };
    const resistanceRange = { min: 1.05750, max: 1.05950 };
    
    const isDiscount = price >= supportRange.min && price <= supportRange.max;
    const isPremium = price >= resistanceRange.min && price <= resistanceRange.max;
    
    let status = SignalStatus.WAIT;
    let motive = "PRECO EM MEIO DE FAIXA OU SEM GATILHO CLARO";
    let zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';

    if (isDiscount) {
        zone = 'DISCOUNT';
        status = SignalStatus.BUY;
        motive = "CAPTURA DE LIQUIDEZ EM ZONA DE SUPORTE";
    } else if (isPremium) {
        zone = 'PREMIUM';
        status = SignalStatus.SELL;
        motive = "REJEICAO EM ZONA DE RESISTENCIA INSTITUCIONAL";
    } else {
        zone = 'EQUILIBRIUM';
        status = SignalStatus.WAIT;
        motive = "MERCADO EM EQUILIBRIO (FAIR VALUE)";
    }

    const priceStr = price.toFixed(5);

    return {
        status,
        statusMotive: motive,
        referencePrice: priceStr,
        zoneContext: zone,
        institutionalContext: `Estrutura geral consolidada com viés de defesa em zonas extremas. O preco atual de ${priceStr} interage com niveis de liquidez de H1. Mercado vem defendendo acima de 1.05000 e demonstrando teste de zona de premio em 1.05800.`,
        zones: {
            support: ["1.05100 – 1.05000 (Imediato)", "1.04850 – 1.04550 (Profundo)"],
            resistance: ["1.05750 – 1.05950 (Venda Direta)", "1.06200 – 1.06450 (Extensao)"]
        },
        buyPlan: {
            isIdeal: isDiscount,
            reason: !isDiscount ? "Regiao de meio de faixa ou proximidade de resistencia. Sem defesa clara de suporte ou gatilho de inversao." : undefined,
            entry: isDiscount ? "Faixa de 1.05100 – 1.05200" : undefined,
            stop: isDiscount ? "Abaixo de 1.05000 (Invalidacao tecnica)" : undefined,
            targets: isDiscount ? "1.05750 (Alvo 1) / 1.06200 (Alvo 2)" : undefined,
            rr: isDiscount ? "Minimo 2:1" : undefined
        },
        sellPlan: {
            isIdeal: isPremium,
            reason: !isPremium ? "Regiao de suporte ou mercado ainda com vies comprador. Sem rejeicao clara em resistencia de premio." : undefined,
            entry: isPremium ? "Faixa de 1.05750 – 1.05850" : undefined,
            stop: isPremium ? "Acima de 1.05950 (Invalidacao tecnica)" : undefined,
            targets: isPremium ? "1.05200 (Alvo 1) / 1.04850 (Alvo 2)" : undefined,
            rr: isPremium ? "Minimo 2:1" : undefined
        },
        riskManagement: "Risco por operacao: entre 0.5% e 1% do capital total. Nunca aumentar lote para recuperar prejuizo. Operar menos e melhor do que operar mal: preferir ESPERAR quando o preco esta em meio de faixa.",
        officialGuideline: `Enquanto o preco estiver acima de 1.05000 e abaixo de 1.05750 sem romper com forca, o foco e ESPERAR por desconto em suporte para comprar ou rejeicao forte em premio para vender. Nenhuma entrada agressiva contra a tendencia principal.`
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
        }, 800);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker animate-in fade-in duration-500">
      {/* Header Profissional - Estilo Terminal */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-titan-dark/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-titan-gold" />
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
            EURUSD <span className="text-titan-gold/50">Terminal v3.2</span>
          </h2>
        </div>
        <div className="bg-titan-gold/10 px-3 py-1 rounded border border-titan-gold/20">
            <span className="text-[8px] font-black text-titan-gold uppercase tracking-widest">REAL-TIME BRIDGE</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input de Preco do Setup */}
        <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
                <label className="text-[9px] font-black text-titan-gold uppercase tracking-[0.4em] mb-1 block">
                    Preco Atual de Execucao
                </label>
                <p className="text-[8px] text-titan-muted uppercase tracking-widest font-bold opacity-40 italic">EURUSD SPOT / INTRADAY</p>
            </div>
            
            <input 
                type="text" 
                inputMode="decimal" 
                value={savedState.userPrice} 
                onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})} 
                placeholder="1.05450" 
                disabled={savedState.isRevealed} 
                className={`w-full bg-black/60 border-2 text-center font-mono text-5xl py-8 rounded-[2rem] transition-all outline-none ${
                    savedState.isRevealed ? 'border-titan-gold/10 text-titan-muted/30' : 'border-white/10 text-white focus:border-titan-gold/40 shadow-[0_0_40px_rgba(255,255,255,0.02)]'
                }`} 
            />

            {!savedState.isRevealed ? (
                <button 
                    onClick={handleContextScan} 
                    disabled={isValidating || !savedState.userPrice} 
                    className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all"
                >
                    {isValidating ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} 
                    ATUALIZAR SETUP COMPLETO
                </button>
            ) : (
                <button 
                    onClick={() => onUpdateState({...savedState, isRevealed: false})} 
                    className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl text-[9px] text-white uppercase font-black tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                    <RotateCcw size={12} /> NOVO SCAN DE PRECO
                </button>
            )}
          </div>
        </div>

        {/* Resposta Estruturada - Estilo Bloomberg (Sem Emojis) */}
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

                {/* Secao: Contexto institucional */}
                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Contexto institucional</h4>
                    <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
                        <p className="text-[13px] text-titan-muted leading-relaxed font-medium uppercase italic opacity-80">
                            {savedState.analysisSnapshot.institutionalContext}
                        </p>
                    </div>
                </div>

                {/* Secao: Zonas de preco do setup */}
                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Zonas de preço do setup</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-titan-card/30 border border-titan-green/20 rounded-2xl p-5">
                            <span className="text-[8px] font-black text-titan-green uppercase tracking-widest mb-2 block">Zona de suporte / desconto (compras)</span>
                            <div className="space-y-1">
                                {savedState.analysisSnapshot.zones.support.map((z, i) => (
                                    <p key={i} className="text-[11px] font-mono text-white/90">{z}</p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-titan-card/30 border border-titan-red/20 rounded-2xl p-5">
                            <span className="text-[8px] font-black text-titan-red uppercase tracking-widest mb-2 block">Zona de prêmio / resistência (vendas)</span>
                            <div className="space-y-1">
                                {savedState.analysisSnapshot.zones.resistance.map((z, i) => (
                                    <p key={i} className="text-[11px] font-mono text-white/90">{z}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secao: Plano de compra */}
                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Plano de compra</h4>
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.buyPlan.isIdeal ? 'bg-titan-green/10 border-titan-green/50' : 'bg-black/40 border-white/5'}`}>
                        {savedState.analysisSnapshot.buyPlan.isIdeal ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Entrada</span>
                                        <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot.buyPlan.entry}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Stop Tecnico</span>
                                        <span className="text-xs font-mono font-bold text-titan-red">{savedState.analysisSnapshot.buyPlan.stop}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Alvos Principais</span>
                                        <span className="text-xs font-mono font-bold text-titan-green">{savedState.analysisSnapshot.buyPlan.targets}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Relacao Risco/Retorno</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.buyPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[12px] text-titan-muted italic font-medium">SINAL NEGATIVO: {savedState.analysisSnapshot.buyPlan.reason}</p>
                        )}
                    </div>
                </div>

                {/* Secao: Plano de venda */}
                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Plano de venda</h4>
                    <div className={`rounded-3xl p-6 border ${savedState.analysisSnapshot.sellPlan.isIdeal ? 'bg-titan-red/10 border-titan-red/50' : 'bg-black/40 border-white/5'}`}>
                        {savedState.analysisSnapshot.sellPlan.isIdeal ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Entrada</span>
                                        <span className="text-xs font-mono font-bold text-white">{savedState.analysisSnapshot.sellPlan.entry}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Stop Tecnico</span>
                                        <span className="text-xs font-mono font-bold text-titan-red">{savedState.analysisSnapshot.sellPlan.stop}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[8px] uppercase text-titan-muted font-black block mb-1">Alvos Principais</span>
                                        <span className="text-xs font-mono font-bold text-titan-green">{savedState.analysisSnapshot.sellPlan.targets}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[8px] uppercase text-titan-muted font-black block">Relacao Risco/Retorno</span>
                                    <span className="text-xs font-black text-titan-gold">{savedState.analysisSnapshot.sellPlan.rr}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[12px] text-titan-muted italic font-medium">SINAL NEGATIVO: {savedState.analysisSnapshot.sellPlan.reason}</p>
                        )}
                    </div>
                </div>

                {/* Secao: Gestao de risco (obrigatoria) */}
                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest px-1">Seção: Gestão de risco (obrigatória)</h4>
                    <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 shadow-lg">
                        <p className="text-[11px] text-white/90 leading-relaxed font-black uppercase tracking-tight">
                            {savedState.analysisSnapshot.riskManagement}
                        </p>
                    </div>
                </div>

                {/* Secao: Diretriz oficial do setup */}
                <div className="space-y-2 pb-12">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Diretriz oficial do setup</h4>
                    <div className="bg-titan-gold/5 border border-titan-gold/20 rounded-3xl p-6">
                        <p className="text-[12px] text-white font-black italic border-l-2 border-titan-gold/50 pl-4 leading-relaxed uppercase opacity-90">
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
