'use client';

import { PeriodType } from '@/types';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const options: { value: PeriodType; label: string }[] = [
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium
            transition-all duration-150
            ${value === option.value
              ? 'bg-neutral-100 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
