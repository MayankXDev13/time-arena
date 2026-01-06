import { useStreak } from '@/hooks/useStreak';
import { cn } from '@/lib/utils';
import { PiFireBold, PiTrendUpBold } from 'react-icons/pi';

export function StreakTile() {
  const { currentStreak, longestStreak, qualifiedToday } = useStreak();

  return (
    <div className="space-y-4">
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
          <p className="text-sm text-zinc-500 font-medium">Current Streak</p>
          <p className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            {currentStreak}
            <span className="text-sm text-zinc-500 font-normal">days</span>
            {qualifiedToday && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-zinc-500">
          <PiTrendUpBold className="w-4 h-4" />
          <span className="font-medium">Best streak</span>
        </div>
        <p className="text-lg font-semibold text-orange-400">{longestStreak} days</p>
      </div>
    </div>
  );
}
