'use client';

export function ColorLegend() {
  const scale = [
    { label: '-30%+', color: 'bg-red-900' },
    { label: '-20%', color: 'bg-red-700' },
    { label: '-10%', color: 'bg-red-500' },
    { label: '0%', color: 'bg-neutral-600' },
    { label: '+10%', color: 'bg-green-500' },
    { label: '+20%', color: 'bg-green-700' },
    { label: '+30%+', color: 'bg-green-900' },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-neutral-500 mr-2">Returns:</span>
      {scale.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`w-6 h-4 rounded-sm ${item.color}`} />
          <span className="text-[10px] text-neutral-500 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
