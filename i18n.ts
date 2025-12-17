
import { Language } from './types';

export const translations: Record<Language, any> = {
  pt: {
    terminal: 'Terminal', academy: 'Academy', access: 'Acesso', network: 'Network',
    buy: 'COMPRA', sell: 'VENDA', wait: 'AGUARDAR', connect: 'CONECTAR BRIDGE',
    analysis: 'ANALISAR', institutional_rationale: 'Racional Institucional',
    trade_plan: 'Plano de Trade', execute_order: 'Executar Ordem',
    language: 'Idioma', settings: 'Configurações', sync_active: 'SINC. REAL-TIME',
    run_analysis: 'EXECUTAR ANÁLISE', clear_memory: 'LIMPAR MEMÓRIA',
    lots: 'LOTES', authorization: 'AUTORIZAR SINAL'
  },
  en: {
    terminal: 'Terminal', academy: 'Academy', access: 'Access', network: 'Network',
    buy: 'BUY', sell: 'SELL', wait: 'WAIT', connect: 'CONNECT BRIDGE',
    analysis: 'ANALYZE', institutional_rationale: 'Institutional Rationale',
    trade_plan: 'Trade Plan', execute_order: 'Execute Order',
    language: 'Language', settings: 'Settings', sync_active: 'REAL-TIME SYNC',
    run_analysis: 'RUN ANALYSIS', clear_memory: 'CLEAR MEMORY',
    lots: 'LOTS', authorization: 'AUTHORIZE SIGNAL'
  },
  es: {
    terminal: 'Terminal', academy: 'Academia', access: 'Acceso', network: 'Red',
    buy: 'COMPRA', sell: 'VENTA', wait: 'ESPERAR', connect: 'CONECTAR BRIDGE',
    analysis: 'ANALIZAR', institutional_rationale: 'Racional Institucional',
    trade_plan: 'Plan de Trade', execute_order: 'Ejecutar Orden',
    language: 'Idioma', settings: 'Ajustes', sync_active: 'SINC. EN VIVO',
    run_analysis: 'EJECUTAR ANÁLISIS', clear_memory: 'LIMPIAR MEMORIA',
    lots: 'LOTES', authorization: 'AUTORIZAR SEÑAL'
  },
  it: {
    terminal: 'Terminale', academy: 'Accademia', access: 'Accesso', network: 'Rete',
    buy: 'COMPRA', sell: 'VENDITA', wait: 'ATTENDERE', connect: 'CONNETTI BRIDGE',
    analysis: 'ANALIZZARE', institutional_rationale: 'Razionale Istituzionale',
    trade_plan: 'Piano di Trade', execute_order: 'Esegui Ordine',
    language: 'Lingua', settings: 'Impostazioni', sync_active: 'SINC. REAL-TIME',
    run_analysis: 'ESEGUI ANALISI', clear_memory: 'PULISCI MEMORIA',
    lots: 'LOTTI', authorization: 'AUTORIZZA SEGNALE'
  },
  ja: {
    terminal: 'ターミナル', academy: 'アカデミー', access: 'アクセス', network: 'ネットワーク',
    buy: '購入', sell: '売却', wait: '待機', connect: 'ブリッジ接続',
    analysis: '分析する', institutional_rationale: '機関投資家の論理',
    trade_plan: 'トレードプラン', execute_order: '注文を実行',
    language: '言語', settings: '設定', sync_active: 'リアルタイム同期',
    run_analysis: '分析を実行', clear_memory: 'メモリをクリア',
    lots: 'ロット', authorization: 'シグナルを承認'
  },
  zh: {
    terminal: '终端', academy: '学院', access: '访问', network: '网络',
    buy: '买入', sell: '卖出', wait: '等待', connect: '连接网桥',
    analysis: '分析', institutional_rationale: '机构基本面',
    trade_plan: '交易计划', execute_order: '执行订单',
    language: '语言', settings: '设置', sync_active: '实时同步',
    run_analysis: '执行分析', clear_memory: '清除记忆',
    lots: '手数', authorization: '授权信号'
  },
  he: {
    terminal: 'מסוף', academy: 'אקדמיה', access: 'גישה', network: 'רשת',
    buy: 'קנייה', sell: 'מכירה', wait: 'המתן', connect: 'חבר גשר',
    analysis: 'נתח', institutional_rationale: 'רציונל מוסדי',
    trade_plan: 'תוכנית מסחר', execute_order: 'בצע פקודה',
    language: 'שפה', settings: 'הגדרות', sync_active: 'סנכרון בזמן אמת',
    run_analysis: 'הפעל ניתוח', clear_memory: 'נקה זיכרון',
    lots: 'לוטים', authorization: 'אשר אות'
  },
  ru: {
    terminal: 'Терминал', academy: 'Академия', access: 'Доступ', network: 'Сеть',
    buy: 'КУПИТЬ', sell: 'ПРОДАТЬ', wait: 'ЖДАТЬ', connect: 'ПОДКЛЮЧИТЬ МОСТ',
    analysis: 'АНАЛИЗ', institutional_rationale: 'Институциональная логика',
    trade_plan: 'Торговый план', execute_order: 'Выполнить ордер',
    language: 'Язык', settings: 'Настройки', sync_active: 'СИНХР. РЕАЛЬНОГО ВРЕМЕНИ',
    run_analysis: 'ЗАПУСТИТЬ АНАЛИЗ', clear_memory: 'ОЧИСТИТЬ ПАМЯТЬ',
    lots: 'ЛОТЫ', authorization: 'АВТОРИЗОВАТЬ СИГНАЛ'
  }
};

export const languages = [
  { code: 'pt', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];
