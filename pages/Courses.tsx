
import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import { 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Lock, 
  ArrowLeft,
  Download,
  Zap,
  Star,
  ShieldCheck,
  Cpu,
  Layers,
  BarChart3,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';

const ACADEMY_DATA: CourseModule[] = [
  {
    id: 'm1',
    title: 'Arquitetura IPDA & SMC',
    description: 'Como os bancos manipulam o EURUSD através do algoritmo.',
    lessons: [
      { id: 'l1', title: 'O Código do IPDA', duration: 'Masterclass', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=1200', completed: true },
      { id: 'l2', title: 'Liquidez vs Volume', duration: 'Deep Dive', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', completed: true, pdfUrl: '#' }
    ]
  },
  {
    id: 'm2',
    title: 'Estrutura de Mercado Elite',
    description: 'Identificando BOS, CHoCH e Inducement com precisão.',
    lessons: [
      { id: 'l3', title: 'Mapeamento de Range', duration: 'Advanced', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l4', title: 'CHoCH: A Virada de Fluxo', duration: 'SMC Core', imageUrl: 'https://images.unsplash.com/photo-1526303328194-ed252289744c?auto=format&fit=crop&q=80&w=1200', completed: false, pdfUrl: '#' }
    ]
  },
  {
    id: 'm3',
    title: 'Supply & Demand (Advanced)',
    description: 'Order Blocks, Fair Value Gaps e zonas de mitigação.',
    lessons: [
      { id: 'l5', title: 'Anatomia do Order Block', duration: 'High Impact', imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l6', title: 'Engenharia de Liquidez', duration: 'Technical', imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200', completed: false }
    ]
  },
  {
    id: 'm4',
    title: 'Psicologia Institucional',
    description: 'A mentalidade dos 1% que dominam o mercado cambial.',
    lessons: [
      { id: 'l7', title: 'O Viés de Execução', duration: 'Mindset', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200', completed: false },
      { id: 'l8', title: 'Paciência Seletiva', duration: 'VIP Content', imageUrl: 'https://images.unsplash.com/photo-1512428559083-a40516d32ffb?auto=format&fit=crop&q=80&w=1200', completed: false }
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
  const totalLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const progress = (completedLessons / totalLessons) * 100;

  if (selectedLesson) {
    return (
      <div className="flex flex-col min-h-full bg-titan-darker animate-in slide-in-from-right-4">
        <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-titan-dark">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted hover:text-white transition-colors bg-white/5 rounded-full">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Alpha Intelligence</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        <div className="aspect-video bg-black relative group overflow-hidden border-b border-titan-gold/10">
          <img 
            className="w-full h-full object-cover opacity-80" 
            src={selectedLesson.imageUrl}
            alt={selectedLesson.title}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-titan-darker/90 via-transparent to-transparent"></div>

          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="bg-black/60 backdrop-blur-xl border border-titan-gold/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Cpu size={12} className="text-titan-gold animate-pulse" />
                  <span className="text-[8px] text-titan-gold font-black tracking-widest uppercase">NODE_{Math.random().toString(36).substr(2, 4).toUpperCase()}</span>
               </div>
               <div className="bg-titan-gold/10 p-2 rounded-lg border border-titan-gold/30">
                  <Maximize2 size={12} className="text-titan-gold" />
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <div className="h-0.5 flex-1 bg-white/10">
                     <div className="h-full bg-titan-gold w-1/3 shadow-[0_0_10px_#d4af37]"></div>
                  </div>
                  <span className="text-[7px] text-titan-gold font-mono uppercase tracking-tighter">Auth_Secured</span>
               </div>
               <div className="flex justify-between items-end">
                  <div className="text-[7px] text-white/50 font-mono leading-none">
                     <p>SOURCE_IP: 192.168.{Math.floor(Math.random()*255)}</p>
                     <p>RES: INSTITUTIONAL_HD</p>
                  </div>
                  <BarChart3 size={24} className="text-titan-gold opacity-30" />
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-titan-gold" />
                <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">Certified Blueprint</span>
              </div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedLesson.title}</h1>
            </div>
          </div>

          <div className="bg-titan-card/30 rounded-3xl p-6 border border-white/5 space-y-5 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-titan-gold" /> SMC Data Briefing
            </h3>
            <p className="text-xs text-titan-muted leading-relaxed font-medium">
                Esta aula técnica utiliza visualizações de alta definição para mapear onde a liquidez institucional está escondida no gráfico do EURUSD. O foco é identificar o rastro dos grandes bancos.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button className="flex items-center justify-center gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 text-[9px] font-black text-titan-muted uppercase tracking-widest active:scale-95">
                <ImageIcon size={14} /> Full Resolution
              </button>
              {selectedLesson.pdfUrl && (
                <button className="flex items-center justify-center gap-2 p-4 bg-titan-gold/10 rounded-2xl border border-titan-gold/20 text-[9px] font-black text-titan-gold uppercase tracking-widest active:scale-95 shadow-lg">
                  <Download size={14} /> SMC Manual
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="bg-titan-card/50 rounded-[2.5rem] p-8 border border-titan-gold/20 relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star size={12} className="text-titan-gold fill-current" />
            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.4em]">Elite Training Center</span>
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 leading-none">KNOWLEDGE<br/>IS POWER</h2>
          <p className="text-[9px] text-titan-muted uppercase font-bold tracking-[0.2em]">Institutional Level Education</p>
        </div>
        <ProgressRing progress={progress} />
      </div>

      <div className="space-y-8">
        {ACADEMY_DATA.map((module, mIdx) => (
          <div key={module.id} className="space-y-4">
             <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-2xl bg-titan-dark border border-white/5 flex items-center justify-center font-black text-titan-gold text-sm shadow-lg">
                    {mIdx + 1}
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-none mb-1">{module.title}</h3>
                    <p className="text-[10px] text-titan-muted uppercase tracking-tighter font-medium">{module.description}</p>
                </div>
             </div>
             
             <div className="bg-titan-card/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl transition-all ${lesson.completed ? 'bg-titan-green/10 text-titan-green shadow-inner' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold shadow-lg'}`}>
                            {lesson.completed ? <CheckCircle2 size={18} /> : <ImageIcon size={18} />}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-titan-gold transition-colors">{lesson.title}</p>
                            <span className="text-[8px] text-titan-muted uppercase font-bold tracking-widest">{lesson.duration}</span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-titan-muted group-hover:text-titan-gold transition-all" />
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
