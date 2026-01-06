'use client';

import { useSettings } from '@/hooks/useSettings';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const thresholds = [5, 10, 15, 20, 25, 30, 45, 60];
const workDurations = [15, 20, 25, 30, 45, 60, 90];
const breakDurations = [3, 5, 10, 15, 20, 30];

export function SettingsForm() {
  const { user } = useAuth();
  const { loadSettings, updateStreakThreshold } = useSettings();
  const { settings: localSettings } = useSettingsStore();
  const { workDuration, breakDuration, setWorkDuration, setBreakDuration } = useTimerStore();
  const [threshold, setThreshold] = useState(15);
  const [localWorkDuration, setLocalWorkDuration] = useState(25);
  const [localBreakDuration, setLocalBreakDuration] = useState(5);

  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id, loadSettings]);

  useEffect(() => {
    if (localSettings?.streakThresholdMinutes) {
      setThreshold(localSettings.streakThresholdMinutes);
    }
  }, [localSettings]);

  useEffect(() => {
    setLocalWorkDuration(workDuration);
  }, [workDuration]);

  useEffect(() => {
    setLocalBreakDuration(breakDuration);
  }, [breakDuration]);

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    updateStreakThreshold(value);
  };

  const handleWorkDurationChange = (value: number) => {
    setLocalWorkDuration(value);
    setWorkDuration(value);
  };

  const handleBreakDurationChange = (value: number) => {
    setLocalBreakDuration(value);
    setBreakDuration(value);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Work duration</Label>
              <span className="text-orange-500 font-medium">{localWorkDuration} minutes</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {workDurations.map((t) => (
                <Button
                  key={t}
                  variant={localWorkDuration === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleWorkDurationChange(t)}
                  className={
                    localWorkDuration === t
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'border-zinc-700 hover:bg-zinc-800'
                  }
                >
                  {t}m
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Break duration</Label>
              <span className="text-green-500 font-medium">{localBreakDuration} minutes</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {breakDurations.map((t) => (
                <Button
                  key={t}
                  variant={localBreakDuration === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBreakDurationChange(t)}
                  className={
                    localBreakDuration === t
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'border-zinc-700 hover:bg-zinc-800'
                  }
                >
                  {t}m
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Streak Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Minimum session duration</Label>
              <span className="text-orange-500 font-medium">{threshold} minutes</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {thresholds.map((t) => (
                <Button
                  key={t}
                  variant={threshold === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThresholdChange(t)}
                  className={
                    threshold === t
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'border-zinc-700 hover:bg-zinc-800'
                  }
                >
                  {t}m
                </Button>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              Sessions must be at least {threshold} minutes long to qualify for your streak.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
