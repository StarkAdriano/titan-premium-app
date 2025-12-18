
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
  Info,
  Layers,
  Target,
  BarChart,
  ShieldAlert
} from 'lucide-react';

interface AcademyProps {
    language: string;
}

const Academy: React.FC<AcademyProps> = ({ language }) => {
  const t = translations[language] || translations['pt'];
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // GRADE CURRICULAR RESTAURADA - PRONTA PARA SEUS VÍDEOS 16x9
  const ACADEMY_DATA: CourseModule[] = [
    {
      id: 'm1',
      title: language === 'pt' ? 'Arquitetura Algorítmica (IPDA)' : language === 'en' ? 'Algorithmic Architecture (IPDA)' : 'Arquitectura Algorítmica (IPDA)',
      description: 'O código por trás do preço.',
      lessons: [
        { 
          id: 'l1', 
          title: 'Liquidez vs Volume', 
          duration: '12:45', 
          videoUrl: '', // Insira seu link aqui
          explanation: language === 'pt' ? 'Como as instituições movem o mercado através de pools de liquidez.' : language === 'en' ? 'How institutions move the market through liquidity pools.' : 'Cómo las instituciones mueven el mercado a través de pools de liquidez.',
          completed: true 
        },
        { 
          id: 'l2', 
          title: 'Order Blocks Reais', 
          duration: '15:10', 
          videoUrl: '', // Insira seu link aqui
          explanation: language === 'pt' ? 'Identificando as pegadas exatas dos grandes bancos no gráfico.' : language === 'en' ? 'Identifying the exact footprints of big banks on the chart.' : 'Identificando las huellas exactas de los grandes bancos en el gráfico.',
          completed: false 
        }
      ]
    },
    {
      id: 'm2',
      title: language === 'pt' ? 'Estrutura de Mercado Elite' : language === 'en' ? 'Elite Market Structure' : 'Estructura de Mercado Elite',
      description: 'Mapeamento de tendência institucional.',
      lessons: [
        { 
          id: 'l3', 
          title: 'BOS & CHoCH Profissional', 
          duration: '18:30', 
          videoUrl: '', 
          explanation: language === 'pt' ? 'A diferença entre uma quebra de estrutura real e uma indução de varejo.' : language === 'en' ? 'The difference between a real structure break and retail inducement.' : 'La diferencia entre una ruptura de estructura real e inducción minorista.',
          completed: false 
        },
        { 
          id: 'l4', 
          title: 'Mapeamento de Range', 
          duration: '14:20', 
          videoUrl: '', 
          explanation: language === 'pt' ? 'Definindo as zonas de Premium e Discount para execução de alta probabilidade.' : language === 'en' ? 'Defining Premium and Discount zones for high probability execution.' : 'Definiendo zonas de Premium y Discount para ejecución de alta probabilidad.',
          completed: false 
        }
      ]
    },
    {
      id: 'm3',
      title: language === 'pt' ? 'Liquidez & Armadilhas' : language === 'en' ? 'Liquidity & Traps' : 'Liquidez y Trampas',
      description: 'Onde o varejo perde e o Titan ganha.',
      lessons: [
        { 
          id: 'l5', 
          title: 'Inducement (Indução)', 
          duration: '22:15', 
          videoUrl: '', 
          explanation: language === 'pt' ? 'Aprenda a não ser a liquidez do mercado.' : language === 'en' ? 'Learn how not to be the market liquidity.' : 'Aprende a no ser la liquidez del mercado.',
          completed: false 
        },
        { 
          id: 'l6', 
          title: 'Fair Value Gaps (FVG)', 
          duration: '11:50', 
          videoUrl: '', 
          explanation: language === 'pt' ? 'Utilizando os desequilíbrios de preço como imãs para o take profit.' : language === 'en' ? 'Using price imbalances as magnets for take profit.' : 'Utilizando desequilibrios de precios como imanes para el take profit.',
          completed: false 
        }
      ]
    },
    {
      id: 'm4',
      title: language === 'pt' ? 'Gestão de Risco NASA' : language === 'en' ? 'NASA Risk Management' : 'Gestión de Riesgo NASA',
      description: 'Matemática e Psicologia de Alta Performance.',
      lessons: [
        { 
          id: 'l7', 
          title: 'Risco Retorno 1:3+', 
          duration: '09:40', 
          videoUrl: '', 
          explanation: language === 'pt' ? 'Como manter a conta positiva mesmo errando mais de 50% das vezes.' : language === 'en' ? 'How to keep the account positive even missing more than 50% of the time.' : 'Cómo mantener la cuenta positiva incluso fallando más del 50% de las veces.',
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
        
        {/* Professional 16:9 Video Player Container */}
        <div className="w-full aspect-video bg-black relative shadow-2xl border-b border-titan-gold/10">
           {selectedLesson.videoUrl ? (
             <video 
               src={selectedLesson.videoUrl} 
               controls 
               className="w-full h-full object-contain"
             >
               {t.video_loading}
             </video>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-titan-muted/20">
                <PlayCircle size={64} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Waiting Video Feed (16:9)</span>
             </div>
           )}
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
             <div className="flex items-center gap-2"><FileText size={14} /> Blueprint PDF</div>
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
