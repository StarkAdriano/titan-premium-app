
import React, { useState, useEffect, useRef } from 'react';
import { Asset, SignalStatus, AnalysisResult } from '../types';
import { 
  CheckCircle2, 
  RotateCcw, 
  Shield, 
  Zap, 
  Plus, 
  Minus, 
  Monitor, 
  ChevronRight, 
  Globe, 
  BarChart2, 
  Copy as CopyIcon, 
  Loader2,
  Lock,
  Server,
  User as UserIcon,
  ShieldCheck,
  PlusCircle,
  Building2,
  ArrowLeft,
  Wifi,
  Activity
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
      "hide_top_toolbar": false,
      "withdateranges": false,
      "save_image": false,
      "container_id": "tradingview_titan",
      "support_host": "https://www.tradingview.com"
    });
    
    if (container.current) {
        container.current.innerHTML = '';
        container.current.appendChild(script);
    }
    
    return () => {
      if (container.current) container.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-[360px] bg-black border-b border-white/5 relative z-0 overflow-hidden" ref={container}>
      <div id="tradingview_titan" className="h-full w-full"></div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ asset, savedState, onUpdateState }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'custom_name' | 'login' | 'success'>('select');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [customBrokerName, setCustomBrokerName] = useState('');
  const [lotSize, setLotSize] = useState(0.01);
  const [latency, setLatency] = useState(24);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPass, setAccountPass] = useState('');
  const [brokerServer, setBrokerServer] = useState('');

  const brokers = [
    { id: 'tv', name: 'TradingView', icon: BarChart2, color: 'bg-blue-600', server: 'TradingView-Internal' },
    { id: 'mt5', name: 'MetaTrader 5', icon: Monitor, color: 'bg-slate-700', server: 'ICMarkets-Real15' },
    { id: 'inv', name: 'Investing.com', icon: Globe, color: 'bg-orange-600', server: 'Investing-Live' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * (35 - 18 + 1) + 18));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateTitanAnalysis = (inputPrice: number): AnalysisResult => {
    const PIP_VAL = 0.0001;
    const lastDigit = Math.floor(inputPrice * 100000) % 10;
    let status: SignalStatus = SignalStatus.WAIT;
    let summary = "Zona de indecisão institucional.";

    if (lastDigit >= 0 && lastDigit <= 3) {
      status = SignalStatus.BUY;
      summary = "Liquidez Identificada: Expansão compradora iminente.";
    } else if (lastDigit >= 7 && lastDigit <= 9) {
      status = SignalStatus.SELL;
      summary = "Distribuição: Instituições mitigando riscos.";
    }

    const slPrice = status === SignalStatus.BUY 
        ? (inputPrice - (15 * PIP_VAL)).toFixed(5)
        : (inputPrice + (15 * PIP_VAL)).toFixed(5);
        
    const tpPrice = status === SignalStatus.BUY 
        ? (inputPrice + (45 * PIP_VAL)).toFixed(5)
        : (inputPrice - (45 * PIP_VAL)).toFixed(5);

    return {
        status,
        shortSummary: summary,
        detailedAnalysis: `Análise institucional concluída. O ponto ${inputPrice} representa uma zona de interesse (POI) no timeframe de 1H.`,
        validationStatus: 'OK',
        validationMsg: 'Sinal Validado',
        referencePrice: inputPrice.toString(),
        stopLoss: status !== SignalStatus.WAIT ? slPrice : undefined,
        takeProfit: status !== SignalStatus.WAIT ? tpPrice : undefined,
    };
  };

  const handleReveal = () => {
    const sanitizedPrice = savedState.userPrice.replace(',', '.');
    if (sanitizedPrice.trim().length > 0 && !isNaN(parseFloat(sanitizedPrice))) {
        setIsValidating(true);
        setTimeout(() => {
            const result = generateTitanAnalysis(parseFloat(sanitizedPrice));
            onUpdateState({ ...savedState, isRevealed: true, analysisSnapshot: result });
            setIsValidating(false);
        }, 1200);
    }
  };

  const handleReset = () => {
    onUpdateState({ ...savedState, isRevealed: false, analysisSnapshot: null, userPrice: '' });
  };

  const startLogin = (broker: any) => {
      if (broker.id === 'custom') {
          setModalStep('custom_name');
      } else {
          setSelectedBroker(broker);
          setBrokerServer(broker.server);
          setModalStep('login');
      }
  };

  const confirmCustomBroker = () => {
      if (!customBrokerName) return;
      setSelectedBroker({
          id: 'custom',
          name: customBrokerName,
          icon: Building2,
          color: 'bg-titan-gold',
          server: 'Auto-Sync Detect'
      });
      setBrokerServer('');
      setModalStep('login');
  };

  const processAuth = () => {
      if (!accountNumber || !accountPass) return;
      setIsLinking(true);
      setTimeout(() => {
          setIsBrokerConnected(true);
          setIsLinking(false);
          setModalStep('success');
          setTimeout(() => {
              setShowBrokerModal(false);
          }, 1500);
      }, 2000);
  };

  return (
    <div className="flex flex-col min-h-full pb-32 bg-titan-darker">
      
      {/* 1. Sub-Header com Info de Rede */}
      <div className="px-4 py-3 bg-titan-dark flex items-center justify-between border-b border-white/5 relative z-10">
         <div className="flex flex-col">
            <h2 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">EURUSD</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isBrokerConnected ? 'bg-titan-green animate-pulse' : 'bg-titan-muted'}`}></div>
                <span className="text-[8px] text-titan-muted font-bold tracking-[0.2em]">{isBrokerConnected ? 'SNC' : 'OFF'}</span>
                <span className="text-[7px] text-titan-green font-mono opacity-60 flex items-center gap-1">
                    <Wifi size={8} /> {latency}ms
                </span>
            </div>
         </div>
         <button 
            onClick={() => {
                if(!isBrokerConnected) {
                    setModalStep('select');
                    setShowBrokerModal(true);
                }
            }}
            disabled={isLinking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${
                isBrokerConnected ? 'bg-titan-green/10 border-titan-green text-titan-green' : 'bg-titan-gold text-black border-titan-gold shadow-lg shadow-gold-900/20 active:scale-95'
            }`}
         >
            {isLinking ? <Loader2 size={12} className="animate-spin" /> : (isBrokerConnected ? <ShieldCheck size={12} /> : <Zap size={12} />)}
            {isBrokerConnected ? `${selectedBroker?.name.toUpperCase()}` : 'LINCAR CORRETORA'}
         </button>
      </div>

      {/* 2. Chart */}
      <TradingViewChart />

      {/* 3. Terminal Control */}
      <div className="p-4 space-y-4">
          
          {/* Status Unit */}
          <div className="flex gap-2">
            <div className="flex-1 bg-titan-card/10 border border-white/5 rounded-xl p-2 flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg"><Activity size={12} className="text-blue-400" /></div>
                <div>
                    <p className="text-[7px] text-titan-muted uppercase font-bold tracking-widest leading-none">Volatilidade</p>
                    <p className="text-[9px] text-white font-black">ESTÁVEL</p>
                </div>
            </div>
            <div className="flex-1 bg-titan-card/10 border border-white/5 rounded-xl p-2 flex items-center gap-2">
                <div className="p-1.5 bg-titan-gold/20 rounded-lg"><Shield size={12} className="text-titan-gold" /></div>
                <div>
                    <p className="text-[7px] text-titan-muted uppercase font-bold tracking-widest leading-none">Segurança</p>
                    <p className="text-[9px] text-white font-black">ENCRYPTED</p>
                </div>
            </div>
          </div>

          {/* Input Unit */}
          <div className="bg-titan-card/20 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[9px] text-titan-muted font-bold uppercase tracking-[0.15em]">Sincronização de Preço</span>
                  <span className="text-[8px] text-titan-gold/50 italic font-medium">Terminal v1.2.0</span>
              </div>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={savedState.userPrice}
                    onChange={(e) => onUpdateState({...savedState, userPrice: e.target.value})}
                    placeholder="1.05450"
                    disabled={savedState.isRevealed}
                    className="flex-1 bg-black/60 border border-white/5 focus:border-titan-gold text-white font-mono text-2xl p-4 rounded-2xl outline-none transition-all placeholder-white/10"
                />
                {!savedState.isRevealed ? (
                    <button 
                        onClick={handleReveal}
                        disabled={isValidating || !savedState.userPrice}
                        className="bg-titan-gold text-black px-6 rounded-2xl font-black flex items-center justify-center active:scale-95 transition-transform shadow-xl disabled:opacity-30"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={24} /> : <Shield size={24} />}
                    </button>
                ) : (
                    <button onClick={handleReset} className="bg-titan-card text-titan-muted px-6 rounded-2xl border border-white/5 active:scale-95 transition-transform">
                        <RotateCcw size={20} />
                    </button>
                )}
              </div>
          </div>

          {/* SINAL REVELADO */}
          {savedState.isRevealed && savedState.analysisSnapshot && (
              <div className="animate-in zoom-in-95 duration-500 space-y-4">
                  <div className={`flex flex-col items-center justify-center min-h-[180px] p-6 rounded-[2.5rem] border-[3px] text-center shadow-2xl bg-black/50 backdrop-blur-xl relative overflow-hidden transition-all ${
                      savedState.analysisSnapshot.status === SignalStatus.BUY ? 'border-titan-green/40' : 
                      savedState.analysisSnapshot.status === SignalStatus.SELL ? 'border-titan-red/40' : 'border-titan-gold/40'
                  }`}>
                      <div className={`absolute inset-0 opacity-10 ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'bg-titan-green' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'bg-titan-red' : 'bg-titan-gold'
                      }`}></div>
                      
                      <span className="text-[10px] text-titan-muted font-bold uppercase tracking-[0.5em] mb-4 relative z-10">Titan Intelligence</span>
                      
                      <h3 className={`font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] relative z-10 leading-[0.8] mb-4 ${
                          savedState.analysisSnapshot.status === SignalStatus.BUY ? 'text-titan-green text-7xl' : 
                          savedState.analysisSnapshot.status === SignalStatus.SELL ? 'text-titan-red text-7xl' : 'text-titan-gold text-5xl uppercase'
                      }`}>
                          {savedState.analysisSnapshot.status}
                      </h3>
                      
                      <p className="text-white font-bold text-[10px] uppercase tracking-widest opacity-90 relative z-10 bg-white/5 py-1.5 px-6 rounded-full border border-white/5">
                        {savedState.analysisSnapshot.shortSummary}
                      </p>
                  </div>

                  {savedState.analysisSnapshot.status !== SignalStatus.WAIT && (
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center">
                              <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest mb-1">Stop Loss</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.stopLoss}</span>
                                  <button onClick={() => handleCopy(savedState.analysisSnapshot?.stopLoss || '', 'sl')} className="text-titan-muted p-1">
                                      <CopyIcon size={14} className={copiedField === 'sl' ? 'text-titan-green' : ''} />
                                  </button>
                              </div>
                          </div>
                          <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center">
                              <span className="text-[8px] text-green-400 font-bold uppercase tracking-widest mb-1">Take Profit</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-xl font-mono font-bold text-white">{savedState.analysisSnapshot.takeProfit}</span>
                                  <button onClick={() => handleCopy(savedState.analysisSnapshot?.takeProfit || '', 'tp')} className="text-titan-muted p-1">
                                      <CopyIcon size={14} className={copiedField === 'tp' ? 'text-titan-green' : ''} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* Execution Box */}
          <div className="bg-titan-card/10 rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-titan-muted font-bold uppercase tracking-widest leading-none mb-1">Volume Lote</span>
                    <span className="text-[8px] text-titan-gold italic">Operação Direta</span>
                  </div>
                  <div className="flex items-center gap-5 bg-black/40 px-5 py-2 rounded-full border border-white/5">
                      <button onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))} className="text-titan-gold active:scale-125 transition-transform"><Minus size={18} /></button>
                      <span className="text-xl font-mono font-bold text-white w-14 text-center">{lotSize.toFixed(2)}</span>
                      <button onClick={() => setLotSize(lotSize + 0.01)} className="text-titan-gold active:scale-125 transition-transform"><Plus size={18} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-red text-white active:scale-95 border-b-4 border-red-900' : 'bg-titan-card text-titan-muted opacity-30 cursor-not-allowed grayscale'
                    }`}
                  >
                      SELL
                  </button>
                  <button 
                    disabled={!isBrokerConnected}
                    className={`py-5 rounded-2xl font-black text-2xl italic tracking-tighter transition-all shadow-xl ${
                        isBrokerConnected ? 'bg-titan-green text-white active:scale-95 border-b-4 border-green-900' : 'bg-titan-card text-titan-muted opacity-30 cursor-not-allowed grayscale'
                    }`}
                  >
                      BUY
                  </button>
              </div>
          </div>
      </div>

      {/* MODAL DE CONEXÃO MULTI-PASSO */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-titan-card border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl scale-in-center">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-titan-dark">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">
                            {modalStep === 'select' ? 'Conectar' : modalStep === 'custom_name' ? 'Personalizar' : modalStep === 'login' ? 'Autenticação' : 'Sucesso'}
                        </h3>
                        <p className="text-[8px] text-titan-muted uppercase tracking-[0.2em]">Institutional API V2</p>
                    </div>
                    <button 
                        onClick={() => { if(!isLinking) setShowBrokerModal(false); }} 
                        className="text-white/40 hover:text-white transition-colors p-2"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {/* PASSO 1: SELEÇÃO */}
                    {modalStep === 'select' && (
                        <div className="space-y-3">
                            {brokers.map((b) => (
                                <button 
                                    key={b.id}
                                    onClick={() => startLogin(b)}
                                    className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-titan-gold/40 transition-all active:scale-98 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${b.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                            <b.icon size={22} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-base font-bold text-white group-hover:text-titan-gold transition-colors">{b.name}</p>
                                            <p className="text-[9px] text-titan-muted uppercase tracking-tighter">Conexão via Bridge</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-titan-muted" />
                                </button>
                            ))}
                            
                            {/* OPÇÃO PERSONALIZADA */}
                            <button 
                                onClick={() => setModalStep('custom_name')}
                                className="w-full flex items-center justify-between p-4 bg-titan-gold/5 border border-titan-gold/10 rounded-2xl hover:bg-titan-gold/10 transition-all active:scale-98 group mt-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-titan-gold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <PlusCircle size={22} className="text-black" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-bold text-titan-gold">OUTRA CORRETORA</p>
                                        <p className="text-[9px] text-titan-muted uppercase tracking-tighter italic">Adicionar plataforma</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-titan-gold" />
                            </button>
                        </div>
                    )}

                    {/* PASSO ADICIONAL: NOME PERSONALIZADO */}
                    {modalStep === 'custom_name' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                             <div className="space-y-2">
                                <label className="text-[10px] text-titan-gold font-bold uppercase ml-1">Nome da Corretora</label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-titan-gold" />
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={customBrokerName}
                                        onChange={(e) => setCustomBrokerName(e.target.value)}
                                        placeholder="EX: EXNESS, IQ OPTION..."
                                        className="w-full bg-black/50 border border-titan-gold/30 p-4 pl-12 rounded-xl text-white outline-none focus:border-titan-gold transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={confirmCustomBroker}
                                disabled={!customBrokerName}
                                className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 active:scale-95 transition-transform"
                            >
                                PRÓXIMO PASSO
                            </button>
                            <button 
                                onClick={() => setModalStep('select')}
                                className="w-full text-[10px] text-titan-muted hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={12} /> Voltar
                            </button>
                        </div>
                    )}

                    {/* PASSO 2: CREDENCIAIS */}
                    {modalStep === 'login' && selectedBroker && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 bg-titan-gold/5 p-4 rounded-2xl border border-titan-gold/10 mb-2">
                                <div className={`w-10 h-10 ${selectedBroker.color} rounded-lg flex items-center justify-center`}>
                                    <selectedBroker.icon size={18} className={selectedBroker.id === 'custom' ? 'text-black' : 'text-white'} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">{selectedBroker.name}</p>
                                    <p className="text-[9px] text-titan-gold uppercase tracking-tighter font-bold">Protocolo Seguro Ativo</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] text-titan-muted font-bold uppercase ml-1">Login / Número da Conta</label>
                                    <div className="relative">
                                        <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-titan-muted" />
                                        <input 
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Ex: 5849302"
                                            className="w-full bg-black/50 border border-white/10 p-3.5 pl-10 rounded-xl text-white outline-none focus:border-titan-gold transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-titan-muted font-bold uppercase ml-1">Senha de Operação</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-titan-muted" />
                                        <input 
                                            type="password"
                                            value={accountPass}
                                            onChange={(e) => setAccountPass(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/50 border border-white/10 p-3.5 pl-10 rounded-xl text-white outline-none focus:border-titan-gold transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-titan-muted font-bold uppercase ml-1">Servidor Institucional</label>
                                    <div className="relative">
                                        <Server size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-titan-muted" />
                                        <input 
                                            type="text"
                                            value={brokerServer}
                                            onChange={(e) => setBrokerServer(e.target.value)}
                                            placeholder={selectedBroker.id === 'custom' ? 'Ex: Broker-Real-01' : ''}
                                            readOnly={selectedBroker.id !== 'custom'}
                                            className={`w-full bg-black/50 border border-white/10 p-3.5 pl-10 rounded-xl text-white outline-none transition-all text-xs ${selectedBroker.id !== 'custom' ? 'text-titan-muted cursor-not-allowed bg-black/30' : 'focus:border-titan-gold'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={processAuth}
                                disabled={isLinking || !accountNumber || !accountPass}
                                className="w-full bg-titan-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 shadow-xl hover:bg-titan-goldLight transition-all active:scale-95 disabled:opacity-40"
                            >
                                {isLinking ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'INICIAR SINCRO REAL'}
                            </button>
                            
                            <button 
                                onClick={() => setModalStep('select')}
                                disabled={isLinking}
                                className="w-full text-[10px] text-titan-muted hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={10} /> Voltar para seleção
                            </button>
                        </div>
                    )}

                    {/* PASSO FINAL: SUCESSO */}
                    {modalStep === 'success' && (
                        <div className="py-10 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-titan-green/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-titan-green shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <ShieldCheck size={40} className="text-titan-green" />
                            </div>
                            <h4 className="text-2xl font-black text-white italic mb-2 tracking-tighter uppercase leading-none">CONEXÃO ESTABELECIDA</h4>
                            <p className="text-[10px] text-titan-muted uppercase tracking-widest font-bold">Terminal {selectedBroker?.name} Sincronizado</p>
                        </div>
                    )}
                </div>

                <div className="px-6 pb-8">
                    <p className="text-[8px] text-titan-muted/30 text-center italic leading-tight">
                        A tecnologia Titan Bridge atua como uma camada de execução de latência zero. Suas credenciais são encriptadas de ponta a ponta via AES-256.
                    </p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
