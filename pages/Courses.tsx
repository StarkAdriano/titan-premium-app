
import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Lock, 
  ArrowLeft,
  CircleDashed,
  Download,
  MonitorPlay,
  Zap,
  Star,
  ShieldCheck,
  Cpu,
  Layers,
  BarChart3
} from 'lucide-react';

// Vídeos educacionais de alta qualidade focados em SMC (Placeholders de alta autoridade)
const ACADEMY_DATA: CourseModule[] = [
  {
    id: 'm1',
    title: 'Arquitetura IPDA & SMC',
    description: 'Como os bancos manipulam o EURUSD através do algoritmo.',
    lessons: [
      { id: 'l1', title: 'O Código do IPDA', duration: '12:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: true },
      { id: 'l2', title: 'Liquidez vs Volume', duration: '15:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: true, pdfUrl: '#' }
    ]
  },
  {
    id: 'm2',
    title: 'Estrutura de Mercado Elite',
    description: 'Identificando BOS, CHoCH e Inducement com precisão.',
    lessons: [
      { id: 'l3', title: 'Mapeamento de Range', duration: '22:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false },
      { id: 'l4', title: 'CHoCH: A Virada de Fluxo', duration: '18:55', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false, pdfUrl: '#' }
    ]
  },
  {
    id: 'm3',
    title: 'Supply & Demand (Advanced)',
    description: 'Order Blocks, Fair Value Gaps e zonas de mitigação.',
    lessons: [
      { id: 'l5', title: 'Anatomia do Order Block', duration: '25:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false },
      { id: 'l6', title: 'Engenharia de Liquidez', duration: '14:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false }
    ]
  },
  {
    id: 'm4',
    title: 'Titan Execution Protocol',
    description: 'O checklist final para operar o par EURUSD.',
    lessons: [
      { id: 'l7', title: 'Confluência Titan Premium', duration: '32:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false, pdfUrl: '#' },
      { id: 'l8', title: 'Psicologia de Alta Performance', duration: '45:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false }
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
        {/* Header da Aula */}
        <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-titan-dark">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted hover:text-white transition-colors bg-white/5 rounded-full">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Módulo em Progresso</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        {/* Professional Video Player with AI Overlay */}
        <div className="aspect-video bg-black relative group overflow-hidden border-b border-titan-gold/10">
          <video 
            className="w-full h-full object-cover opacity-60" 
            controls={false}
            autoPlay
            muted
            loop
            src={selectedLesson.videoUrl}
          />
          
          {/* AI Interface Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="bg-black/60 backdrop-blur-md border border-titan-gold/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Cpu size={12} className="text-titan-gold animate-pulse" />
                  <span className="text-[8px] text-titan-gold font-black tracking-widest uppercase">Titan AI Analysis Active</span>
               </div>
               <div className="bg-black/40 p-2 rounded-lg border border-white/10">
                  <Layers size={12} className="text-white/40" />
               </div>
            </div>
            
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-1 rounded-full bg-titan-green animate-ping"></div>
                     <span className="text-[7px] text-white/40 font-mono">ENCODING: SMC_PROTOCOL_V4</span>
                  </div>
                  <div className="text-[7px] text-white/20 font-mono">FRAME_BUFFER: 1080P_STABLE</div>
               </div>
               <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-titan-gold animate-shimmer"></div>
               </div>
            </div>
          </div>

          {/* Central Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-20 h-20 rounded-full bg-titan-gold/10 backdrop-blur-sm flex items-center justify-center border border-titan-gold/40 group-hover:scale-110 transition-transform active:scale-95 shadow-2xl">
              <Play size={28} className="text-titan-gold fill-current ml-1" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-titan-gold" />
                <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">Contéudo Verificado</span>
              </div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedLesson.title}</h1>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[8px] text-titan-muted uppercase font-bold tracking-widest mb-1">Duração</span>
               <span className="text-sm font-mono font-bold text-white">{selectedLesson.duration}</span>
            </div>
          </div>

          {/* AI Briefing */}
          <div className="bg-titan-card/30 rounded-3xl p-6 border border-white/5 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <BarChart3 size={80} />
            </div>
            
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-titan-gold" /> AI Lesson Insights
            </h3>
            <p className="text-xs text-titan-muted leading-relaxed font-medium italic">
                "Este módulo foca no comportamento do preço em relação ao tempo (Time & Price). Identificar onde os bancos acumulam ordens é o primeiro passo para não se tornar a liquidez deles."
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button className="flex items-center justify-center gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 text-[9px] font-black text-titan-muted hover:text-white transition-all uppercase tracking-widest active:scale-95">
                <FileText size={14} /> Technical Notes
              </button>
              {selectedLesson.pdfUrl && (
                <button className="flex items-center justify-center gap-2 p-4 bg-titan-gold/10 rounded-2xl border border-titan-gold/20 text-[9px] font-black text-titan-gold hover:bg-titan-gold hover:text-black transition-all uppercase tracking-widest active:scale-95 shadow-lg">
                  <Download size={14} /> SMC Blueprint
                </button>
              )}
            </div>
          </div>

          <div className="py-4 border-t border-white/5">
             <div className="flex items-center gap-3 opacity-30">
                <CheckCircle2 size={16} className="text-titan-green" />
                <p className="text-[10px] text-white uppercase font-black tracking-widest">Protocolo de Conclusão Automática</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header Academy */}
      <div className="bg-titan-card/50 rounded-[2.5rem] p-8 border border-titan-gold/20 relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star size={12} className="text-titan-gold fill-current" />
            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.4em]">Titan Academy Elite</span>
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 leading-none">FORMAÇÃO<br/>INSTITUCIONAL</h2>
          <p className="text-[9px] text-titan-muted uppercase font-bold tracking-[0.2em]">O Caminho para a Consistência</p>
        </div>
        <ProgressRing progress={progress} />
        <div className="absolute top-0 right-0 w-48 h-48 bg-titan-gold/5 rounded-full -mr-24 -mt-24 blur-[80px]"></div>
      </div>

      {/* Listagem de Módulos */}
      <div className="space-y-8">
        {ACADEMY_DATA.map((module, mIdx) => (
          <div key={module.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${mIdx * 100}ms` }}>
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
                    className="w-full flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group active:bg-white/10"
                  >
                    <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl transition-all ${lesson.completed ? 'bg-titan-green/10 text-titan-green shadow-inner' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold group-hover:scale-110 shadow-lg'}`}>
                            {lesson.completed ? <CheckCircle2 size={18} /> : <MonitorPlay size={18} />}
                        </div>
                        <div className="text-left">
                            <p className={`text-xs font-black uppercase tracking-tight ${lesson.completed ? 'text-white/40' : 'text-white group-hover:text-titan-gold transition-colors'}`}>{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-titan-muted uppercase font-bold tracking-widest">{lesson.duration}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.2em]">HD Ready</span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-titan-muted group-hover:text-titan-gold transition-all group-hover:translate-x-1" />
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Lock Status Bar */}
      <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-4 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
             <Lock size={20} className="text-blue-400" />
          </div>
          <p className="text-[10px] text-blue-200/60 italic leading-relaxed font-medium">
            Módulos avançados de **Alta Liquidez** e **Entradas Snipers** são desbloqueados automaticamente conforme seu tempo de tela no Terminal aumenta.
          </p>
      </div>
    </div>
  );
};

export default Academy;
