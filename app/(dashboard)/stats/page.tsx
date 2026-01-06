'use client';

import { ActivityHeatmap } from '@/components/streak/ActivityHeatmap';
import { StreakTile } from '@/components/streak/StreakTile';
import { TodaySummary } from '@/components/sessions/TodaySummary';
import { SessionList } from '@/components/sessions/SessionList';
import { useSessionStore } from '@/stores/useSessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatsPage() {
  const { sessions } = useSessionStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-zinc-400">Track your progress and activity</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800 w-full">
          <CardHeader>
            <CardTitle className="text-white">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap sessions={sessions} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StreakTile />
          <TodaySummary />
        </div>

        <Card className="bg-zinc-900 border-zinc-800 w-full">
          <CardHeader>
            <CardTitle className="text-white">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
