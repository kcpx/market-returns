// Core market definition
export interface Market {
  id: string;
  name: string;
  category: MarketCategory;
  description: string;
  color: string;
  source: DataSource;
  sourceId: string;
}

export type MarketCategory =
  | 'equities'
  | 'sectors'
  | 'bonds'
  | 'commodities'
  | 'crypto'
  | 'forex'
  | 'real-estate';

export type DataSource = 'FRED' | 'YAHOO' | 'COINGECKO';

export type PeriodType = 'monthly' | 'quarterly' | 'yearly';

// Return data for a single period
export interface PeriodReturn {
  period: string;        // '2024-01', '2024-Q1', '2024'
  value?: number | null;  // Closing value (optional, not needed for display)
  returnPct: number | null; // Percent return
}

// Full dataset structure
export interface MarketData {
  markets: Market[];
  returns: {
    [marketId: string]: {
      monthly: PeriodReturn[];
      quarterly: PeriodReturn[];
      yearly: PeriodReturn[];
    };
  };
  metadata: {
    lastUpdated: string;
    dataStart: string;
    dataEnd: string;
  };
}

// View state
export interface ViewState {
  periodType: PeriodType;
  startYear: number;
  endYear: number;
  selectedMarket: string | null;
}

// FRED API response types
export interface FredObservation {
  date: string;
  value: string;
}

export interface FredResponse {
  observations: FredObservation[];
}
