'use client';

import { getReturnColor, formatReturn } from '@/lib/utils';

interface ReturnCellProps {
  returnPct: number | null;
  period: string;
  marketName: string;
  showValue?: boolean;
}

export function ReturnCell({ returnPct, period, marketName, showValue = true }: ReturnCellProps) {
  const bgColor = getReturnColor(returnPct);

  return (
    <div
      className="relative group w-full h-12 flex items-center justify-center text-xs font-medium transition-all duration-150 hover:scale-105 hover:z-10 hover:shadow-lg cursor-default rounded-sm"
      style={{ backgroundColor: bgColor }}
      title={`${marketName} ${period}: ${formatReturn(returnPct)}`}
    >
      {showValue && (
        <span className="text-white/90 drop-shadow-sm">
          {formatReturn(returnPct)}
        </span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-neutral-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20">
        {marketName} • {period}
      </div>
    </div>
  );
}
