
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
  Youtube
} from 'lucide-react';

interface AcademyProps {
    language: string;
}

const Academy: React.FC<AcademyProps> = ({ language }) => {
  const t = translations[language] || translations['pt'];
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Motor de extração de ID do YouTube robusto
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split(/[&?#]/)[0];
    } else {
      videoId = url.split('/').pop() || '';
    }
    
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
  };

  const ACADEMY_DATA: CourseModule[] = [
    {
      id: 'm1',
      title: language === 'pt' ? 'Arquitetura Algorítmica (IPDA)' : language === 'en' ? 'Algorithmic Architecture (IPDA)' : 'Arquitectura Algorítmica (IPDA)',
      description: language === 'pt' ? 'O código por trás do preço.' : language === 'en' ? 'The code behind the price.' : 'El código detrás del precio.',
      lessons: [
        { 
          id: 'l1', 
          title: 'Liquidez vs Volume', 
          duration: '12:45', 
          videoUrl: 'https://youtu.be/HPTU-4t6CtM',
          explanation: language === 'pt' ? 'Entenda como o algoritmo interbancário busca pools de liquidez para injetar volume.' : language === 'en' ? 'Understand how the interbank algorithm seeks liquidity pools to inject volume.' : 'Comprenda cómo el algoritmo interbancario busca pools de liquidez para inyectar volumen.',
          completed: true 
        },
        { 
          id: 'l2', 
          title: 'Paciência Seletiva', 
          duration: '10:15', 
          videoUrl: 'https://youtu.be/xlvhZi6AdXE',
          explanation: language === 'pt' ? 'A virtude mais cara do trader: saber quando o mercado não oferece vantagem matemática.' : language === 'en' ? 'The trader\'s most expensive virtue: knowing when the market offers no mathematical advantage.' : 'A virtude mais cara do trader: saber quando o mercado não oferece vantagem matemática.',
          completed: false 
        },
        { 
          id: 'l3', 
          title: 'Order Blocks', 
          duration: '15:30', 
          videoUrl: 'https://youtu.be/WoeGeeIox1I',
          explanation: language === 'pt' ? 'Identificação precisa de zonas de oferta e demanda institucional.' : language === 'en' ? 'Precise identification of institutional supply and demand zones.' : 'Identificación precisa de zonas de oferta y demanda institucional.',
          completed: false 
        }
      ]
    },
    {
      id: 'm2',
      title: language === 'pt' ? 'Estrutura de Mercado Elite' : language === 'en' ? 'Elite Market Structure' : 'Estructura de Mercado Elite',
      description: language === 'pt' ? 'Mapeamento de tendência institucional.' : language === 'en' ? 'Institutional trend mapping.' : 'Mapeo de tendencias institucionales.',
      lessons: [
        { 
          id: 'l4', 
          title: 'Tendência Institucional', 
          duration: '14:20', 
          videoUrl: 'https://youtu.be/TjYKCLZ4UxA', 
          explanation: language === 'pt' ? 'Aprenda a ler o fluxo de ordens real, ignorando o ruído do varejo.' : language === 'en' ? 'Learn to read real order flow, ignoring retail noise.' : 'Aprenda a leer el flujo de órdenes real, ignorando el ruido minorista.',
          completed: false 
        },
        { 
          id: 'l5', 
          title: 'Bos & Choch', 
          duration: '11:45', 
          videoUrl: 'https://youtu.be/VOdVaCjUX7A', 
          explanation: language === 'pt' ? 'A assinatura da reversão e continuidade de tendência profissional.' : language === 'en' ? 'The signature of professional trend reversal and continuity.' : 'La firma de la reversión y continuidad de tendencia profesional.',
          completed: false 
        },
        { 
          id: 'l6', 
          title: 'Mapeamento de Range', 
          duration: '13:10', 
          videoUrl: 'https://youtu.be/x-sTpp-BAbE', 
          explanation: language === 'pt' ? 'Definindo o campo de batalha: Premium vs Discount.' : language === 'en' ? 'Defining the battlefield: Premium vs Discount.' : 'Definiendo el campo de batalla: Premium vs Discount.',
          completed: false 
        }
      ]
    },
    {
      id: 'm3',
      title: language === 'pt' ? 'Liquidez & Armadilhas' : language === 'en' ? 'Liquidity & Traps' : 'Liquidez y Trampas',
      description: language === 'pt' ? 'Onde o varejo perde e o Titan ganha.' : language === 'en' ? 'Where retail loses and Titan wins.' : 'Donde el minorista pierde y Titan gana.',
      lessons: [
        { 
          id: 'l7', 
          title: 'Liquidez vs Armadilhas', 
          duration: '16:40', 
          videoUrl: 'https://youtu.be/Hl2JFNRV_ps', 
          explanation: language === 'pt' ? 'O mercado não se move por notícias, move-se por liquidez pendente.' : language === 'en' ? 'The market doesn\'t move by news, it moves by pending liquidity.' : 'El mercado no se mueve por noticias, se mueve por liquidez pendiente.',
          completed: false 
        },
        { 
          id: 'l8', 
          title: 'Indução (Inducement)', 
          duration: '12:20', 
          videoUrl: 'https://youtu.be/-hpD_kqc0fw', 
          explanation: language === 'pt' ? 'Como as instituições enganam traders precoces para criar combustível de preço.' : language === 'en' ? 'How institutions trick early traders to create price fuel.' : 'Cómo las instituciones engañan a los traders prematuros para crear combustible de precios.',
          completed: false 
        },
        { 
          id: 'l9', 
          title: 'Fair Value Gap', 
          duration: '09:55', 
          videoUrl: 'https://youtu.be/Jx1jVx_tpTQ', 
          explanation: language === 'pt' ? 'Identificando ineficiências que o preço é obrigado a mitigar.' : language === 'en' ? 'Identifying inefficiencies that the price is forced to mitigate.' : 'Identificar ineficiencias que el precio se ve obligado a mitigar.',
          completed: false 
        }
      ]
    },
    {
      id: 'm4',
      title: language === 'pt' ? 'Gestão de Risco NASA' : language === 'en' ? 'NASA Risk Management' : 'Gestión de Riesgo NASA',
      description: language === 'pt' ? 'Matemática e Psicologia de Alta Performance.' : language === 'en' ? 'High Performance Math and Psychology.' : 'Matemáticas y Psicología de Alto Rendimiento.',
      lessons: [
        { 
          id: 'l10', 
          title: 'Gestão de Risco NASA', 
          duration: '20:15', 
          videoUrl: 'https://youtu.be/pcpdNcCQuPk', 
          explanation: language === 'pt' ? 'Protocolos de sobrevivência e escala para contas de seis dígitos.' : language === 'en' ? 'Survival and scaling protocols for six-figure accounts.' : 'Protocolos de supervivencia y escala para cuentas de seis cifras.',
          completed: false 
        },
        { 
          id: 'l11', 
          title: 'Risco Retorno', 
          duration: '08:45', 
          videoUrl: 'https://youtu.be/cX0AeF-uMeI', 
          explanation: language === 'pt' ? 'A matemática sagrada do trading: Por que a taxa de acerto é secundária.' : language === 'en' ? 'The sacred math of trading: Why win rate is secondary.' : 'La matemática sagrada del trading: Por qué el win rate es secundario.',
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
            <span className="text-[8px] text-titan-gold font-black uppercase tracking-[0.3em]">Titan Academy Stream</span>
            <h2 className="text-sm font-bold text-white tracking-tight">{selectedLesson.title}</h2>
          </div>
        </div>
        
        {/* Titan Cinema Engine - 16:9 YouTube Embed - Fixed Logic */}
        <div className="w-full aspect-video bg-black relative shadow-2xl border-b border-titan-gold/10 overflow-hidden">
           {selectedLesson.videoUrl ? (
             <iframe 
               src={getEmbedUrl(selectedLesson.videoUrl)}
               title={selectedLesson.title}
               className="w-full h-full border-0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-titan-muted/20">
                <Youtube size={64} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Feed Offline</span>
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
            <div className="flex items-center gap-2 text-titan-muted text-[10px] font-black uppercase tracking-widest py-2">
               <Clock size={12} /> {selectedLesson.duration}
            </div>
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
