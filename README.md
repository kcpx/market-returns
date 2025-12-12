# AssetAtlas

Every major asset class. Every year. One view.

A comprehensive visual tool for tracking investment returns across stocks, bonds, commodities, crypto, and more.

**Live Demo:** [https://market-returns.vercel.app](https://market-returns.vercel.app)

## Features

### 30+ Markets Across 7 Asset Classes

| Category | Markets |
|----------|---------|
| **Equities** | S&P 500, Nasdaq 100, Russell 2000, International Developed, Emerging Markets |
| **Sectors** | Technology, Financials, Healthcare, Energy, Industrials, Consumer Staples, Consumer Discretionary, Utilities |
| **Fixed Income** | 7-10Y Treasury, 20+ Yr Treasury, Corporate IG Bonds, High Yield, TIPS |
| **Commodities** | Gold, Silver, Crude Oil, Agriculture, Broad Commodities |
| **Real Estate** | US REITs, International REITs, Home Builders |
| **Currencies** | US Dollar, Euro, Yen |
| **Crypto** | Bitcoin, Ethereum, Solana |

### Three Visualization Modes

1. **Heatmap** - Color-coded grid showing returns across all markets and time periods
2. **Markets Chart** - Line chart comparing individual markets within a category
3. **Sectors Chart** - Growth of $100 visualization with category filtering, log scale toggle, and crypto exclusion option

### Key Capabilities

- **Live Data** - Auto-refreshes hourly from Yahoo Finance
- **Multiple Timeframes** - Yearly and quarterly views
- **Year Range Selector** - Focus on specific time periods (2000-2025)
- **Responsive Design** - Fully mobile-friendly
- **Error Boundaries** - Graceful error handling with retry options
- **Dark Theme** - Easy on the eyes for market analysis

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive charts
- **Yahoo Finance API** - Live market data
- **Vercel Analytics** - Usage tracking

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

The app fetches live data on page load and refreshes every hour. Static fallback data is included for offline use.

To manually update the static data:

1. Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) (optional)
2. Create `.env.local` file:
   ```
   FRED_API_KEY=your_api_key_here
   ```
3. Run the data fetch script:
   ```bash
   npm run fetch-data
   ```

## Deployment

Deployed on Vercel with automatic deployments from GitHub:

```bash
vercel
```

Or connect your GitHub repo to Vercel for CI/CD.

## Project Structure

```
src/
├── app/
│   ├── api/market-data/   # Live data API endpoint
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main dashboard
├── components/
│   ├── HeatmapGrid.tsx    # Color-coded return grid
│   ├── TrendChart.tsx     # Category-based line chart
│   ├── SectorCompareChart.tsx # Individual market comparison
│   ├── ReturnCell.tsx     # Individual heatmap cell
│   ├── PeriodSelector.tsx # Yearly/Quarterly toggle
│   ├── YearRangeSelector.tsx # Year range filter
│   ├── ColorLegend.tsx    # Heatmap color scale
│   ├── ErrorBoundary.tsx  # React error boundary
│   └── DataError.tsx      # Error display component
├── lib/
│   ├── markets.ts         # Market definitions
│   └── utils.ts           # Color/formatting utilities
├── data/
│   └── market-data.json   # Static fallback data
└── types/
    └── index.ts           # TypeScript definitions
```

## Adding More Markets

To add a new market, edit `src/lib/markets.ts`:

```typescript
{
  id: 'new-market',
  name: 'Market Name',
  category: 'equities', // equities, sectors, bonds, commodities, real-estate, forex, crypto
  description: 'Description',
  color: '#HEX_COLOR',
  source: 'YAHOO',
  sourceId: 'TICKER',
}
```

## Disclaimer

This data is for informational purposes only and does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Past performance is not indicative of future results. Always do your own research and consult with a qualified financial advisor before making investment decisions.

## License

MIT
