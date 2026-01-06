'use client';

import { ActivityHeatmap } from '@/components/streak/ActivityHeatmap';
import { StreakTile } from '@/components/streak/StreakTile';
import { TodaySummary } from '@/components/sessions/TodaySummary';
import { SessionList } from '@/components/sessions/SessionList';
import { useSessionStore } from '@/stores/useSessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiChartBar, PiFireBold, PiClockBold, PiListBold } from 'react-icons/pi';

export default function StatsPage() {
  const { sessions } = useSessionStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 pb-6 border-b border-zinc-800/50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-1">
          Statistics
        </h1>
        <p className="text-zinc-500 text-lg">
          Track your progress and activity patterns
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Activity Overview</h2>
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-700/50 shadow-2xl shadow-black/50">
            <CardContent className="pt-6">
              <ActivityHeatmap sessions={sessions} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-zinc-300">Current Stats</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/30 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-zinc-600 transition-all duration-300 group">
              <CardContent className="p-6 hover:bg-zinc-900/50 transition-colors duration-300">
                <StreakTile />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/30 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-zinc-600 transition-all duration-300 group">
              <CardContent className="p-6 hover:bg-zinc-900/50 transition-colors duration-300">
                <TodaySummary />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-zinc-300">Recent Activity</h2>
          <Card className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <PiListBold className="w-5 h-5 text-white" />
                </div>
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionList />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
