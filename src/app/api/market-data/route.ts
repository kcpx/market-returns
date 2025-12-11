import { NextResponse } from 'next/server';
import { MARKETS, getMarketsBySource } from '@/lib/markets';
import { fetchFredSeries, parseObservations, calculateReturns } from '@/lib/fred';
import { fetchYahooSeries } from '@/lib/yahoo';
import { fetchCoinGeckoSeries } from '@/lib/coingecko';
import {
  monthlyToPeriodReturns,
  aggregateToQuarterly,
  aggregateToYearly
} from '@/lib/utils';
import { MarketData } from '@/types';

const FRED_API_KEY = process.env.FRED_API_KEY;

// Helper to calculate returns from price map
function calculateReturnsFromPrices(prices: Map<string, number>): Map<string, number> {
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

export async function GET() {
  if (!FRED_API_KEY) {
    return NextResponse.json(
      { error: 'FRED_API_KEY not configured' },
      { status: 500 }
    );
  }

  const returns: MarketData['returns'] = {};

  // Fetch FRED markets
  const fredMarkets = getMarketsBySource('FRED');
  console.log(`Fetching ${fredMarkets.length} FRED markets...`);

  const fredPromises = fredMarkets.map(async (market) => {
    try {
      console.log(`  FRED: ${market.name} (${market.sourceId})`);
      const observations = await fetchFredSeries({
        seriesId: market.sourceId,
        apiKey: FRED_API_KEY,
        startDate: '2000-01-01',
      });

      const monthlyPrices = parseObservations(observations);
      const monthlyReturns = calculateReturns(monthlyPrices);

      const monthly = monthlyToPeriodReturns(monthlyPrices, monthlyReturns);
      const quarterly = aggregateToQuarterly(monthlyReturns, monthlyPrices);
      const yearly = aggregateToYearly(monthlyPrices);

      console.log(`  ✓ ${market.name}: ${monthly.length} months`);
      return { marketId: market.id, data: { monthly, quarterly, yearly } };
    } catch (error) {
      console.error(`  ✗ FRED ${market.id}:`, error);
      return { marketId: market.id, data: { monthly: [], quarterly: [], yearly: [] } };
    }
  });

  // Fetch Yahoo markets
  const yahooMarkets = getMarketsBySource('YAHOO');
  console.log(`Fetching ${yahooMarkets.length} Yahoo markets...`);

  const yahooPromises = yahooMarkets.map(async (market) => {
    try {
      console.log(`  Yahoo: ${market.name} (${market.sourceId})`);
      const monthlyPrices = await fetchYahooSeries(market.sourceId, '2000-01-01');
      const monthlyReturns = calculateReturnsFromPrices(monthlyPrices);

      const monthly = monthlyToPeriodReturns(monthlyPrices, monthlyReturns);
      const quarterly = aggregateToQuarterly(monthlyReturns, monthlyPrices);
      const yearly = aggregateToYearly(monthlyPrices);

      console.log(`  ✓ ${market.name}: ${monthly.length} months`);
      return { marketId: market.id, data: { monthly, quarterly, yearly } };
    } catch (error) {
      console.error(`  ✗ Yahoo ${market.id}:`, error);
      return { marketId: market.id, data: { monthly: [], quarterly: [], yearly: [] } };
    }
  });

  // Fetch CoinGecko markets
  const cryptoMarkets = getMarketsBySource('COINGECKO');
  console.log(`Fetching ${cryptoMarkets.length} CoinGecko markets...`);

  const cryptoPromises = cryptoMarkets.map(async (market) => {
    try {
      console.log(`  CoinGecko: ${market.name} (${market.sourceId})`);
      // CoinGecko free tier has limited historical data, start from 2015
      const monthlyPrices = await fetchCoinGeckoSeries(market.sourceId, '2015-01-01');
      const monthlyReturns = calculateReturnsFromPrices(monthlyPrices);

      const monthly = monthlyToPeriodReturns(monthlyPrices, monthlyReturns);
      const quarterly = aggregateToQuarterly(monthlyReturns, monthlyPrices);
      const yearly = aggregateToYearly(monthlyPrices);

      console.log(`  ✓ ${market.name}: ${monthly.length} months`);
      return { marketId: market.id, data: { monthly, quarterly, yearly } };
    } catch (error) {
      console.error(`  ✗ CoinGecko ${market.id}:`, error);
      return { marketId: market.id, data: { monthly: [], quarterly: [], yearly: [] } };
    }
  });

  // Wait for all fetches
  const [fredResults, yahooResults, cryptoResults] = await Promise.all([
    Promise.all(fredPromises),
    Promise.all(yahooPromises),
    Promise.all(cryptoPromises),
  ]);

  // Combine results
  for (const result of [...fredResults, ...yahooResults, ...cryptoResults]) {
    returns[result.marketId] = result.data;
  }

  // Get date range from first market that has data
  const firstMarketData = Object.values(returns).find(r => r.monthly.length > 0);
  const dataStart = firstMarketData?.monthly[0]?.period || '';
  const dataEnd = firstMarketData?.monthly[firstMarketData.monthly.length - 1]?.period || '';

  const data: MarketData = {
    markets: MARKETS,
    returns,
    metadata: {
      lastUpdated: new Date().toISOString(),
      dataStart,
      dataEnd,
    },
  };

  return NextResponse.json(data);
}
