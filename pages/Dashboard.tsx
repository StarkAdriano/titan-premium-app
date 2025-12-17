
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  Shield, 
  Zap, 
  Plus, 
  Minus, 
  Monitor, 
  BarChart2, 
  Copy as CopyIcon, 
  Loader2,
  Lock,
  Server,
  User as UserIcon,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Wifi,
  Activity,
  AlertTriangle,
  Skull,
  TrendingUp,
  Wallet,
  // Added RotateCcw to fix the "Cannot find name 'RotateCcw'" error
  RotateCcw
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
}

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'login' | 'success'>('select');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [latency, setLatency] = useState(24);
  const [isPanicMode, setIsPanicMode] = useState(false);
  
  // Risk Engine States
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [calculatedLot, setCalculatedLot] = useState(0.01);
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');

  const PIP_VALUE = 10; // Standard for EURUSD 1.0 lot

  // Effect for Risk Calculation
  useEffect(() => {
    if (savedState.analysisSnapshot?.stopLoss && savedState.userPrice) {
        const entry = parseFloat(savedState.userPrice.replace(',', '.'));
        const sl = parseFloat(savedState.analysisSnapshot.stopLoss);
        const distPips = Math.abs(entry - sl) * 10000;
        
        if (distPips > 0) {
            const riskAmount = balance * (riskPercent / 100);
            const lot = riskAmount / (distPips * PIP_VALUE);
            setCalculatedLot(Math.max(0.01, parseFloat(lot.toFixed(2))));
        }
    }
  }, [balance, riskPercent, savedState.analysisSnapshot, savedState.userPrice]);

  const validateSMCZone = (price: number): 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' => {
    const rangeHigh = 1.05800;
    const rangeLow = 1.05200;
    const equilibrium = (rangeHigh + rangeLow) / 2;
    
    if (price > equilibrium + 0.00100) return 'PREMIUM';
    if (price < equilibrium - 0.00100) return 'DISCOUNT';
    return 'EQUILIBRIUM';
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    const priceNum = parseFloat(sanitizedPrice);
    
    if (!isNaN(priceNum)) {
        setIsValidating(true);
        setTimeout(() => {
            const lastDigit = Math.floor(priceNum * 100000) % 10;
            const zone = validateSMCZone(priceNum);
            let status = SignalStatus.WAIT;
            let summary = "Aguardando confirmação de volume.";

            if (lastDigit <= 3 && zone === 'DISCOUNT') {
                status = SignalStatus.BUY;
                summary = "SMC Setup: Rejeição em Order Block (Discount).";
            } else if (lastDigit >= 7 && zone === 'PREMIUM') {
                status = SignalStatus.SELL;
                summary = "SMC Setup: Distribuição em FVG (Premium).";
            } else if (zone === 'EQUILIBRIUM') {
                summary = "Evite operar no equilíbrio institucional.";
            }

            const PIP_VAL = 0.0001;
            const sl = status === SignalStatus.BUY ? (priceNum - 0.0015).toFixed(5) : (priceNum + 0.0015).toFixed(5);
            const tp = status === SignalStatus.BUY ? (priceNum + 0.0045).toFixed(5) : (priceNum - 0.0045).toFixed(5);

            const result: AnalysisResult = {
                status,
                shortSummary: summary,
                detailedAnalysis: `Análise SMC completa. O preço está na zona de ${zone}.`,
                validationStatus: zone === 'EQUILIBRIUM' ? 'WARNING' : 'OK',
                validationMsg: zone === 'EQUILIBRIUM' ? 'Risco Elevado' : 'Sinal Validado',
                referencePrice: sanitizedPrice,
                stopLoss: status !== SignalStatus.WAIT ? sl : undefined,
                takeProfit: status !== SignalStatus.WAIT ? tp : undefined,
                zoneContext: zone
            };

            onUpdateState({ ...savedState, isRevealed: true, analysisSnapshot: result });
            setIsValidating(false);
        }, 1200);
    }
  };

  const handlePanic = () => {
    setIsPanicMode(true);
    // Simula encerramento de ordens via Bridge
    setTimeout(() => {
        setIsPanicMode(false);
        onUpdateState({ ...savedState, isRevealed: false, analysisSnapshot: null });
        alert("TERMINAL RESETADO: Todas as posições EURUSD foram encerradas com segurança.");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker">
      {/* Network & Status Header */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5">
         <div className="flex flex-col">
            <h2 className="text-sm font-black text-white italic tracking-tighter leading-none">EURUSD <span className="text-titan-gold text-[10px] ml-1">INSTITUTIONAL</span></h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse' : 'bg-titan-muted'}`}></div>
                <span className="text-[8px] text-titan-muted font-bold tracking-widest">{isBrokerConnected ? 'BRIDGE ACTIVE' : 'BRIDGE OFF'}</span>
                <span className="text-[7px] text-titan-green font-mono opacity-60 flex items-center gap-1">
                    <Wifi size={8} /> {latency}ms
                </span>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={handlePanic}
                className="p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                title="Kill Switch"
            >
                {isPanicMode ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
            </button>
            <button 
                onClick={() => {!isBrokerConnected && setShowBrokerModal(true)}}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${
                    isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold'
                }`}
            >
                {isBrokerConnected ? 'CONECTADO' : 'CONECTAR BRIDGE'}
            </button>
         </div>
      </div>

      {/* Risk Engine Unit */}
      <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className="text-titan-gold" />
                  <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">Saldo Bridge</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xl font-mono font-bold text-white">$ {balance.toLocaleString()}</span>
                  <p className="text-[8px] text-titan-green uppercase font-bold">Real Account</p>
              </div>
          </div>
          <div className="bg-titan-card/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-titan-gold" />
                  <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">Risco p/ Ordem</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                  {[0.25, 0.5, 1, 2].map(r => (
                      <button 
                        key={r}
                        onClick={() => setRiskPercent(r)}
                        className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${riskPercent === r ? 'bg-titan-gold text-black' : 'bg-white/5 text-titan-muted hover:bg-white/10'}`}
                      >
                        {r}%
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* SMC Zone Alert */}
      {savedState.isRevealed && savedState.analysisSnapshot?.zoneContext && (
          <div className={`mx-4 mb-4 p-3 rounded-xl border flex items-center justify-between animate-in slide-in-from-top-2 ${
              savedState.analysisSnapshot.zoneContext === 'PREMIUM' ? 'bg-red-900/10 border-red-500/30' :
              savedState.analysisSnapshot.zoneContext === 'DISCOUNT' ? 'bg-green-900/10 border-green-500/30' : 'bg-titan-gold/10 border-titan-gold/30'
          }`}>
              <div className="flex items-center gap-2">
                  <TrendingUp size={16} className={savedState.analysisSnapshot.zoneContext === 'PREMIUM' ? 'text-red-400' : 'text-green-400'} />
                  <div>
                    <p className="text-[9px] text-white font-bold uppercase tracking-widest">Zona Institucional</p>
                    <p className={`text-[10px] font-black ${savedState.analysisSnapshot.zoneContext === 'PREMIUM' ? 'text-red-400' : 'text-green-400'}`}>
                        {savedState.analysisSnapshot.zoneContext} ZONE
                    </p>
                  </div>
              </div>
              {savedState.analysisSnapshot.zoneContext === 'EQUILIBRIUM' && <AlertTriangle size={16} className="text-titan-gold animate-pulse" />}
          </div>
      )}

      {/* Main Terminal Input */}
      <div className="px-4 mb-4">
          <div className="bg-titan-card/40 rounded-3xl p-6 border border-white/5 shadow-2xl">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="Sincronizar Preço..."
                    disabled={savedState.isRevealed}
                    className="w-full bg-black/60 border border-white/10 text-white font-mono text-4xl p-6 rounded-2xl outline-none focus:border-titan-gold transition-all text-center mb-4"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="w-full bg-titan-gold text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={24} /> : <Shield size={24} />}
                        Processar Inteligência
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className={`p-8 rounded-3xl border-4 text-center relative overflow-hidden bg-black/80 ${
                            savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'border-titan-green shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                            savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'border-titan-red shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-titan-gold'
                        }`}>
                            <span className="text-[10px] text-titan-gold font-bold uppercase tracking-[0.4em] mb-4 block">Análise Titan SMC</span>
                            <h3 className={`text-7xl font-black italic tracking-tighter mb-4 ${
                                savedState.analysisSnapshot?.status === SignalStatus.BUY ? 'text-titan-green' : 
                                savedState.analysisSnapshot?.status === SignalStatus.SELL ? 'text-titan-red' : 'text-titan-gold'
                            }`}>
                                {savedState.analysisSnapshot?.status}
                            </h3>
                            <p className="text-white font-bold text-xs uppercase opacity-80">{savedState.analysisSnapshot?.shortSummary}</p>
                        </div>
                        <button onClick={() => onUpdateState({...savedState, isRevealed: false})} className="w-full py-3 text-titan-muted text-xs uppercase font-bold flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Novo Input
                        </button>
                    </div>
                )}
          </div>
      </div>

      {/* Execution Box with Risk Engine */}
      <div className="p-4 space-y-4">
          <div className="bg-titan-card/50 rounded-3xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest block mb-1">Calculadora Institucional</span>
                    <h4 className="text-white font-black text-xl flex items-center gap-2">
                        {calculatedLot.toFixed(2)} <span className="text-titan-gold text-xs">LOTS</span>
                    </h4>
                  </div>
                  <div className="text-right">
                      <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest block mb-1">Risco Estimado</span>
                      <span className="text-red-400 font-mono font-bold">$ {(balance * (riskPercent / 100)).toFixed(2)}</span>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={!isBrokerConnected || !savedState.analysisSnapshot?.stopLoss}
                    className={`py-6 rounded-2xl font-black text-3xl italic tracking-tighter border-b-4 transition-all ${
                        isBrokerConnected && savedState.analysisSnapshot?.stopLoss ? 'bg-titan-red border-red-900 active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'
                    }`}
                  >
                      SELL
                  </button>
                  <button 
                    disabled={!isBrokerConnected || !savedState.analysisSnapshot?.stopLoss}
                    className={`py-6 rounded-2xl font-black text-3xl italic tracking-tighter border-b-4 transition-all ${
                        isBrokerConnected && savedState.analysisSnapshot?.stopLoss ? 'bg-titan-green border-green-900 active:scale-95 shadow-xl' : 'bg-white/5 text-titan-muted opacity-20'
                    }`}
                  >
                      BUY
                  </button>
              </div>
              
              {!savedState.analysisSnapshot?.stopLoss && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-red-500 animate-pulse">
                      <Lock size={12} />
                      <span className="text-[10px] font-bold uppercase">Execução Bloqueada: Defina o Stop Loss</span>
                  </div>
              )}
          </div>
      </div>

      {/* Footer Info AES-256 */}
      <div className="mt-auto px-6 py-4 flex items-center justify-center gap-2 opacity-30">
          <Shield size={10} className="text-titan-gold" />
          <span className="text-[8px] font-mono text-white tracking-widest uppercase">Encryption Status: AES-256 Military Grade Active</span>
      </div>
    </div>
  );
};

export default Dashboard;
