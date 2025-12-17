
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
  Star
} from 'lucide-react';

const ACADEMY_DATA: CourseModule[] = [
  {
    id: 'm1',
    title: 'Fundamentos Institucionais',
    description: 'A base por trás do algoritmo interbancário (IPDA).',
    lessons: [
      { id: 'l1', title: 'O Que é o IPDA?', duration: '12:45', videoUrl: '#', completed: true },
      { id: 'l2', title: 'Os Donos do Mercado', duration: '15:20', videoUrl: '#', completed: true, pdfUrl: '#' }
    ]
  },
  {
    id: 'm2',
    title: 'Mapeamento de Estrutura',
    description: 'Aprenda a identificar BOS e CHoCH como um robô.',
    lessons: [
      { id: 'l3', title: 'Quebra de Estrutura (BOS)', duration: '22:10', videoUrl: '#', completed: false },
      { id: 'l4', title: 'Mudança de Caráter (CHoCH)', duration: '18:55', videoUrl: '#', completed: false, pdfUrl: '#' }
    ]
  },
  {
    id: 'm3',
    title: 'Zonas de Oferta e Demanda',
    description: 'Como encontrar Order Blocks de alta probabilidade.',
    lessons: [
      { id: 'l5', title: 'Anatomia do Order Block', duration: '25:30', videoUrl: '#', completed: false },
      { id: 'l6', title: 'Fair Value Gaps (FVG)', duration: '14:15', videoUrl: '#', completed: false }
    ]
  },
  {
    id: 'm4',
    title: 'O Setup Titan Premium',
    description: 'A confluência final para o par EURUSD.',
    lessons: [
      { id: 'l7', title: 'Checklist de Entrada', duration: '32:00', videoUrl: '#', completed: false, pdfUrl: '#' },
      { id: 'l8', title: 'Gestão de Trade ao Vivo', duration: '45:10', videoUrl: '#', completed: false }
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
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted"><ArrowLeft size={20} /></button>
          <h2 className="text-sm font-bold text-white truncate">{selectedLesson.title}</h2>
        </div>
        
        {/* Luxury Video Player Container */}
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          <div className="w-16 h-16 rounded-full bg-titan-gold/20 flex items-center justify-center border border-titan-gold/50 group-hover:scale-110 transition-transform">
            <Play size={24} className="text-titan-gold fill-current ml-1" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-titan-gold w-1/3"></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-titan-gold font-bold uppercase tracking-widest mb-1 block">Aula em Exibição</span>
              <h1 className="text-2xl font-black text-white italic tracking-tighter">{selectedLesson.title}</h1>
            </div>
            <div className="p-3 bg-titan-green/10 rounded-xl border border-titan-green/20">
              <CheckCircle2 size={20} className="text-titan-green" />
            </div>
          </div>

          <div className="bg-titan-card/30 rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-titan-gold" /> Recursos da Aula
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-bold text-titan-muted hover:text-white transition-colors">
                <FileText size={14} /> NOTAS DA AULA
              </button>
              {selectedLesson.pdfUrl && (
                <button className="flex items-center justify-center gap-2 p-3 bg-titan-gold/10 rounded-xl border border-titan-gold/20 text-[10px] font-bold text-titan-gold hover:bg-titan-gold hover:text-black transition-all">
                  <Download size={14} /> SMC BLUEPRINT
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-titan-muted leading-relaxed italic">
            "A consistência institucional não vem de um setup milagroso, mas sim de entender onde o dinheiro real está posicionado."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Academy Header Card */}
      <div className="bg-titan-card rounded-3xl p-6 border border-titan-gold/20 relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Star size={12} className="text-titan-gold fill-current" />
            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.2em]">Titan Academy</span>
          </div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter mb-1">FORMAÇÃO SMC</h2>
          <p className="text-[10px] text-titan-muted uppercase font-bold tracking-widest">Seu caminho para a elite</p>
        </div>
        <ProgressRing progress={progress} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-titan-gold/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {ACADEMY_DATA.map((module, mIdx) => (
          <div key={module.id} className="space-y-3">
             <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-titan-dark border border-white/5 flex items-center justify-center font-black text-titan-gold text-xs">
                    0{mIdx + 1}
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{module.title}</h3>
                    <p className="text-[9px] text-titan-muted uppercase tracking-tighter">{module.description}</p>
                </div>
             </div>
             
             <div className="bg-titan-card/30 border border-white/5 rounded-2xl overflow-hidden">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${lesson.completed ? 'bg-titan-green/10 text-titan-green' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold'}`}>
                            {lesson.completed ? <CheckCircle2 size={16} /> : <MonitorPlay size={16} />}
                        </div>
                        <div className="text-left">
                            <p className={`text-xs font-bold ${lesson.completed ? 'text-white/60' : 'text-white'}`}>{lesson.title}</p>
                            <span className="text-[9px] text-titan-muted uppercase font-medium">{lesson.duration}</span>
                        </div>
                    </div>
                    <ChevronRight size={14} className="text-titan-muted group-hover:text-titan-gold transition-colors" />
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3">
          <Lock size={18} className="text-blue-400 shrink-0" />
          <p className="text-[9px] text-blue-200/70 italic leading-relaxed">
            Mais módulos são desbloqueados automaticamente à medida que você progride na sua jornada como Trader Institucional.
          </p>
      </div>
    </div>
  );
};

export default Academy;
