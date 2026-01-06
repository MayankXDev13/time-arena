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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-2">
          Statistics
        </h1>
        <p className="text-zinc-400">Track your progress and activity patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
                  <PiChartBar className="w-5 h-5 text-white" />
                </div>
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap sessions={sessions} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <StreakTile />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <TodaySummary />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-2xl">
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
    </div>
  );
}
