import React from 'react';
import { PRODUCTS, PIX_KEY } from '../constants';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

const Courses: React.FC = () => {
  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    alert('Chave PIX copiada!');
  };

  return (
    <div className="p-4 space-y-8">
      <div className="bg-gradient-to-br from-titan-gold/20 to-titan-dark p-6 rounded-2xl border border-titan-gold/20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Evolua seu Nível</h2>
        <p className="text-sm text-titan-muted">
          Acesse a metodologia completa e mentorias exclusivas.
        </p>
      </div>

      <div className="space-y-4">
        {PRODUCTS.sort((a, b) => b.priority - a.priority).map((product) => (
          <div key={product.id} className="bg-titan-card border border-titan-card hover:border-titan-gold/30 rounded-xl p-5 transition-all shadow-lg relative overflow-hidden group">
            {product.priority === 4 && (
               <div className="absolute top-0 right-0 bg-titan-gold text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                 MAIS VENDIDO
               </div>
            )}
            
            <div className="mb-4 pr-4">
              <span className="text-[10px] font-bold text-titan-gold uppercase tracking-wider mb-1 block">
                {product.tag}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight mb-2">{product.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
               {product.priceDisplay && (
                 <div className="flex flex-col">
                   <span className="text-[10px] text-titan-muted">Valor</span>
                   <span className="text-sm font-bold text-white">{product.priceDisplay}</span>
                 </div>
               )}
               <a 
                 href={product.stripeLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                   product.priority === 4 
                     ? 'bg-titan-gold text-black hover:bg-titan-goldLight w-full justify-center' 
                     : 'bg-white/5 text-white hover:bg-white/10 ml-auto'
                 }`}
               >
                 Comprar Agora
                 <ExternalLink size={14} />
               </a>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Methods / Pix */}
      <div className="bg-titan-card/50 border border-titan-card rounded-xl p-5 mt-8">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-titan-gold rounded-full"></div>
          Pagamento via PIX
        </h3>
        
        <div className="bg-black/40 p-3 rounded border border-white/5 flex items-center justify-between gap-3 mb-3">
           <code className="text-[10px] text-gray-300 break-all font-mono">{PIX_KEY}</code>
           <button onClick={copyPix} className="p-2 bg-titan-card hover:bg-white/10 rounded text-titan-gold transition-colors">
             <Copy size={16} />
           </button>
        </div>
        <p className="text-[10px] text-titan-muted text-center">
          Envie o comprovante para o WhatsApp de suporte para liberação imediata.
        </p>
      </div>
    </div>
  );
};

export default Courses;