'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PeriodType, MarketData } from '@/types';
import {
  HeatmapGrid,
  PeriodSelector,
  ColorLegend,
  YearRangeSelector,
  TrendChart
} from '@/components';
import staticMarketData from '@/data/market-data.json';

const AUTO_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export default function Home() {
  const [data, setData] = useState<MarketData>(staticMarketData as MarketData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<PeriodType>('yearly');
  const [viewMode, setViewMode] = useState<'heatmap' | 'chart'>('heatmap');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);

  // Fetch live data function
  const fetchLiveData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch('/api/market-data');

      if (!response.ok) {
        throw new Error('Failed to fetch live data');
      }

      const liveData = await response.json();
      setData(liveData);
      setError(null);
      setLastUpdated(new Date());
      setNextUpdate(new Date(Date.now() + AUTO_REFRESH_INTERVAL));
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError('Using cached data - live fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and set up auto-refresh
  useEffect(() => {
    fetchLiveData();

    // Set up auto-refresh every hour
    const intervalId = setInterval(() => {
      fetchLiveData(false); // Don't show loading spinner on auto-refresh
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchLiveData]);

  // Calculate year range from data
  const { minYear, maxYear } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const marketId in data.returns) {
      const yearly = data.returns[marketId].yearly;
      for (const period of yearly) {
        const year = parseInt(period.period.split('-')[0]);
        min = Math.min(min, year);
        max = Math.max(max, year);
      }
    }

    return { minYear: min, maxYear: max };
  }, [data]);

  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2025);

  // Update year range when data changes
  useEffect(() => {
    if (minYear !== Infinity && maxYear !== -Infinity) {
      setStartYear(minYear);
      setEndYear(maxYear);
    }
  }, [minYear, maxYear]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    let bestMarket = { id: '', name: '', returnPct: -Infinity };
    let worstMarket = { id: '', name: '', returnPct: Infinity };

    for (const market of data.markets) {
      const yearly = data.returns[market.id]?.yearly || [];
      const latestReturn = yearly[yearly.length - 1]?.returnPct;

      if (latestReturn !== undefined && latestReturn !== null) {
        if (latestReturn > bestMarket.returnPct) {
          bestMarket = { id: market.id, name: market.name, returnPct: latestReturn };
        }
        if (latestReturn < worstMarket.returnPct) {
          worstMarket = { id: market.id, name: market.name, returnPct: latestReturn };
        }
      }
    }

    return { bestMarket, worstMarket };
  }, [data]);

  return (
    <main className="min-h-screen bg-[#09090b]">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-amber-950/10 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto p-3 sm:p-6 md:p-10">
        {/* Header */}
        <header className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-100 tracking-tight">
                ReturnRadar
              </h1>
            </div>

            {/* Live Data Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {loading ? (
                <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-neutral-800/60 rounded-lg border border-neutral-700">
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm text-neutral-400">Fetching...</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-amber-900/20 rounded-lg border border-amber-700/50">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs sm:text-sm text-amber-400 truncate max-w-[150px] sm:max-w-none">{error}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-3 sm:py-2 bg-neutral-800/60 rounded-lg border border-neutral-700">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-400">LIVE</span>
                  </div>
                  <div className="w-px h-4 bg-neutral-600 hidden sm:block" />
                  <div className="text-[10px] sm:text-xs text-neutral-400 hidden sm:block">
                    <span>Updated: </span>
                    <span className="text-neutral-300">
                      {lastUpdated?.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-neutral-600 hidden md:block" />
                  <div className="text-xs text-neutral-500 hidden md:block">
                    Auto-refresh in 1hr
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-neutral-400 max-w-2xl text-sm sm:text-base md:text-lg">
            Every major asset class. Every year. One view.
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mb-0.5 sm:mb-1">Markets</div>
            <div className="text-lg sm:text-2xl font-bold text-neutral-100">{data.markets.length}</div>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mb-0.5 sm:mb-1">Years</div>
            <div className="text-lg sm:text-2xl font-bold text-neutral-100">{maxYear - minYear + 1}</div>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mb-0.5 sm:mb-1">Best YTD</div>
            <div className="text-base sm:text-2xl font-bold text-emerald-400 truncate">
              {summaryStats.bestMarket.name || '—'}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-400/70">
              {summaryStats.bestMarket.returnPct !== -Infinity
                ? `+${summaryStats.bestMarket.returnPct.toFixed(1)}%`
                : '—'}
            </div>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mb-0.5 sm:mb-1">Worst YTD</div>
            <div className="text-base sm:text-2xl font-bold text-rose-400 truncate">
              {summaryStats.worstMarket.name || '—'}
            </div>
            <div className="text-[10px] sm:text-xs text-rose-400/70">
              {summaryStats.worstMarket.returnPct !== Infinity
                ? `${summaryStats.worstMarket.returnPct.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-neutral-800 rounded-lg">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`
                  px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 sm:gap-2
                  ${viewMode === 'heatmap'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
                  }
                `}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Heatmap
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`
                  px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 sm:gap-2
                  ${viewMode === 'chart'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
                  }
                `}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Trendmap
              </button>
            </div>
            <div className="h-6 sm:h-8 w-px bg-neutral-800 hidden sm:block" />
            <PeriodSelector value={periodType} onChange={setPeriodType} />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
            <YearRangeSelector
              minYear={minYear !== Infinity ? minYear : 2000}
              maxYear={maxYear !== -Infinity ? maxYear : 2025}
              startYear={startYear}
              endYear={endYear}
              onStartChange={setStartYear}
              onEndChange={setEndYear}
            />
            {viewMode === 'heatmap' && <ColorLegend />}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-900/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 border border-neutral-800/50 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-10 sm:py-20">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm sm:text-base text-neutral-400">Loading live market data...</p>
              </div>
            </div>
          ) : viewMode === 'heatmap' ? (
            <HeatmapGrid
              data={data}
              periodType={periodType}
              startYear={startYear}
              endYear={endYear}
            />
          ) : (
            <TrendChart
              data={data}
              periodType={periodType}
              startYear={startYear}
              endYear={endYear}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 md:mt-12 text-center space-y-3 sm:space-y-4">
          {/* Disclaimer */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 sm:p-4 max-w-3xl mx-auto">
            <p className="text-[10px] sm:text-xs text-amber-500/90 font-medium mb-1.5 sm:mb-2">
              Disclaimer - Not Financial Advice
            </p>
            <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
              This data is for informational purposes only and does not constitute financial advice,
              investment recommendations, or an offer to buy or sell any securities. Past performance
              is not indicative of future results. Always do your own research and consult with a
              qualified financial advisor before making investment decisions.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-500">
            Data sourced from FRED, Yahoo Finance, and CoinGecko.
            <span className="hidden sm:inline"> Last updated: {new Date(data.metadata.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </p>
          <p className="text-[10px] sm:text-xs text-neutral-600">
            Treasury yields shown as yield change (bps), not bond price returns.
            <span className="hidden sm:inline"> Crypto data available from 2015 (BTC) and 2016 (ETH).</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
