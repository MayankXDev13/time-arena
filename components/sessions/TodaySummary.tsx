import { useSessionStore } from '@/stores/useSessionStore';
import { formatDuration } from '@/utils/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { PiClockBold } from 'react-icons/pi';

export function TodaySummary() {
  const totalTodaySeconds = useSessionStore((state) =>
    state.sessions
      .filter((s) => {
        const today = new Date().toISOString().split('T')[0];
        return new Date(s.start).toISOString().split('T')[0] === today;
      })
      .reduce((total, s) => total + s.duration, 0)
  );

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="p-2 rounded-lg bg-orange-500/20">
          <PiClockBold className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-sm text-zinc-400 font-medium">Today</p>
          <p className="text-xl font-bold text-white">{formatDuration(totalTodaySeconds)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
