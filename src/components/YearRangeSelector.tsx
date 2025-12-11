'use client';

interface YearRangeSelectorProps {
  minYear: number;
  maxYear: number;
  startYear: number;
  endYear: number;
  onStartChange: (year: number) => void;
  onEndChange: (year: number) => void;
}

export function YearRangeSelector({
  minYear,
  maxYear,
  startYear,
  endYear,
  onStartChange,
  onEndChange,
}: YearRangeSelectorProps) {
  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-400">From</span>
      <select
        value={startYear}
        onChange={(e) => onStartChange(parseInt(e.target.value))}
        className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm
                   text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
      >
        {years.map(y => (
          <option key={y} value={y} disabled={y > endYear}>
            {y}
          </option>
        ))}
      </select>
      
      <span className="text-sm text-neutral-400">to</span>
      
      <select
        value={endYear}
        onChange={(e) => onEndChange(parseInt(e.target.value))}
        className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm
                   text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
      >
        {years.map(y => (
          <option key={y} value={y} disabled={y < startYear}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
