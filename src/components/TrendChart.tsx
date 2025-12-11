'use client';

import { useMemo, useState } from 'react';
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
import { MarketData, PeriodType, Market } from '@/types';
import { CATEGORIES, getSortedCategories } from '@/lib/markets';

interface TrendChartProps {
  data: MarketData;
  periodType: PeriodType;
  startYear?: number;
  endYear?: number;
}

export function TrendChart({ data, periodType, startYear, endYear }: TrendChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('equities');
  const sortedCategories = getSortedCategories();

  // Get markets for selected category
  const categoryMarkets = useMemo(() => {
    return data.markets.filter(m => m.category === selectedCategory);
  }, [data.markets, selectedCategory]);

  // Build chart data
  const chartData = useMemo(() => {
    // Get all unique periods
    const allPeriods = new Set<string>();
    for (const market of categoryMarkets) {
      const periods = data.returns[market.id]?.[periodType] || [];
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

    // Build data points
    return sortedPeriods.map(period => {
      const point: Record<string, string | number | null> = { period };

      for (const market of categoryMarkets) {
        const periods = data.returns[market.id]?.[periodType] || [];
        const found = periods.find(p => p.period === period);
        point[market.id] = found?.returnPct ?? null;
      }

      return point;
    });
  }, [data, categoryMarkets, periodType, startYear, endYear]);

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

    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
        <p className="text-neutral-300 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-neutral-400">{entry.name}:</span>
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
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {sortedCategories.map(([categoryId, category]) => (
          <button
            key={categoryId}
            onClick={() => setSelectedCategory(categoryId)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedCategory === categoryId
                ? 'text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
              }
            `}
            style={selectedCategory === categoryId ? { backgroundColor: category.color } : {}}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxis}
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              interval={periodType === 'yearly' ? 0 : 'preserveStartEnd'}
              angle={periodType === 'yearly' ? 0 : -45}
              textAnchor={periodType === 'yearly' ? 'middle' : 'end'}
              height={60}
            />
            <YAxis
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => {
                const market = categoryMarkets.find(m => m.id === value);
                return <span className="text-neutral-300">{market?.name || value}</span>;
              }}
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
            {categoryMarkets.map((market) => (
              <Line
                key={market.id}
                type="monotone"
                dataKey={market.id}
                name={market.id}
                stroke={market.color}
                strokeWidth={2}
                dot={periodType === 'yearly'}
                connectNulls
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with market info */}
      <div className="flex flex-wrap gap-4 justify-center">
        {categoryMarkets.map((market) => (
          <div key={market.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: market.color }}
            />
            <span className="text-sm text-neutral-300">{market.name}</span>
            <span className="text-xs text-neutral-500">({market.description})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
