// Yahoo Finance API (unofficial)
// Uses the query1.finance.yahoo.com endpoint

interface YahooQuote {
  date: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose: number;
}

interface YahooResponse {
  chart: {
    result: [{
      meta: {
        symbol: string;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: [{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }];
        adjclose: [{
          adjclose: number[];
        }];
      };
    }];
    error: null | { code: string; description: string };
  };
}

export async function fetchYahooSeries(
  symbol: string,
  startDate: string = '2000-01-01'
): Promise<Map<string, number>> {
  const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
  const endTimestamp = Math.floor(Date.now() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1mo&includeAdjustedClose=true`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo API error: ${response.status} ${response.statusText}`);
  }

  const data: YahooResponse = await response.json();

  if (data.chart.error) {
    throw new Error(`Yahoo API error: ${data.chart.error.description}`);
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const adjCloses = result.indicators.adjclose[0].adjclose;

  const monthlyData = new Map<string, number>();

  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(timestamps[i] * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const period = `${year}-${month}`;

    const price = adjCloses[i];
    if (price !== null && !isNaN(price)) {
      monthlyData.set(period, price);
    }
  }

  return monthlyData;
}
