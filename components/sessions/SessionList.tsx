import { useSessionStore } from '@/stores/useSessionStore';
import { SessionCard } from './SessionCard';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { PiCalendarBlank } from 'react-icons/pi';

export function SessionList() {
  const sessions = useSessionStore((state) => state.sessions);

  const todaySessions = sessions.filter((s) => isToday(new Date(s.start)));
  const yesterdaySessions = sessions.filter((s) => isYesterday(new Date(s.start)));
  const thisWeekSessions = sessions.filter((s) => {
    if (isToday(new Date(s.start)) || isYesterday(new Date(s.start))) return false;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return isWithinInterval(new Date(s.start), { start: weekStart, end: weekEnd });
  });
  const olderSessions = sessions.filter((s) => {
    if (isToday(new Date(s.start)) || isYesterday(new Date(s.start))) return false;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return !isWithinInterval(new Date(s.start), { start: weekStart, end: new Date() });
  });

  const renderSessionGroup = (groupSessions: typeof sessions, title: string) => {
    if (groupSessions.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-500 mb-3 flex items-center gap-2">
          <PiCalendarBlank className="w-4 h-4" />
          {title}
        </h3>
        <div className="space-y-2">
          {groupSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    );
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No sessions yet. Start tracking your time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {renderSessionGroup(todaySessions, 'Today')}
      {renderSessionGroup(yesterdaySessions, 'Yesterday')}
      {renderSessionGroup(thisWeekSessions, 'This Week')}
      {renderSessionGroup(olderSessions, 'Earlier')}
    </div>
  );
}
