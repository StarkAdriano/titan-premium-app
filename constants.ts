
import { Asset, SignalStatus, CourseProduct } from './types';

// VERSÃO DO APP - Garante a sincronia final ao subir para produção/mauns.ai
export const APP_VERSION = '3.3.7'; 

export const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    price: '1.05450', 
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
  }
];

export const PIX_KEY = 'ea9f68ed-2b08-4fe0-a420-a551971ba8be';
export const CONTACT_EMAIL = 'adrianovettorel@yahoo.com';
export const CONTACT_WHATSAPP = '+55 17 99266-6579';
export const CONTACT_WHATSAPP_LINK = 'https://wa.me/5517992666579';
export const INSTAGRAM_LINK = 'https://www.instagram.com/aerovisao.ia/';
export const INSTAGRAM_HANDLE = '@aerovisao.ia';

export const ACTIVATION_CODES: Record<string, number> = {
    'TITAN-START-01': 30, 'TITAN-START-02': 30, 'PRO-KEY-101': 30,
    'TITAN-3M-A1': 90, 'VIP-YEAR-01': 365, 'TITAN-LIFETIME': 36500
};
