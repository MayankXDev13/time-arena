import { useStreak } from '@/hooks/useStreak';
import { cn } from '@/lib/utils';
import { PiFireBold, PiTrendUpBold } from 'react-icons/pi';

export function StreakTile() {
  const { currentStreak, longestStreak, qualifiedToday } = useStreak();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-all duration-300',
            currentStreak > 0
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25'
              : 'bg-zinc-800'
          )}
        >
          <PiFireBold className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-zinc-400 font-medium">Current Streak</p>
          <p className="text-3xl font-bold text-white flex items-center gap-2">
            {currentStreak}
            <span className="text-sm text-zinc-500 font-normal">days</span>
            {qualifiedToday && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </p>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-1">
          <PiTrendUpBold className="w-3 h-3" />
          Best
        </div>
        <p className="text-xl font-semibold text-orange-500">{longestStreak} days</p>
      </div>
    </div>
  );
}
