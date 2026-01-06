import { useSessionStore } from '@/stores/useSessionStore';
import { formatDuration } from '@/utils/helpers';
import { PiClockBold, PiCalendarBold } from 'react-icons/pi';

export function TodaySummary() {
  const totalTodaySeconds = useSessionStore((state) =>
    state.sessions
      .filter((s) => {
        const today = new Date().toISOString().split('T')[0];
        return new Date(s.start).toISOString().split('T')[0] === today;
      })
      .reduce((total, s) => total + s.duration, 0)
  );

  const sessionsToday = useSessionStore((state) =>
    state.sessions.filter((s) => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(s.start).toISOString().split('T')[0] === today;
    }).length
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25">
          <PiClockBold className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-zinc-400 font-medium flex items-center gap-2">
            <PiCalendarBold className="w-3 h-3" />
            Today
          </p>
          <p className="text-3xl font-bold text-white">{formatDuration(totalTodaySeconds)}</p>
          <p className="text-xs text-zinc-500">{sessionsToday} sessions</p>
        </div>
      </div>
    </div>
  );
}
