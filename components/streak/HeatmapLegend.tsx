import { cn } from '@/lib/utils';

const colorLevels = [
  { label: 'Less', className: 'bg-zinc-800' },
  { label: '', className: 'bg-orange-900/30' },
  { label: '', className: 'bg-orange-800/50' },
  { label: '', className: 'bg-orange-600/70' },
  { label: 'More', className: 'bg-orange-500' },
];

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>Less</span>
      {colorLevels.map((level, i) => (
        <div
          key={i}
          className={cn('w-3 h-3 rounded-sm', level.className)}
          title={level.label}
        />
      ))}
      <span>More</span>
    </div>
  );
}
