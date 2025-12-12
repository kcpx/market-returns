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
  ReferenceLine,
} from 'recharts';
import { MarketData, PeriodType, MarketCategory } from '@/types';
import { CATEGORIES, getSortedCategories } from '@/lib/markets';

interface SectorCompareChartProps {
  data: MarketData;
  periodType: PeriodType;
  startYear?: number;
  endYear?: number;
}

type ChartMode = 'returns' | 'indexed';

export function SectorCompareChart({ data, periodType, startYear, endYear }: SectorCompareChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('indexed');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [excludeCrypto, setExcludeCrypto] = useState(false);
  const [useLogScale, setUseLogScale] = useState(true);

  const sortedCategories = getSortedCategories();

  // Get markets filtered by selected category and crypto exclusion
  const filteredMarkets = useMemo(() => {
    let markets = data.markets;

    if (selectedCategory !== 'all') {
      markets = markets.filter(m => m.category === selectedCategory);
    }

    if (excludeCrypto) {
      markets = markets.filter(m => m.category !== 'crypto');
    }

    return markets;
  }, [data.markets, selectedCategory, excludeCrypto]);

  // Build chart data with individual market returns
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

    // Build data points with return per market
    const rawData = sortedPeriods.map(period => {
      const point: Record<string, string | number | null> = { period };

      for (const market of filteredMarkets) {
        const periods = data.returns[market.id]?.[periodType] || [];
        const found = periods.find(p => p.period === period);
        if (found?.returnPct !== null && found?.returnPct !== undefined) {
          point[market.id] = parseFloat(found.returnPct.toFixed(2));
        } else {
          point[market.id] = null;
        }
      }

      return point;
    });

    // If indexed mode, convert to cumulative growth starting at 100
    if (chartMode === 'indexed') {
      const indexedData: typeof rawData = [];
      const cumulativeValue: Record<string, number> = {};

      // Initialize all markets at 100
      for (const market of filteredMarkets) {
        cumulativeValue[market.id] = 100;
      }

      for (const point of rawData) {
        const indexedPoint: Record<string, string | number | null> = { period: point.period };

        for (const market of filteredMarkets) {
          const returnPct = point[market.id] as number | null;
          if (returnPct !== null) {
            // Apply the return to cumulative value
            cumulativeValue[market.id] = cumulativeValue[market.id] * (1 + returnPct / 100);
            indexedPoint[market.id] = parseFloat(cumulativeValue[market.id].toFixed(2));
          } else {
            indexedPoint[market.id] = cumulativeValue[market.id];
          }
        }

        indexedData.push(indexedPoint);
      }

      return indexedData;
    }

    return rawData;
  }, [data, periodType, startYear, endYear, filteredMarkets, chartMode]);

  // Calculate Y-axis domain for better scaling
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];

    let minVal = Infinity;
    let maxVal = -Infinity;

    for (const point of chartData) {
      for (const market of filteredMarkets) {
        const val = point[market.id] as number | null;
        if (val !== null && val !== undefined) {
          minVal = Math.min(minVal, val);
          maxVal = Math.max(maxVal, val);
        }
      }
    }

    if (chartMode === 'indexed') {
      // For indexed mode, ensure we have nice round numbers
      // and always include 100 (the starting point)
      const minBound = Math.min(minVal * 0.9, 100);
      const maxBound = Math.max(maxVal * 1.1, 100);

      if (useLogScale) {
        // For log scale, use powers of 10 or nice round numbers
        const logMin = Math.max(1, Math.floor(minBound / 10) * 10);
        const logMax = Math.ceil(maxBound / 100) * 100;
        return [logMin, logMax];
      }

      return [Math.floor(minBound / 10) * 10, Math.ceil(maxBound / 100) * 100];
    } else {
      // For returns mode, pad by 10% and include 0
      const padding = Math.max(Math.abs(maxVal), Math.abs(minVal)) * 0.1;
      return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
    }
  }, [chartData, filteredMarkets, chartMode, useLogScale]);

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

  // Get market name by ID
  const getMarketName = (marketId: string) => {
    const market = data.markets.find(m => m.id === marketId);
    return market?.name || marketId;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    // Sort payload by value descending
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl max-h-[300px] overflow-y-auto">
        <p className="text-neutral-300 font-medium mb-2">{label}</p>
        {sortedPayload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-neutral-400 truncate">{getMarketName(entry.dataKey)}:</span>
            <span
              className={`font-medium flex-shrink-0 ${
                chartMode === 'indexed'
                  ? entry.value >= 100 ? 'text-emerald-400' : 'text-rose-400'
                  : entry.value > 0 ? 'text-emerald-400' : entry.value < 0 ? 'text-rose-400' : 'text-neutral-400'
              }`}
            >
              {entry.value !== null
                ? chartMode === 'indexed'
                  ? `$${entry.value.toFixed(0)}`
                  : `${entry.value > 0 ? '+' : ''}${entry.value.toFixed(1)}%`
                : '—'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Category Filter */}
        <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-neutral-800 rounded-lg flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all
              ${selectedCategory === 'all'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
              }
            `}
          >
            All
          </button>
          {sortedCategories.map(([categoryId, category]) => (
            <button
              key={categoryId}
              onClick={() => setSelectedCategory(categoryId as MarketCategory)}
              className={`
                px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all
                ${selectedCategory === categoryId
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Mode Toggle */}
        <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-neutral-800 rounded-lg">
          <button
            onClick={() => setChartMode('indexed')}
            className={`
              px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all
              ${chartMode === 'indexed'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
              }
            `}
          >
            Growth of $100
          </button>
          <button
            onClick={() => setChartMode('returns')}
            className={`
              px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all
              ${chartMode === 'returns'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
              }
            `}
          >
            Period Returns
          </button>
        </div>

        {/* Scale Options */}
        <div className="flex items-center gap-3 sm:gap-4">
          {chartMode === 'indexed' && (
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLogScale}
                onChange={(e) => setUseLogScale(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-neutral-600 bg-neutral-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-neutral-900"
              />
              <span className="text-xs sm:text-sm text-neutral-400">Log Scale</span>
            </label>
          )}

          {selectedCategory === 'all' && (
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeCrypto}
                onChange={(e) => setExcludeCrypto(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-neutral-600 bg-neutral-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-neutral-900"
              />
              <span className="text-xs sm:text-sm text-neutral-400">Exclude Crypto</span>
            </label>
          )}
        </div>

        {/* Description */}
        <div className="text-xs sm:text-sm text-neutral-500 ml-auto">
          {filteredMarkets.length} markets
        </div>
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
              tickFormatter={(value) => {
                if (chartMode === 'indexed') {
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                  return `$${value}`;
                }
                return `${value}%`;
              }}
              domain={yAxisDomain}
              width={55}
              scale={chartMode === 'indexed' && useLogScale ? 'log' : 'auto'}
              allowDataOverflow={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-neutral-300 text-xs sm:text-sm">
                  {getMarketName(value)}
                </span>
              )}
            />
            {/* Reference line - 100 for indexed, 0 for returns */}
            <ReferenceLine
              y={chartMode === 'indexed' ? 100 : 0}
              stroke="#525252"
              strokeDasharray="5 5"
            />
            {filteredMarkets.map((market) => (
              <Line
                key={market.id}
                type="monotone"
                dataKey={market.id}
                name={market.id}
                stroke={market.color}
                strokeWidth={2}
                dot={periodType === 'yearly' && filteredMarkets.length <= 10}
                connectNulls
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with market info */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {filteredMarkets.map((market) => {
          // Get final value for this market
          const finalValue = chartData.length > 0 ? chartData[chartData.length - 1][market.id] as number : null;
          return (
            <div key={market.id} className="flex items-center gap-1.5 sm:gap-2 bg-neutral-800/50 px-2 py-1 rounded-md">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: market.color }}
              />
              <span className="text-xs sm:text-sm text-neutral-300">{market.name}</span>
              {chartMode === 'indexed' && finalValue !== null && (
                <span className={`text-[10px] sm:text-xs font-medium ${finalValue >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${finalValue.toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
