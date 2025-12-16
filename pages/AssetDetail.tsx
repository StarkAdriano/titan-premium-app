import React, { useState } from 'react';
import { Asset, SignalStatus } from '../types';
import { ArrowLeft, Clock, Bookmark, Calculator, CheckCircle2 } from 'lucide-react';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onBack }) => {
  const [userPrice, setUserPrice] = useState('');

  const getStatusColor = (status: SignalStatus) => {
    switch (status) {
      case SignalStatus.BUY: return 'text-titan-green';
      case SignalStatus.SELL: return 'text-titan-red';
      case SignalStatus.WAIT: return 'text-titan-gold';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers, commas and dots
      const val = e.target.value;
      if (/^[\d,.]*$/.test(val)) {
          setUserPrice(val);
      }
  };

  return (
    <div className="bg-titan-darker min-h-full pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-titan-dark/95 backdrop-blur border-b border-titan-card p-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-titan-muted hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-white">{asset.symbol}</h2>
          <span className="text-xs text-titan-gold">{asset.lastUpdated}</span>
        </div>
        <button className="p-2 -mr-2 text-titan-muted hover:text-titan-gold">
          <Bookmark size={24} fill={asset.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-6">
        {/* Giant Status */}
        <div className="text-center mb-6 py-6 border-b border-titan-card/50">
          <div className={`text-5xl font-black uppercase tracking-tighter mb-2 ${getStatusColor(asset.status)} drop-shadow-lg`}>
            {asset.status}
          </div>
          <p className="text-titan-muted text-sm font-light tracking-wide uppercase">
            Ref. Institucional: <span className="text-white font-mono">{asset.price}</span>
          </p>
        </div>

        {/* Manual Entry Price Input */}
        <div className="mb-8">
          <div className="bg-titan-card border border-titan-gold/30 rounded-xl p-5 shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-20 h-20 bg-titan-gold/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-titan-gold/10 transition-colors"></div>
             
             <div className="flex items-center gap-2 mb-3 relative z-10">
                <Calculator size={16} className="text-titan-gold" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sua Execução</h3>
             </div>

             <div className="relative z-10">
                <label className="block text-[10px] text-titan-muted mb-2 font-medium">
                  Insira o preço exato da sua corretora para operar com precisão:
                </label>
                <div className="relative flex items-center">
                   <input 
                      type="text" 
                      inputMode="decimal"
                      value={userPrice}
                      onChange={handleInputChange}
                      placeholder={asset.price}
                      className="w-full bg-titan-dark border-l-4 border-l-titan-gold border-y border-r border-titan-card text-white font-mono text-xl py-3 pl-4 pr-12 rounded-r-lg focus:outline-none focus:border-y-titan-gold/50 focus:border-r-titan-gold/50 transition-colors placeholder-gray-700"
                   />
                   {userPrice && (
                     <div className="absolute right-3 text-titan-green animate-in fade-in zoom-in">
                        <CheckCircle2 size={20} />
                     </div>
                   )}
                </div>
                {userPrice && (
                  <p className="text-[10px] text-titan-green mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-titan-green inline-block"></span>
                    Entrada definida em {userPrice}
                  </p>
                )}
             </div>
          </div>
        </div>

        {/* Institutional Reading */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-titan-gold uppercase tracking-wider mb-3 border-l-2 border-titan-gold pl-3">
            Leitura Institucional
          </h3>
          <div className="bg-titan-card/40 rounded-xl p-5 border border-titan-card">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {asset.detailedAnalysis}
            </p>
          </div>
        </div>

        {/* History Timeline */}
        <div>
          <h3 className="text-sm font-bold text-titan-muted uppercase tracking-wider mb-4 pl-3">
            Histórico do Setup
          </h3>
          <div className="space-y-0 pl-2">
            {asset.history.length > 0 ? (
              asset.history.map((entry, index) => (
                <div key={entry.id} className="relative pl-6 pb-8 border-l border-titan-card last:pb-0 last:border-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-titan-dark border border-titan-muted"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-titan-muted uppercase flex items-center gap-1 mb-1">
                      <Clock size={10} /> {entry.date}
                    </span>
                    <span className={`text-xs font-bold mb-1 ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    <p className="text-xs text-gray-400">
                      {entry.summary}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-titan-muted pl-6 italic">Sem histórico recente registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;