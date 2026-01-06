import { useStreak } from '@/hooks/useStreak';
import { PiFireBold } from 'react-icons/pi';
import { cn } from '@/lib/utils';

export function StreakHeader() {
  const { currentStreak } = useStreak();

  return (
    <div className="flex items-center gap-2">
      <PiFireBold
        className={cn(
          'w-5 h-5 transition-all duration-300',
          currentStreak > 0 ? 'text-orange-500' : 'text-zinc-600'
        )}
      />
      <span className="font-semibold text-white">{currentStreak}</span>
    </div>
  );
}
