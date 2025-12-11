import { PeriodReturn } from '@/types';

// Convert monthly returns to quarterly returns
export function aggregateToQuarterly(
  monthlyReturns: Map<string, number>,
  monthlyPrices: Map<string, number>
): PeriodReturn[] {
  const quarters: PeriodReturn[] = [];
  const sortedMonths = Array.from(monthlyPrices.keys()).sort();
  
  // Group months into quarters
  const quarterMap = new Map<string, string[]>();
  
  for (const month of sortedMonths) {
    const [year, monthNum] = month.split('-');
    const q = Math.ceil(parseInt(monthNum) / 3);
    const quarterKey = `${year}-Q${q}`;
    
    if (!quarterMap.has(quarterKey)) {
      quarterMap.set(quarterKey, []);
    }
    quarterMap.get(quarterKey)!.push(month);
  }

  // Calculate quarterly returns using first and last month prices
  const sortedQuarters = Array.from(quarterMap.keys()).sort();
  
  for (let i = 0; i < sortedQuarters.length; i++) {
    const quarter = sortedQuarters[i];
    const months = quarterMap.get(quarter)!;
    
    if (i === 0) {
      // First quarter - no previous data
      quarters.push({
        period: quarter,
        value: monthlyPrices.get(months[months.length - 1]) || null,
        returnPct: null,
      });
      continue;
    }
    
    // Get last month of previous quarter
    const prevQuarter = sortedQuarters[i - 1];
    const prevMonths = quarterMap.get(prevQuarter)!;
    const prevPrice = monthlyPrices.get(prevMonths[prevMonths.length - 1]);
    
    // Get last month of current quarter
    const currentPrice = monthlyPrices.get(months[months.length - 1]);
    
    if (prevPrice && currentPrice) {
      const returnPct = ((currentPrice - prevPrice) / prevPrice) * 100;
      quarters.push({
        period: quarter,
        value: currentPrice,
        returnPct: Math.round(returnPct * 100) / 100,
      });
    } else {
      quarters.push({
        period: quarter,
        value: currentPrice || null,
        returnPct: null,
      });
    }
  }

  return quarters;
}

// Convert monthly returns to yearly returns
export function aggregateToYearly(
  monthlyPrices: Map<string, number>
): PeriodReturn[] {
  const years: PeriodReturn[] = [];
  const sortedMonths = Array.from(monthlyPrices.keys()).sort();
  
  // Group months into years, find December (or last available month)
  const yearMap = new Map<string, { firstMonth: string; lastMonth: string }>();
  
  for (const month of sortedMonths) {
    const year = month.split('-')[0];
    
    if (!yearMap.has(year)) {
      yearMap.set(year, { firstMonth: month, lastMonth: month });
    } else {
      yearMap.get(year)!.lastMonth = month;
    }
  }

  const sortedYears = Array.from(yearMap.keys()).sort();
  
  for (let i = 0; i < sortedYears.length; i++) {
    const year = sortedYears[i];
    const { lastMonth } = yearMap.get(year)!;
    
    if (i === 0) {
      years.push({
        period: year,
        value: monthlyPrices.get(lastMonth) || null,
        returnPct: null,
      });
      continue;
    }
    
    // Get last month of previous year
    const prevYear = sortedYears[i - 1];
    const prevLastMonth = yearMap.get(prevYear)!.lastMonth;
    
    const prevPrice = monthlyPrices.get(prevLastMonth);
    const currentPrice = monthlyPrices.get(lastMonth);
    
    if (prevPrice && currentPrice) {
      const returnPct = ((currentPrice - prevPrice) / prevPrice) * 100;
      years.push({
        period: year,
        value: currentPrice,
        returnPct: Math.round(returnPct * 100) / 100,
      });
    } else {
      years.push({
        period: year,
        value: currentPrice || null,
        returnPct: null,
      });
    }
  }

  return years;
}

// Convert monthly map to PeriodReturn array
export function monthlyToPeriodReturns(
  monthlyPrices: Map<string, number>,
  monthlyReturns: Map<string, number>
): PeriodReturn[] {
  const sortedMonths = Array.from(monthlyPrices.keys()).sort();
  
  return sortedMonths.map(month => ({
    period: month,
    value: monthlyPrices.get(month) || null,
    returnPct: monthlyReturns.get(month) || null,
  }));
}

// Get background color based on return percentage (returns hex color)
export function getReturnColor(returnPct: number | null): string {
  if (returnPct === null || returnPct === undefined) return '#262626'; // neutral-800

  // Negative returns - red scale
  if (returnPct < 0) {
    if (returnPct <= -30) return '#7f1d1d'; // red-900
    if (returnPct <= -20) return '#991b1b'; // red-800
    if (returnPct <= -10) return '#b91c1c'; // red-700
    if (returnPct <= -5) return '#dc2626';  // red-600
    return '#ef4444'; // red-500 - Small negative (-5% to 0%)
  }

  // Zero return
  if (returnPct === 0) return '#525252'; // neutral-600

  // Positive returns - green scale
  if (returnPct >= 30) return '#14532d'; // green-900
  if (returnPct >= 20) return '#166534'; // green-800
  if (returnPct >= 10) return '#15803d'; // green-700
  if (returnPct >= 5) return '#16a34a';  // green-600
  return '#22c55e'; // green-500 - Small positive (0% to 5%)
}

// Legacy class-based function (kept for compatibility)
export function getReturnColorClass(returnPct: number | null): string {
  if (returnPct === null || returnPct === undefined) return 'bg-neutral-800';
  if (returnPct < 0) {
    if (returnPct <= -30) return 'bg-red-900';
    if (returnPct <= -20) return 'bg-red-800';
    if (returnPct <= -10) return 'bg-red-700';
    if (returnPct <= -5) return 'bg-red-600';
    return 'bg-red-500';
  }
  if (returnPct === 0) return 'bg-neutral-600';
  if (returnPct >= 30) return 'bg-green-900';
  if (returnPct >= 20) return 'bg-green-800';
  if (returnPct >= 10) return 'bg-green-700';
  if (returnPct >= 5) return 'bg-green-600';
  return 'bg-green-500';
}

// Format return for display
export function formatReturn(returnPct: number | null): string {
  if (returnPct === null) return '—';
  const sign = returnPct >= 0 ? '+' : '';
  return `${sign}${returnPct.toFixed(1)}%`;
}

// Get unique years from periods
export function getYearRange(periods: string[]): { min: number; max: number } {
  const years = periods.map(p => parseInt(p.split('-')[0]));
  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}
