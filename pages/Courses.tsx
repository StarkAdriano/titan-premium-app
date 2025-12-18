
import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import { translations } from '../i18n';
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

interface AcademyProps {
    language: string;
}

const Academy: React.FC<AcademyProps> = ({ language }) => {
  const t = translations[language] || translations['en'];
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isFullMap, setIsFullMap] = useState(false);

  const ACADEMY_DATA: CourseModule[] = [
    {
      id: 'm1',
      title: 'Arquitetura IPDA & SMC',
      description: t.smc_briefing,
      lessons: [
        { id: 'l1', title: 'O Código do IPDA', duration: 'Masterclass', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=1200', completed: true },
        { id: 'l2', title: 'Liquidez vs Volume', duration: 'Deep Dive', imageUrl: 'https://images.unsplash.com/photo-1611974714024-4607a50d487f?auto=format&fit=crop&q=80&w=1200', completed: true }
      ]
    },
    {
      id: 'm2',
      title: 'Estrutura de Mercado Elite',
      description: t.certified_grade,
      lessons: [
        { id: 'l3', title: 'Mapeamento de Range', duration: 'Advanced', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', completed: false },
        { id: 'l4', title: 'CHoCH: A Virada de Fluxo', duration: 'SMC Core', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200', completed: false }
      ]
    }
  ];
  
  const totalLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const progress = (completedLessons / totalLessons) * 100;

  if (selectedLesson) {
    return (
      <div className="flex flex-col min-h-full bg-titan-darker animate-in slide-in-from-right-4">
        {isFullMap && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in">
             <button onClick={() => setIsFullMap(false)} className="absolute top-10 right-10 z-[210] p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
                <X size={28} />
             </button>
             <img src={selectedLesson.imageUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Full Resolution" />
          </div>
        )}

        <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-titan-dark">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted hover:text-white transition-colors bg-white/5 rounded-full">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Alpha Intelligence</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        <div className="aspect-video bg-black relative overflow-hidden border-b border-titan-gold/10">
          <img className="w-full h-full object-cover opacity-90" src={selectedLesson.imageUrl} alt={selectedLesson.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-titan-darker via-transparent to-transparent"></div>
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="bg-black/60 backdrop-blur-lg border border-titan-gold/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Cpu size={12} className="text-titan-gold" />
                  <span className="text-[8px] text-titan-gold font-black tracking-widest uppercase">SCANNING_DATA</span>
               </div>
               <button onClick={() => setIsFullMap(true)} className="pointer-events-auto bg-titan-gold/10 p-3 rounded-xl border border-titan-gold/30 hover:bg-titan-gold/20 transition-all">
                  <Maximize2 size={16} className="text-titan-gold" />
               </button>
            </div>
            <div className="flex justify-between items-end text-[7px] text-white/50 font-mono">
               <p>SOURCE: INSTITUTIONAL_BRAIN<br/>QUALITY: 4K_UHD</p>
               <BarChart3 size={24} className="text-titan-gold opacity-30" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-titan-gold" />
                <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">{t.certified_grade}</span>
              </div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedLesson.title}</h1>
            </div>
          </div>

          <div className="bg-titan-card/30 rounded-3xl p-8 border border-white/5 space-y-6 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-titan-gold" /> {t.smc_briefing}
            </h3>
            <p className="text-[13px] text-titan-muted leading-relaxed font-medium">
                {t.academy_desc}
            </p>
            <button onClick={() => setIsFullMap(true)} className="w-full flex items-center justify-center gap-3 p-6 bg-titan-gold text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 shadow-2xl hover:bg-titan-goldLight transition-all">
              <ImageIcon size={20} /> {t.full_resolution}
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
            <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.4em]">{t.knowledge_center}</span>
          </div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 leading-none uppercase">{t.elite_education}</h2>
        </div>
        <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150.8} strokeDashoffset={150.8 - (progress / 100) * 150.8} className="text-titan-gold transition-all duration-1000 ease-out" />
            </svg>
            <span className="absolute text-[10px] font-black text-titan-gold">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-12">
        {ACADEMY_DATA.map((module, mIdx) => (
          <div key={module.id} className="space-y-4">
             <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-[1rem] bg-titan-dark border border-white/5 flex items-center justify-center font-black text-titan-gold text-xl shadow-xl">{mIdx + 1}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{module.title}</h3>
                    <p className="text-[11px] text-titan-muted uppercase tracking-tighter font-medium">{module.description}</p>
                </div>
             </div>
             <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {module.lessons.map((lesson) => (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="w-full flex items-center justify-between p-8 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.5rem] transition-all ${lesson.completed ? 'bg-titan-green/10 text-titan-green shadow-inner' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold shadow-lg'}`}>
                            {lesson.completed ? <CheckCircle2 size={24} /> : <ImageIcon size={24} />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-titan-gold transition-colors">{lesson.title}</p>
                            <span className="text-[10px] text-titan-muted uppercase font-bold tracking-widest">{lesson.duration}</span>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-titan-muted group-hover:text-titan-gold transition-all" />
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
