'use client';

import { useRef, useEffect } from 'react';
import { MarketData, PeriodType, Market } from '@/types';
import { ReturnCell } from './ReturnCell';
import { CATEGORIES, getSortedCategories } from '@/lib/markets';

interface HeatmapGridProps {
  data: MarketData;
  periodType: PeriodType;
  startYear?: number;
  endYear?: number;
}

export function HeatmapGrid({ data, periodType, startYear, endYear }: HeatmapGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Get all unique periods across all markets
  const allPeriods = new Set<string>();
  
  for (const marketId in data.returns) {
    const periods = data.returns[marketId][periodType];
    periods.forEach(p => allPeriods.add(p.period));
  }
  
  // Sort periods and filter by year range
  let sortedPeriods = Array.from(allPeriods).sort();

  if (startYear || endYear) {
    sortedPeriods = sortedPeriods.filter(period => {
      const year = parseInt(period.split('-')[0]);
      if (startYear && year < startYear) return false;
      if (endYear && year > endYear) return false;
      return true;
    });
  }

  // Limit periods for quarterly to start from 2020
  if (periodType === 'quarterly') {
    sortedPeriods = sortedPeriods.filter(period => {
      const year = parseInt(period.split('-')[0]);
      return year >= 2020;
    });
  }

  // Group markets by category
  const marketsByCategory = new Map<string, Market[]>();
  
  for (const market of data.markets) {
    if (!marketsByCategory.has(market.category)) {
      marketsByCategory.set(market.category, []);
    }
    marketsByCategory.get(market.category)!.push(market);
  }

  // Get sorted category order
  const sortedCategories = getSortedCategories();

  // Helper to get return for a specific market and period
  const getReturn = (marketId: string, period: string): number | null => {
    const periods = data.returns[marketId]?.[periodType] || [];
    const found = periods.find(p => p.period === period);
    return found?.returnPct ?? null;
  };

  // Scroll to the right (most recent data) on initial load
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [periodType, data]);

  return (
    <div className="flex">
      {/* Fixed left column for market names */}
      <div className="flex-shrink-0 w-28 sm:w-36 md:w-44">
        {/* Header spacer */}
        <div className="h-4 sm:h-5 mb-2 sm:mb-3 flex items-center">
          <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">Market</span>
        </div>

        {/* Category and market labels */}
        {sortedCategories.map(([categoryId, category]) => {
          const markets = marketsByCategory.get(categoryId);
          if (!markets || markets.length === 0) return null;

          return (
            <div key={categoryId} className="mb-4 sm:mb-6">
              {/* Category header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 h-5 sm:h-6">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-300 uppercase tracking-wider truncate">
                  {category.label}
                </span>
              </div>

              {/* Market labels */}
              {markets.map(market => (
                <div key={market.id} className="flex mb-1 sm:mb-1.5 h-8 sm:h-10 md:h-12 items-center group">
                  <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3">
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ring-2 ring-transparent group-hover:ring-white/20 transition-all"
                      style={{ backgroundColor: market.color }}
                    />
                    <span className="text-[10px] sm:text-xs md:text-sm text-neutral-300 truncate group-hover:text-white transition-colors">
                      {market.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Scrollable data area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="min-w-max">
          {/* Header row with periods */}
          <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3 h-4 sm:h-5">
            {sortedPeriods.map(period => (
              <div
                key={period}
                className="w-10 sm:w-14 md:w-[72px] text-center text-[8px] sm:text-[10px] md:text-xs text-neutral-400 font-medium"
              >
                {formatPeriodLabel(period, periodType)}
              </div>
            ))}
          </div>

          {/* Market rows grouped by category */}
          {sortedCategories.map(([categoryId, category]) => {
            const markets = marketsByCategory.get(categoryId);
            if (!markets || markets.length === 0) return null;

            return (
              <div key={categoryId} className="mb-4 sm:mb-6">
                {/* Category header spacer */}
                <div className="h-5 sm:h-6 mb-2 sm:mb-3" />

                {/* Market data rows */}
                {markets.map(market => (
                  <div key={market.id} className="flex gap-0.5 sm:gap-1 mb-1 sm:mb-1.5">
                    {/* Return cells */}
                    {sortedPeriods.map(period => (
                      <div key={period} className="w-10 sm:w-14 md:w-[72px]">
                        <ReturnCell
                          returnPct={getReturn(market.id, period)}
                          period={period}
                          marketName={market.name}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatPeriodLabel(period: string, periodType: PeriodType): string {
  if (periodType === 'yearly') {
    return period; // Just the year
  }
  
  if (periodType === 'quarterly') {
    // 2024-Q1 -> Q1 '24
    const [year, quarter] = period.split('-');
    return `${quarter} '${year.slice(2)}`;
  }
  
  // Monthly: 2024-01 -> Jan '24
  const [year, month] = period.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
}
