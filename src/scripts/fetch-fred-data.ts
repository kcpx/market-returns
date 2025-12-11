/**
 * Data fetching script - run with: npm run fetch-data
 * 
 * Fetches data from FRED API and generates static JSON file.
 * Requires FRED_API_KEY environment variable.
 * 
 * Get your free API key at: https://fred.stlouisfed.org/docs/api/api_key.html
 */

import * as fs from 'fs';
import * as path from 'path';
import { MARKETS, getMarketsBySource } from '../lib/markets';
import { fetchFredSeries, parseObservations, calculateReturns } from '../lib/fred';
import { 
  monthlyToPeriodReturns, 
  aggregateToQuarterly, 
  aggregateToYearly 
} from '../lib/utils';
import { MarketData, PeriodReturn } from '../types';

const FRED_API_KEY = process.env.FRED_API_KEY;

if (!FRED_API_KEY) {
  console.error('❌ FRED_API_KEY environment variable is required');
  console.error('   Get your free key at: https://fred.stlouisfed.org/docs/api/api_key.html');
  process.exit(1);
}

// Assert the key exists after the check (TypeScript doesn't narrow after process.exit)
const apiKey: string = FRED_API_KEY;

async function fetchAllData(): Promise<MarketData> {
  const fredMarkets = getMarketsBySource('FRED');
  
  const returns: MarketData['returns'] = {};
  
  console.log(`📊 Fetching data for ${fredMarkets.length} FRED markets...\n`);

  for (const market of fredMarkets) {
    console.log(`  → ${market.name} (${market.sourceId})`);
    
    try {
      // Fetch raw data from FRED
      const observations = await fetchFredSeries({
        seriesId: market.sourceId,
        apiKey: apiKey,
        startDate: '2000-01-01',
      });
      
      // Parse to monthly prices
      const monthlyPrices = parseObservations(observations);
      
      // Calculate monthly returns
      const monthlyReturns = calculateReturns(monthlyPrices);
      
      // Convert to our data structures
      const monthly = monthlyToPeriodReturns(monthlyPrices, monthlyReturns);
      const quarterly = aggregateToQuarterly(monthlyReturns, monthlyPrices);
      const yearly = aggregateToYearly(monthlyPrices);
      
      returns[market.id] = { monthly, quarterly, yearly };
      
      console.log(`    ✓ ${monthly.length} months, ${quarterly.length} quarters, ${yearly.length} years`);
      
      // Rate limit - FRED allows 120/min but let's be nice
      await sleep(500);
      
    } catch (error) {
      console.error(`    ✗ Error: ${error}`);
      returns[market.id] = { monthly: [], quarterly: [], yearly: [] };
    }
  }

  // Get date range from first market that has data
  const firstMarketData = Object.values(returns).find(r => r.monthly.length > 0);
  const dataStart = firstMarketData?.monthly[0]?.period || '';
  const dataEnd = firstMarketData?.monthly[firstMarketData.monthly.length - 1]?.period || '';

  return {
    markets: MARKETS,
    returns,
    metadata: {
      lastUpdated: new Date().toISOString(),
      dataStart,
      dataEnd,
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Market Returns Data Fetcher\n');
  console.log('================================\n');
  
  const data = await fetchAllData();
  
  // Write to public directory for static access
  const outputPath = path.join(process.cwd(), 'src', 'data', 'market-data.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Data saved to ${outputPath}`);
  console.log(`   Last updated: ${data.metadata.lastUpdated}`);
  console.log(`   Date range: ${data.metadata.dataStart} to ${data.metadata.dataEnd}`);
}

main().catch(console.error);
