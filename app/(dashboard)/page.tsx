'use client';

import { Timer } from '@/components/timer/Timer';
import { StreakTile } from '@/components/streak/StreakTile';
import { TodaySummary } from '@/components/sessions/TodaySummary';
import { ActivityHeatmap } from '@/components/streak/ActivityHeatmap';
import { useSessionStore } from '@/stores/useSessionStore';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { sessions } = useSessionStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Timer Arena</h1>
        <p className="text-zinc-400">Start tracking your time and build streaks</p>
      </div>

      <div className="mb-8 flex flex-col items-center">
        <Timer />
      </div>

      <Card className="mb-4 bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <ActivityHeatmap sessions={sessions} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakTile />
        <TodaySummary />
      </div>
    </div>
  );
}
