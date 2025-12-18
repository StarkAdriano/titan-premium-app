
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
  PlayCircle,
  FileText,
  Clock,
  Info
} from 'lucide-react';

interface AcademyProps {
    language: string;
}

const Academy: React.FC<AcademyProps> = ({ language }) => {
  const t = translations[language] || translations['pt'];
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Aqui você poderá inserir os links dos seus vídeos MP4 ou YouTube/Vimeo
  const ACADEMY_DATA: CourseModule[] = [
    {
      id: 'm1',
      title: 'IPDA & SMC Architecture',
      description: 'The algorithmic core of EURUSD.',
      lessons: [
        { 
          id: 'l1', 
          title: 'Liquidez vs Volume', 
          duration: '12:45', 
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Substitua pelo seu link
          explanation: language === 'pt' ? 'Nesta aula, desvendamos como o algoritmo identifica pools de liquidez antes de grandes expansões.' : language === 'en' ? 'In this lesson, we reveal how the algorithm identifies liquidity pools before major expansions.' : 'En esta lección, revelamos cómo el algoritmo identifica los pools de liquidez antes de las grandes expansiones.',
          completed: true 
        },
        { 
          id: 'l2', 
          title: 'Paciência Seletiva', 
          duration: '08:20', 
          videoUrl: 'https://www.w3schools.com/html/movie.mp4', // Substitua pelo seu link
          explanation: language === 'pt' ? 'A psicologia por trás de aguardar o setup perfeito no Timeframe institucional.' : language === 'en' ? 'The psychology behind waiting for the perfect setup in the institutional timeframe.' : 'La psicología detrás de esperar el setup perfecto en el timeframe institucional.',
          completed: false 
        }
      ]
    }
  ];
  
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
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Academy Player</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        {/* Professional 16:9 Video Player */}
        <div className="w-full aspect-video bg-black relative shadow-2xl border-b border-titan-gold/10">
           <video 
             src={selectedLesson.videoUrl} 
             controls 
             className="w-full h-full object-contain"
             poster="https://images.unsplash.com/photo-1611974714024-4607a50d487f?auto=format&fit=crop&q=80&w=1200"
           >
             {t.video_loading}
           </video>
        </div>

        <div className="p-8 space-y-8 pb-32">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-titan-gold" />
              <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">SMC Institutional Intel</span>
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedLesson.title}</h1>
          </div>

          <div className="bg-titan-card/30 rounded-3xl p-8 border border-white/5 space-y-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-titan-gold" /> {t.lesson_explanation_title}
            </h3>
            <p className="text-[13px] text-titan-muted leading-relaxed font-medium">
                {selectedLesson.explanation}
            </p>
          </div>

          <div className="flex items-center gap-4 text-titan-muted text-[10px] font-black uppercase tracking-widest px-2">
             <div className="flex items-center gap-2"><Clock size={14} /> {selectedLesson.duration}</div>
             <div className="flex items-center gap-2"><FileText size={14} /> PDF Attached</div>
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
                            {lesson.completed ? <CheckCircle2 size={24} /> : <PlayCircle size={24} />}
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
