import { useStreak } from '@/hooks/useStreak';
import { Card, CardContent } from '@/components/ui/card';
import { PiFireBold } from 'react-icons/pi';
import { cn } from '@/lib/utils';

export function StreakTile() {
  const { currentStreak, longestStreak, qualifiedToday } = useStreak();

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg transition-all duration-300',
              currentStreak > 0
                ? 'bg-orange-500/20 text-orange-500'
                : 'bg-zinc-800 text-zinc-600'
            )}
          >
            <PiFireBold className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400 font-medium">Current Streak</p>
            <p className="text-2xl font-bold text-white">
              {currentStreak} <span className="text-sm text-zinc-500 font-normal">days</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Best</p>
          <p className="text-lg font-semibold text-orange-500">{longestStreak} days</p>
        </div>
      </CardContent>
    </Card>
  );
}
