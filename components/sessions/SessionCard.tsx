import { Card, CardContent } from '@/components/ui/card';
import { format, isToday, isYesterday } from 'date-fns';
import { formatDuration } from '@/utils/helpers';
import type { Session } from '@/types';
import { PiClock, PiTrash } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { useSessions } from '@/hooks/useSessions';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const { deleteSession } = useSessions();

  const getDateLabel = () => {
    if (isToday(new Date(session.start))) return 'Today';
    if (isYesterday(new Date(session.start))) return 'Yesterday';
    return format(new Date(session.start), 'MMM d');
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="text-center min-w-[60px]">
            <p className="text-xs text-zinc-500 uppercase">{getDateLabel()}</p>
            <p className="text-sm font-medium text-white">
              {format(new Date(session.start), 'h:mm a')}
            </p>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex items-center gap-2 text-zinc-400">
            <PiClock className="w-4 h-4" />
            <span className="font-medium text-white">{formatDuration(session.duration)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteSession(session.id)}
          className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
        >
          <PiTrash className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
