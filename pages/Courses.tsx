
import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import { translations } from '../i18n';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Star,
  ShieldCheck,
  PlayCircle,
  Clock,
  Info,
  Layers,
  Target,
  BarChart,
  ShieldAlert,
  Youtube,
  ExternalLink,
  Zap
} from 'lucide-react';

interface AcademyProps {
    language: string;
}

const Academy: React.FC<AcademyProps> = ({ language }) => {
  const t = translations[language] || translations['pt'];
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const getVideoId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const ACADEMY_DATA: CourseModule[] = [
    {
      id: 'm1',
      title: 'Arquitetura Algorítmica (IPDA)',
      description: 'O código por trás do preço.',
      lessons: [
        { 
          id: 'l1', 
          title: 'Liquidez vs Volume', 
          duration: '12:45', 
          videoUrl: 'https://youtu.be/HPTU-4t6CtM',
          explanation: 'Diferença técnica entre pools de liquidez e volume de negociação.',
          completed: true 
        },
        { 
          id: 'l2', 
          title: 'Paciência Seletiva', 
          duration: '10:15', 
          videoUrl: 'https://youtu.be/xlvhZi6AdXE',
          explanation: 'A virtude de esperar o setup de alta probabilidade ignorando o ruído.',
          completed: false 
        },
        { 
          id: 'l3', 
          title: 'Order Blocks', 
          duration: '15:30', 
          videoUrl: 'https://youtu.be/WoeGeeIox1I',
          explanation: 'Identificando onde as grandes instituições deixam suas ordens pendentes.',
          completed: false 
        }
      ]
    },
    {
      id: 'm2',
      title: 'Estrutura de Mercado Elite',
      description: 'Mapeamento de tendência institucional.',
      lessons: [
        { 
          id: 'l4', 
          title: 'Tendência Institucional', 
          duration: '14:20', 
          videoUrl: 'https://youtu.be/TjYKCLZ4UxA', 
          explanation: 'Como ler a direção real do mercado através do fluxo de ordens.',
          completed: false 
        },
        { 
          id: 'l5', 
          title: 'Bos & Choch', 
          duration: '11:45', 
          videoUrl: 'https://youtu.be/VOdVaCjUX7A', 
          explanation: 'Quebra de estrutura e mudança de caráter para entradas precisas.',
          completed: false 
        },
        { 
          id: 'l6', 
          title: 'Mapeamento de Range', 
          duration: '13:10', 
          videoUrl: 'https://youtu.be/x-sTpp-BAbE', 
          explanation: 'Definição de zonas operacionais dentro de uma perna de tendência.',
          completed: false 
        }
      ]
    },
    {
      id: 'm3',
      title: 'Liquidez & Armadilhas',
      description: 'Onde o varejo perde e o Titan ganha.',
      lessons: [
        { 
          id: 'l7', 
          title: 'Liquidez vs Armadilhas', 
          duration: '16:40', 
          videoUrl: 'https://youtu.be/Hl2JFNRV_ps', 
          explanation: 'Entenda como o mercado caça stop loss para ganhar combustível.',
          completed: false 
        },
        { 
          id: 'l8', 
          title: 'Indução (Inducement)', 
          duration: '12:20', 
          videoUrl: 'https://youtu.be/-hpD_kqc0fw', 
          explanation: 'O movimento falso que convence o varejo a entrar na direção errada.',
          completed: false 
        },
        { 
          id: 'l9', 
          title: 'Fair Value Gap', 
          duration: '09:55', 
          videoUrl: 'https://youtu.be/Jx1jVx_tpTQ', 
          explanation: 'Identificação de ineficiências no preço (Gaps) que precisam ser preenchidos.',
          completed: false 
        }
      ]
    },
    {
      id: 'm4',
      title: 'Gestão de Risco NASA',
      description: 'Matemática e Psicologia de Alta Performance.',
      lessons: [
        { 
          id: 'l10', 
          title: 'Gestão de Risco NASA', 
          duration: '20:15', 
          videoUrl: 'https://youtu.be/pcpdNcCQuPk', 
          explanation: 'Proteção de capital em nível profissional para contas de grande escala.',
          completed: false 
        },
        { 
          id: 'l11', 
          title: 'Risco Retorno', 
          duration: '08:45', 
          videoUrl: 'https://youtu.be/cX0AeF-uMeI', 
          explanation: 'A matemática por trás do lucro a longo prazo usando a assimetria.',
          completed: false 
        }
      ]
    }
  ];
  
  const totalLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = ACADEMY_DATA.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const progress = (completedLessons / totalLessons) * 100;

  if (selectedLesson) {
    const videoId = getVideoId(selectedLesson.videoUrl);
    // Usando HQ Default para garantir que carregue em qualquer rede
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <div className="flex flex-col min-h-full bg-titan-darker animate-in slide-in-from-right-4">
        <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-titan-dark">
          <button onClick={() => setSelectedLesson(null)} className="p-2 text-titan-muted hover:text-white transition-colors bg-white/5 rounded-full">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Cinema Pro</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        <div className="relative w-full aspect-video bg-black shadow-2xl border-b border-titan-gold/10 overflow-hidden group">
           <a href={selectedLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
              <img 
                src={thumbUrl} 
                alt="Video Thumbnail" 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-titan-gold rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)] group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle size={40} className="text-black ml-1" />
                  </div>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-black/90 backdrop-blur-md text-[10px] text-white px-3 py-1 rounded-full border border-white/10 font-black uppercase tracking-widest shadow-xl">
                    {selectedLesson.duration}
                  </span>
              </div>
           </a>
        </div>

        <div className="p-6 space-y-6 pb-32">
          <a 
            href={selectedLesson.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-5 bg-titan-gold text-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)] font-black text-xs uppercase tracking-[0.3em]"
          >
            <Youtube size={20} />
            {t.open_youtube}
            <ExternalLink size={14} />
          </a>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-titan-gold" />
              <span className="text-[10px] text-titan-gold font-black uppercase tracking-[0.3em]">Institutional SMC Intel</span>
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
                <div className="w-12 h-12 rounded-[1rem] bg-titan-dark border border-white/5 flex items-center justify-center font-black text-titan-gold text-xl shadow-xl">
                  {mIdx === 0 && <Layers size={20} />}
                  {mIdx === 1 && <BarChart size={20} />}
                  {mIdx === 2 && <Target size={20} />}
                  {mIdx === 3 && <ShieldAlert size={20} />}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{module.title}</h3>
                    <p className="text-[11px] text-titan-muted uppercase tracking-tighter font-medium">{module.description}</p>
                </div>
             </div>
             <div className="bg-titan-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {module.lessons.map((lesson) => (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="w-full flex items-center justify-between p-8 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group text-left">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-[1.5rem] transition-all ${lesson.completed ? 'bg-titan-green/10 text-titan-green shadow-inner' : 'bg-black/40 text-titan-muted group-hover:text-titan-gold shadow-lg'}`}>
                            {lesson.completed ? <CheckCircle2 size={24} /> : <PlayCircle size={24} />}
                        </div>
                        <div>
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
