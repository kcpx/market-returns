import { FredResponse, FredObservation } from '@/types';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface FetchFredDataOptions {
  seriesId: string;
  apiKey: string;
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  frequency?: 'm' | 'q' | 'a'; // monthly, quarterly, annual
}

export async function fetchFredSeries({
  seriesId,
  apiKey,
  startDate = '2000-01-01',
  endDate,
  frequency = 'm',
}: FetchFredDataOptions): Promise<FredObservation[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    observation_start: startDate,
    frequency,
    aggregation_method: 'eop', // End of period
  });

  if (endDate) {
    params.append('observation_end', endDate);
  }

  const url = `${FRED_BASE_URL}?${params.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data: FredResponse = await response.json();
  
  // Filter out missing values (FRED uses "." for missing data)
  return data.observations.filter(obs => obs.value !== '.');
}

// Convert raw observations to monthly close values
export function parseObservations(
  observations: FredObservation[]
): Map<string, number> {
  const monthlyData = new Map<string, number>();

  for (const obs of observations) {
    // Convert YYYY-MM-DD to YYYY-MM
    const period = obs.date.substring(0, 7);
    const value = parseFloat(obs.value);
    
    if (!isNaN(value)) {
      // Keep the last value for each month (end of period)
      monthlyData.set(period, value);
    }
  }

  return monthlyData;
}

// Calculate returns from price series
export function calculateReturns(
  prices: Map<string, number>
): Map<string, number> {
  const returns = new Map<string, number>();
  const sortedPeriods = Array.from(prices.keys()).sort();

  for (let i = 1; i < sortedPeriods.length; i++) {
    const currentPeriod = sortedPeriods[i];
    const prevPeriod = sortedPeriods[i - 1];
    
    const currentPrice = prices.get(currentPeriod)!;
    const prevPrice = prices.get(prevPeriod)!;
    
    const returnPct = ((currentPrice - prevPrice) / prevPrice) * 100;
    returns.set(currentPeriod, Math.round(returnPct * 100) / 100);
  }

  return returns;
}
