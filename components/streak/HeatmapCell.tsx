'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DailyData {
  date: Date;
  dateStr: string;
  minutes: number;
  sessions: any[];
}

interface HeatmapCellProps {
  day: DailyData;
  colorClass: string;
  isToday: boolean;
  onClick: () => void;
}

export function HeatmapCell({ day, colorClass, isToday, onClick }: HeatmapCellProps) {
  const formattedDate = format(new Date(day.dateStr), 'MMM d, yyyy');
  const timeDisplay = day.minutes < 1
    ? `${Math.round(day.minutes * 60)}s`
    : day.minutes < 60
    ? `${Math.round(day.minutes)}m`
    : `${Math.floor(day.minutes / 60)}h ${Math.round(day.minutes % 60)}m`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-white hover:ring-offset-1 hover:ring-offset-black',
              colorClass,
              isToday && 'ring-1 ring-white ring-offset-1 ring-offset-black'
            )}
            style={{ width: '12px', height: '12px' }}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">
          <div className="text-sm">
            <div className="font-medium">{formattedDate}</div>
            <div className="text-zinc-400">{timeDisplay}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
