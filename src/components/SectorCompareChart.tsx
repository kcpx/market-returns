'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MarketData, PeriodType } from '@/types';
import { CATEGORIES, getSortedCategories } from '@/lib/markets';

interface SectorCompareChartProps {
  data: MarketData;
  periodType: PeriodType;
  startYear?: number;
  endYear?: number;
}

export function SectorCompareChart({ data, periodType, startYear, endYear }: SectorCompareChartProps) {
  const sortedCategories = getSortedCategories();

  // Build chart data with average returns per sector
  const chartData = useMemo(() => {
    // Get all unique periods across all markets
    const allPeriods = new Set<string>();
    for (const marketId in data.returns) {
      const periods = data.returns[marketId]?.[periodType] || [];
      periods.forEach(p => allPeriods.add(p.period));
    }

    // Sort and filter by year range
    let sortedPeriods = Array.from(allPeriods).sort();

    if (startYear || endYear) {
      sortedPeriods = sortedPeriods.filter(period => {
        const year = parseInt(period.split('-')[0]);
        if (startYear && year < startYear) return false;
        if (endYear && year > endYear) return false;
        return true;
      });
    }

    // Limit quarterly to start from 2020
    if (periodType === 'quarterly') {
      sortedPeriods = sortedPeriods.filter(period => {
        const year = parseInt(period.split('-')[0]);
        return year >= 2020;
      });
    }

    // Group markets by category
    const marketsByCategory = new Map<string, string[]>();
    for (const market of data.markets) {
      if (!marketsByCategory.has(market.category)) {
        marketsByCategory.set(market.category, []);
      }
      marketsByCategory.get(market.category)!.push(market.id);
    }

    // Build data points with average return per sector
    return sortedPeriods.map(period => {
      const point: Record<string, string | number | null> = { period };

      for (const [categoryId] of sortedCategories) {
        const marketIds = marketsByCategory.get(categoryId) || [];
        const returns: number[] = [];

        for (const marketId of marketIds) {
          const periods = data.returns[marketId]?.[periodType] || [];
          const found = periods.find(p => p.period === period);
          if (found?.returnPct !== null && found?.returnPct !== undefined) {
            returns.push(found.returnPct);
          }
        }

        // Calculate average return for this sector
        if (returns.length > 0) {
          const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
          point[categoryId] = parseFloat(avg.toFixed(2));
        } else {
          point[categoryId] = null;
        }
      }

      return point;
    });
  }, [data, periodType, startYear, endYear, sortedCategories]);

  // Format period label for X axis
  const formatXAxis = (period: string) => {
    if (periodType === 'yearly') return period;
    if (periodType === 'quarterly') {
      const [year, quarter] = period.split('-');
      return `${quarter}'${year.slice(2)}`;
    }
    const [year, month] = period.split('-');
    const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    return `${monthNames[parseInt(month) - 1]}'${year.slice(2)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    // Sort payload by value descending
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
        <p className="text-neutral-300 font-medium mb-2">{label}</p>
        {sortedPayload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-neutral-400">{CATEGORIES[entry.dataKey]?.label || entry.dataKey}:</span>
            <span
              className={`font-medium ${
                entry.value > 0
                  ? 'text-emerald-400'
                  : entry.value < 0
                  ? 'text-rose-400'
                  : 'text-neutral-400'
              }`}
            >
              {entry.value !== null ? `${entry.value > 0 ? '+' : ''}${entry.value.toFixed(1)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Description */}
      <div className="text-sm text-neutral-400">
        Average returns across all markets in each sector
      </div>

      {/* Chart */}
      <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxis}
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 10 }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-neutral-300 text-xs sm:text-sm">
                  {CATEGORIES[value]?.label || value}
                </span>
              )}
            />
            {/* Zero reference line */}
            <Line
              type="monotone"
              dataKey={() => 0}
              stroke="#525252"
              strokeDasharray="5 5"
              dot={false}
              legendType="none"
            />
            {sortedCategories.map(([categoryId, category]) => (
              <Line
                key={categoryId}
                type="monotone"
                dataKey={categoryId}
                name={categoryId}
                stroke={category.color}
                strokeWidth={2.5}
                dot={periodType === 'yearly'}
                connectNulls
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with sector info */}
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
        {sortedCategories.map(([categoryId, category]) => {
          const marketCount = data.markets.filter(m => m.category === categoryId).length;
          return (
            <div key={categoryId} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs sm:text-sm text-neutral-300">{category.label}</span>
              <span className="text-[10px] sm:text-xs text-neutral-500">({marketCount})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
