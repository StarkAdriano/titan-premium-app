
import { Asset, SignalStatus, CourseProduct } from './types';

// Mock Data for Assets - ONLY EURUSD
export const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    price: '1.08450', 
    status: SignalStatus.WAIT,
    shortSummary: 'Aguardando input do trader para análise.',
    detailedAnalysis: 'Insira o preço atual da sua corretora para processar a análise institucional.',
    isFavorite: true,
    lastUpdated: 'Agora',
    history: [
      { id: 'h1', date: '---', status: SignalStatus.WAIT, summary: 'Sessão Anterior: Mercado em acumulação aguardando liquidez (Range).' },
      { id: 'h2', date: '---', status: SignalStatus.SELL, summary: 'Rejeição confirmada em bloco de ordens H4 (Premium Zone).' },
      { id: 'h3', date: '---', status: SignalStatus.BUY, summary: 'Captura de liquidez (Stop Hunt) seguida de BOS.' },
    ]
  }
];

// Product List
export const PRODUCTS: CourseProduct[] = [
  {
    id: 'prod_app',
    name: 'Assinatura Titan App PRO',
    description: 'Acesso profissional ao app, com setups atualizados, histórico e conteúdos exclusivos Titan.',
    priceDisplay: 'R$ 99,90/mês',
    stripeLink: 'https://buy.stripe.com/dRmcN42Yf2MW3BH0uzcwg03',
    tag: 'Recomendado',
    priority: 4
  },
  {
    id: 'prod_trader',
    name: 'Formação Trader Especialista',
    description: 'Formação completa na metodologia Titan Premium para operar como profissional.',
    stripeLink: 'https://buy.stripe.com/7sYfZg9mD0EO2xD3GLcwg02',
    tag: 'Curso Online',
    priority: 3,
    priceDisplay: 'R$ 5.000,00'
  },
  {
    id: 'prod_mastermind',
    name: 'Imersão Mastermind Presencial – 3 Dias',
    description: 'Experiência presencial intensiva de 3 dias, com foco em estratégia, mente e execução.',
    stripeLink: 'https://buy.stripe.com/cNi3cu9mDbjs2xD4KPcwg01',
    tag: 'Presencial',
    priority: 2,
    priceDisplay: 'R$ 25.000,00'
  },
  {
    id: 'prod_alpha',
    name: 'Conselho Alpha – Mentoria Private Equity',
    description: 'Mentoria de alto nível voltada a Private Equity, estratégia e visão de negócio.',
    stripeLink: 'https://buy.stripe.com/00w5kC9mD87gb49a59cwg00',
    tag: 'Mentoria High-Ticket',
    priority: 1,
    priceDisplay: 'R$ 100.000,00'
  }
];

export const PIX_KEY = 'ea9f68ed-2b08-4fe0-a420-a551971ba8be';
export const CONTACT_EMAIL = 'adrianovettorel@yahoo.com';
export const CONTACT_WHATSAPP = '+55 17 99266-6579';
export const CONTACT_WHATSAPP_LINK = 'https://wa.me/5517992666579';
export const INSTAGRAM_LINK = 'https://www.instagram.com/aerovisao.ia/';
export const INSTAGRAM_HANDLE = '@aerovisao.ia';

/* 
  === ESTOQUE DE CÓDIGOS TITAN ===
  Instruções para o CEO:
  1. Quando o cliente pagar, escolha um código abaixo que ainda não foi usado.
  2. Envie o código pelo WhatsApp.
  3. Marque na sua planilha pessoal que este código já foi vendido.
  
  Formatos:
  - 30 dias (Mensal)
  - 90 dias (Trimestral)
  - 365 dias (Anual)
*/

export const ACTIVATION_CODES: Record<string, number> = {
    // --- LOTE A (JANEIRO/FEVEREIRO) ---
    'TITAN-START-01': 30, 'TITAN-START-02': 30, 'TITAN-START-03': 30, 'TITAN-START-04': 30,
    'TITAN-START-05': 30, 'TITAN-START-06': 30, 'TITAN-START-07': 30, 'TITAN-START-08': 30,
    'TITAN-START-09': 30, 'TITAN-START-10': 30,

    // --- LOTE B (PRO MENSAL - ESTOQUE GRANDE) ---
    'PRO-KEY-101': 30, 'PRO-KEY-102': 30, 'PRO-KEY-103': 30, 'PRO-KEY-104': 30, 'PRO-KEY-105': 30,
    'PRO-KEY-106': 30, 'PRO-KEY-107': 30, 'PRO-KEY-108': 30, 'PRO-KEY-109': 30, 'PRO-KEY-110': 30,
    'PRO-KEY-111': 30, 'PRO-KEY-112': 30, 'PRO-KEY-113': 30, 'PRO-KEY-114': 30, 'PRO-KEY-115': 30,
    'PRO-KEY-116': 30, 'PRO-KEY-117': 30, 'PRO-KEY-118': 30, 'PRO-KEY-119': 30, 'PRO-KEY-120': 30,
    'PRO-KEY-121': 30, 'PRO-KEY-122': 30, 'PRO-KEY-123': 30, 'PRO-KEY-124': 30, 'PRO-KEY-125': 30,
    
    // --- LOTE C (TRIMESTRAL - R$ 250,00) ---
    'TITAN-3M-A1': 90, 'TITAN-3M-A2': 90, 'TITAN-3M-A3': 90, 'TITAN-3M-A4': 90, 'TITAN-3M-A5': 90,

    // --- LOTE D (ANUAL - VIP) ---
    'VIP-YEAR-01': 365, 'VIP-YEAR-02': 365, 'VIP-YEAR-03': 365,

    // --- CÓDIGOS ESPECIAIS / BACKDOOR ---
    'TITAN-MASTER-RENEW': 30,  // Uso de emergência se algum cliente travar
    'TITAN-LIFETIME': 36500    // Acesso Vitalício (R$ 997,00 ou mais)
};