
import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Zap,
  Star,
  ShieldCheck,
  Cpu,
  BarChart3,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';

const ACADEMY_DATA: CourseModule[] = [
  {
    id: 'm1',
    title: 'Arquitetura IPDA & SMC',
    description: 'Como os bancos manipulam o EURUSD através do algoritmo.',
    lessons: [
      { id: 'l1', title: 'O Código do IPDA', duration: 'Masterclass', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=1200', completed: true },
      { id: 'l2', title: 'Liquidez vs Volume', duration: 'Deep Dive', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200', completed: true }
    ]
  },
  {
    id: 'm2',
    title: 'Estrutura de Mercado Elite',
    description: 'Identificando BOS, CHoCH e Inducement com precisão.',
    lessons: [
      { id: 'l3', title: 'Mapeamento de Range', duration: 'Advanced', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l4', title: 'CHoCH: A Virada de Fluxo', duration: 'SMC Core', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200', completed: false }
    ]
  },
  {
    id: 'm3',
    title: 'Supply & Demand (Advanced)',
    description: 'Order Blocks, Fair Value Gaps e zonas de mitigação.',
    lessons: [
      { id: 'l5', title: 'Anatomia do Order Block', duration: 'High Impact', imageUrl: 'https://images.unsplash.com/photo-1526303328194-ed252289744c?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l6', title: 'Engenharia de Liquidez', duration: 'Technical', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200', completed: false }
    ]
  },
  {
    id: 'm4',
    title: 'Psicologia Institucional',
    description: 'A mentalidade dos 1% que dominam o mercado cambial.',
    lessons: [
      { id: 'l7', title: 'O Viés de Execução', duration: 'Mindset', imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l8', title: 'Paciência Seletiva', duration: 'VIP Content', imageUrl: 'https://images.unsplash.com/photo-1484417855527-41c00a4a96df?auto=format&fit=crop&q=80&w=1200', completed: false }
    ]
  }
];

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={offset} className="text-titan-gold transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-[10px] font-black text-titan-gold">{Math.round(progress)}%</span>
    </div>
  );
};

const Academy: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isFullMap, setIsFullMap] = useState(false);
  
  const totalLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const progress = (completedLessons / totalLessons) * 100;

  if (selectedLesson) {
    return (
      <div className="flex flex-col min-h-full bg-titan-darker animate-in slide-in-from-right-4">
        {/* Full Map Modal */}
        {isFullMap && (
          <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 animate-in fade-in zoom-in">
             <button onClick={() => setIsFullMap(false)} className="absolute top-10 right-10 z-[210] p-4 bg-white/10 rounded-full text-white">
                <X size={24} />
             </button>
             <img src={selectedLesson.imageUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Full Resolution" />
          </div>
        )}

        <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-titan-dark">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted hover:text-white transition-colors bg-white/5 rounded-full">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Visual Intelligence</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        <div className="aspect-video bg-black relative group overflow-hidden border-b border-titan-gold/10">
          <img 
            className="w-full h-full object-cover opacity-90" 
            src={selectedLesson.imageUrl}
            alt={selectedLesson.title}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-titan-darker/95 via-transparent to-transparent"></div>

          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="bg-black/80 backdrop-blur-xl border border-titan-gold/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Cpu size={12} className="text-titan-gold" />
                  <span className="text-[8px] text-titan-gold font-black tracking-widest uppercase">HD_SCAN_ACTIVE</span>
               </div>
               <button 
                  onClick={() => setIsFullMap(true)} 
                  className="pointer-events-auto bg-titan-gold/10 p-2 rounded-lg border border-titan-gold/30 hover:bg-titan-gold/20 transition-all"
               >
                  <Maximize2 size={12} className="text-titan-gold" />
               </button>
            </div>
            
            <div className="flex justify-between items-end text-[7px] text-white/30 font-mono">
               <p>INSTITUTIONAL_MAP_01<br/>RES: 4K_ULTRA</p>
               <BarChart3 size={24} className="text-titan-gold opacity-30" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-titan-gold" />
                <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">Validated Setup</span>
              </div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedLesson.title}</h1>
            </div>
          </div>

          <div className="bg-titan-card/30 rounded-3xl p-6 border border-white/5 space-y-6 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-titan-gold" /> High Impact Intel
            </h3>
            <p className="text-xs text-titan-muted leading-relaxed font-medium">
                Esta aula técnica utiliza visualizações de alta definição para mapear onde a liquidez institucional está escondida no gráfico. O foco é identificar o rastro dos grandes bancos através de footprints algorítmicos.
            </p>
            
            <button 
              onClick={() => setIsFullMap(true)}
              className="w-full flex items-center justify-center gap-3 p-5 bg-titan-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-xl hover:bg-titan-goldLight transition-all"
            >
              <ImageIcon size={18} /> Resolução Total (Full Map)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="bg-titan-card/50 rounded-[2.5rem] p-10 border border-titan-gold/20 relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star size={12} className="text-titan-gold fill-current" />
            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.4em]">Elite Academy</span>
          </div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 leading-none uppercase">HIGH<br/>PERFORMANCE</h2>
        </div>
        <ProgressRing progress={progress} />
      </div>

      <div className="space-y-10">
        {ACADEMY_DATA.map((module, mIdx) => (
          <div key={module.id} className="space-y-4">
             <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-[1rem] bg-titan-dark border border-white/5 flex items-center justify-center font-black text-titan-gold text-lg shadow-xl">
                    {mIdx + 1}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{module.title}</h3>
                    <p className="text-[10px] text-titan-muted uppercase tracking-tighter font-medium">{module.description}</p>
                </div>
             </div>
             
             <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full flex items-center justify-between p-7 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.5rem] transition-all ${lesson.completed ? 'bg-titan-green/10 text-titan-green shadow-inner' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold shadow-lg'}`}>
                            {lesson.completed ? <CheckCircle2 size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-titan-gold transition-colors">{lesson.title}</p>
                            <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">{lesson.duration}</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-titan-muted group-hover:text-titan-gold transition-all" />
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academy;
