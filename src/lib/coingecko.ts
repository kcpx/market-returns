// CoinGecko API (free, no API key required for basic usage)
// Rate limited to ~10-30 calls/minute

interface CoinGeckoPrice {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function fetchCoinGeckoSeries(
  coinId: string,
  startDate: string = '2000-01-01'
): Promise<Map<string, number>> {
  // CoinGecko uses days parameter, max is ~365*5 for free tier
  // We'll fetch from a specific date
  const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
  const endTimestamp = Math.floor(Date.now() / 1000);

  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data: CoinGeckoPrice = await response.json();

  const monthlyData = new Map<string, number>();

  // Group prices by month, take the last price of each month
  for (const [timestamp, price] of data.prices) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const period = `${year}-${month}`;

    // Keep updating - last value for each month will be kept
    if (price !== null && !isNaN(price)) {
      monthlyData.set(period, price);
    }
  }

  return monthlyData;
}
