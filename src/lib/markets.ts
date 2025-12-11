import { Market } from '@/types';

// All markets we track - major asset classes with top representatives
export const MARKETS: Market[] = [
  // Equities (5)
  {
    id: 'sp500',
    name: 'S&P 500',
    category: 'equities',
    description: 'US Large Cap Stocks',
    color: '#6366F1',
    source: 'YAHOO',
    sourceId: '^GSPC',
  },
  {
    id: 'dow',
    name: 'Dow Jones',
    category: 'equities',
    description: 'US Blue Chip Stocks',
    color: '#4F46E5',
    source: 'YAHOO',
    sourceId: '^DJI',
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq 100',
    category: 'equities',
    description: 'US Tech Stocks',
    color: '#8B5CF6',
    source: 'YAHOO',
    sourceId: '^NDX',
  },
  {
    id: 'russell',
    name: 'Russell 2000',
    category: 'equities',
    description: 'US Small Cap Stocks',
    color: '#A855F7',
    source: 'YAHOO',
    sourceId: '^RUT',
  },
  {
    id: 'intl',
    name: 'Intl Developed',
    category: 'equities',
    description: 'MSCI EAFE (EFA)',
    color: '#7C3AED',
    source: 'YAHOO',
    sourceId: 'EFA',
  },
  {
    id: 'emerging',
    name: 'Emerging Mkts',
    category: 'equities',
    description: 'MSCI Emerging (EEM)',
    color: '#C084FC',
    source: 'YAHOO',
    sourceId: 'EEM',
  },
  {
    id: 'vwo',
    name: 'EM Vanguard',
    category: 'equities',
    description: 'Vanguard FTSE EM (VWO)',
    color: '#E879F9',
    source: 'YAHOO',
    sourceId: 'VWO',
  },

  // Fixed Income (5)
  {
    id: 'treasury_10y',
    name: '7-10Y Treasury',
    category: 'bonds',
    description: 'Treasury Bond ETF (IEF)',
    color: '#06B6D4',
    source: 'YAHOO',
    sourceId: 'IEF',
  },
  {
    id: 'treasury_long',
    name: '20+ Yr Treasury',
    category: 'bonds',
    description: 'Long-Term Treasuries (TLT)',
    color: '#0891B2',
    source: 'YAHOO',
    sourceId: 'TLT',
  },
  {
    id: 'corp_ig',
    name: 'Corp IG Bonds',
    category: 'bonds',
    description: 'Investment Grade (LQD)',
    color: '#0EA5E9',
    source: 'YAHOO',
    sourceId: 'LQD',
  },
  {
    id: 'corp_hy',
    name: 'High Yield',
    category: 'bonds',
    description: 'Junk Bonds (HYG)',
    color: '#38BDF8',
    source: 'YAHOO',
    sourceId: 'HYG',
  },
  {
    id: 'em_bonds',
    name: 'EM Bonds',
    category: 'bonds',
    description: 'Emerging Market Bonds (EMB)',
    color: '#67E8F9',
    source: 'YAHOO',
    sourceId: 'EMB',
  },

  // Commodities (4)
  {
    id: 'gold',
    name: 'Gold',
    category: 'commodities',
    description: 'Gold Futures (GC=F)',
    color: '#F59E0B',
    source: 'YAHOO',
    sourceId: 'GC=F',
  },
  {
    id: 'silver',
    name: 'Silver',
    category: 'commodities',
    description: 'Silver Futures (SI=F)',
    color: '#94A3B8',
    source: 'YAHOO',
    sourceId: 'SI=F',
  },
  {
    id: 'copper',
    name: 'Copper',
    category: 'commodities',
    description: 'Copper Futures (HG=F)',
    color: '#B45309',
    source: 'YAHOO',
    sourceId: 'HG=F',
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    category: 'commodities',
    description: 'WTI Crude (CL=F)',
    color: '#78716C',
    source: 'YAHOO',
    sourceId: 'CL=F',
  },

  // Energy (2)
  {
    id: 'natgas',
    name: 'Natural Gas',
    category: 'energy',
    description: 'Natural Gas Futures (NG=F)',
    color: '#F97316',
    source: 'YAHOO',
    sourceId: 'NG=F',
  },
  {
    id: 'brent',
    name: 'Brent Crude',
    category: 'energy',
    description: 'Brent Oil (BZ=F)',
    color: '#EA580C',
    source: 'YAHOO',
    sourceId: 'BZ=F',
  },

  // Real Estate (2)
  {
    id: 'realestate',
    name: 'Home Builders',
    category: 'real-estate',
    description: 'Home Construction ETF (ITB)',
    color: '#EC4899',
    source: 'YAHOO',
    sourceId: 'ITB',
  },
  {
    id: 'reits',
    name: 'REITs',
    category: 'real-estate',
    description: 'Real Estate ETF (VNQ)',
    color: '#DB2777',
    source: 'YAHOO',
    sourceId: 'VNQ',
  },

  // Forex (4)
  {
    id: 'dxy',
    name: 'US Dollar',
    category: 'forex',
    description: 'Dollar Index (DXY)',
    color: '#22C55E',
    source: 'YAHOO',
    sourceId: 'DX-Y.NYB',
  },
  {
    id: 'eur',
    name: 'Euro',
    category: 'forex',
    description: 'EUR/USD',
    color: '#3B82F6',
    source: 'YAHOO',
    sourceId: 'EURUSD=X',
  },
  {
    id: 'jpy',
    name: 'Yen',
    category: 'forex',
    description: 'USD/JPY',
    color: '#EF4444',
    source: 'YAHOO',
    sourceId: 'JPY=X',
  },
  {
    id: 'cny',
    name: 'Yuan',
    category: 'forex',
    description: 'USD/CNY',
    color: '#FBBF24',
    source: 'YAHOO',
    sourceId: 'CNY=X',
  },

  // Crypto (3)
  {
    id: 'btc',
    name: 'Bitcoin',
    category: 'crypto',
    description: 'BTC/USD',
    color: '#F7931A',
    source: 'YAHOO',
    sourceId: 'BTC-USD',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    category: 'crypto',
    description: 'ETH/USD',
    color: '#627EEA',
    source: 'YAHOO',
    sourceId: 'ETH-USD',
  },
  {
    id: 'crypto_index',
    name: 'Crypto Index',
    category: 'crypto',
    description: 'Bitwise Crypto ETF (BITQ)',
    color: '#8B5CF6',
    source: 'YAHOO',
    sourceId: 'BITQ',
  },
];

// Get markets by source for batching API calls
export const getMarketsBySource = (source: Market['source']) =>
  MARKETS.filter(m => m.source === source);

// Category metadata for display - ordered for visual grouping
export const CATEGORIES: Record<string, { label: string; color: string; order: number }> = {
  equities: { label: 'Equities', color: '#6366F1', order: 1 },
  bonds: { label: 'Fixed Income', color: '#06B6D4', order: 2 },
  commodities: { label: 'Commodities', color: '#F59E0B', order: 3 },
  energy: { label: 'Energy', color: '#F97316', order: 4 },
  'real-estate': { label: 'Real Estate', color: '#EC4899', order: 5 },
  forex: { label: 'Currencies', color: '#22C55E', order: 6 },
  crypto: { label: 'Crypto', color: '#F7931A', order: 7 },
};

// Get sorted category entries
export const getSortedCategories = () =>
  Object.entries(CATEGORIES).sort((a, b) => a[1].order - b[1].order);
