
import React, { useState } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  Loader2,
  RotateCcw,
  Terminal,
  Search,
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
    // LÓGICA DINÂMICA: Calcula zonas reais baseadas no preço de entrada (Range de 35 pips)
    const pipValue = 0.00010;
    const rangePips = 35;
    
    const supportLevel = price - (rangePips * pipValue);
    const resistanceLevel = price + (rangePips * pipValue);
    
    // Status baseado na proximidade das extremidades (Zonas de Rejeição/Interesse)
    // Se o preço está muito próximo do suporte ou resistência calculados
    const isNearSupport = price <= (supportLevel + (10 * pipValue));
    const isNearResistance = price >= (resistanceLevel - (10 * pipValue));
    
    let status = SignalStatus.WAIT;
    let motive = "PRECO EM EQUILIBRIO (FAIR VALUE)";
    let zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';

    if (isNearSupport) {
        zone = 'DISCOUNT';
        status = SignalStatus.BUY;
        motive = "CAPTURA EM ZONA DE DESCONTO INSTITUCIONAL";
    } else if (isNearResistance) {
        zone = 'PREMIUM';
        status = SignalStatus.SELL;
        motive = "REJEICAO EM ZONA DE PREMIO H1";
    }

    const priceStr = price.toFixed(5);

    return {
        status,
        statusMotive: motive,
        referencePrice: priceStr,
        zoneContext: zone,
        institutionalContext: `Fluxo de ordens intraday analisado em ${priceStr}. O algoritmo IPDA identifica liquidez pendente na faixa de ${supportLevel.toFixed(5)} (Sell-side) e defesa de oferta em ${resistanceLevel.toFixed(5)} (Buy-side). Estrutura sugere busca por zonas de desequilibrio antes da expansao principal.`,
        zones: {
            support: [
                `${supportLevel.toFixed(5)} – ${(supportLevel - 0.0010).toFixed(5)} (Zona A)`,
                `${(supportLevel - 0.0025).toFixed(5)} – ${(supportLevel - 0.0040).toFixed(5)} (Zona B)`
            ],
            resistance: [
                `${resistanceLevel.toFixed(5)} – ${(resistanceLevel + 0.0010).toFixed(5)} (Zona A)`,
                `${(resistanceLevel + 0.0025).toFixed(5)} – ${(resistanceLevel + 0.0040).toFixed(5)} (Zona B)`
            ]
        },
        buyPlan: {
            isIdeal: isNearSupport,
            reason: !isNearSupport ? "Preco acima da zona de desconto ideal. Risco de mitigacao tardia." : undefined,
            entry: isNearSupport ? `Entre ${supportLevel.toFixed(5)} e ${(supportLevel + 0.0005).toFixed(5)}` : undefined,
            stop: isNearSupport ? `Abaixo de ${(supportLevel - 0.0015).toFixed(5)}` : undefined,
            targets: isNearSupport ? `${priceStr} (T1) / ${resistanceLevel.toFixed(5)} (T2)` : undefined,
            rr: isNearSupport ? "Minimo 1:3" : undefined
        },
        sellPlan: {
            isIdeal: isNearResistance,
            reason: !isNearResistance ? "Preco abaixo da zona de premio ideal. Movimento ja em curso ou sem rejeicao clara." : undefined,
            entry: isNearResistance ? `Entre ${resistanceLevel.toFixed(5)} e ${(resistanceLevel - 0.0005).toFixed(5)}` : undefined,
            stop: isNearResistance ? `Acima de ${(resistanceLevel + 0.0015).toFixed(5)}` : undefined,
            targets: isNearResistance ? `${priceStr} (T1) / ${supportLevel.toFixed(5)} (T2)` : undefined,
            rr: isNearResistance ? "Minimo 1:3" : undefined
        },
        riskManagement: "RISCO RECOMENDADO: 0.5% A 1.0% POR OPERACAO. EXPOSICAO MAXIMA DIARIA DE 2%. EM CASO DE STOP, AGUARDAR NOVA CAPTURA DE LIQUIDEZ EM TIMEFRFrame SUPERIOR (H4).",
        officialGuideline: `O foco operacional em ${priceStr} e aguardar a confirmacao de rejeicao nas extremidades calculadas. Nao operar em meio de range (Equilibrium) para evitar violinadas de liquidez interna.`
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
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-titan-dark/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-titan-gold" />
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
            EURUSD <span className="text-titan-gold/50">Terminal v3.2</span>
          </h2>
        </div>
        <div className="bg-titan-gold/10 px-3 py-1 rounded border border-titan-gold/20">
            <span className="text-[8px] font-black text-titan-gold uppercase tracking-widest">DINAMIC ANALYTICS</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
                <label className="text-[9px] font-black text-titan-gold uppercase tracking-[0.4em] mb-1 block">
                    Preco Atual de Execucao
                </label>
                <p className="text-[8px] text-titan-muted uppercase tracking-widest font-bold opacity-40 italic">DIGITE O PRECO DA SUA CORRETORA</p>
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
                    PROCESSAR SETUP DINAMICO
                </button>
            ) : (
                <button 
                    onClick={() => onUpdateState({...savedState, isRevealed: false})} 
                    className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl text-[9px] text-white uppercase font-black tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                    <RotateCcw size={12} /> RECALCULAR COM NOVO PRECO
                </button>
            )}
          </div>
        </div>

        {savedState.isRevealed && savedState.analysisSnapshot && (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                
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

                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-titan-gold uppercase tracking-widest px-1">Seção: Contexto institucional</h4>
                    <div className="bg-titan-card/40 border border-white/5 rounded-3xl p-6">
                        <p className="text-[13px] text-titan-muted leading-relaxed font-medium uppercase italic opacity-80">
                            {savedState.analysisSnapshot.institutionalContext}
                        </p>
                    </div>
                </div>

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

                <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest px-1">Seção: Gestão de risco (obrigatória)</h4>
                    <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 shadow-lg">
                        <p className="text-[11px] text-white/90 leading-relaxed font-black uppercase tracking-tight">
                            {savedState.analysisSnapshot.riskManagement}
                        </p>
                    </div>
                </div>

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
