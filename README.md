# Market Returns

A simple, visual tool showing how major asset classes performed over time.

![Market Returns Preview](preview.png)

## Features

- **6 Markets** (MVP): S&P 500, 10Y Treasury, Gold, Crude Oil, Natural Gas, US Dollar Index
- **3 Time Views**: Monthly, Quarterly, Yearly
- **Year Range Filter**: Focus on specific time periods
- **Color-Coded Returns**: Green for gains, red for losses

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Updating Market Data

The app ships with sample data. To fetch fresh data from FRED:

1. Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Create `.env` file:
   ```
   FRED_API_KEY=your_api_key_here
   ```
3. Run the data fetch script:
   ```bash
   npm run fetch-data
   ```

## Deployment

This project is configured for Vercel static export:

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Adding More Markets

To add markets, edit `src/lib/markets.ts`:

```typescript
{
  id: 'btc',
  name: 'Bitcoin',
  category: 'crypto',
  description: 'Bitcoin',
  color: '#F7931A',
  source: 'COINGECKO',  // or 'YAHOO', 'FRED'
  sourceId: 'bitcoin',
}
```

Then add the corresponding data fetcher in `src/scripts/`.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **FRED API** - Economic data

## License

MIT
