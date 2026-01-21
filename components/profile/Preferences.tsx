"use client";

import { useProfile } from "@/hooks/useProfile";
import { useThemeStore } from "@/stores/useThemeStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Preferences() {
  const { settings, updateSettings, isLoading } = useProfile();
  const { setTheme } = useThemeStore();

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value });
    if (value === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    } else {
      setTheme(value as "light" | "dark");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Timer (minutes)</label>
            <Input
              type="number"
              min={5}
              max={120}
              value={settings.defaultTimerMinutes ?? 25}
              onChange={(e) =>
                updateSettings({ defaultTimerMinutes: parseInt(e.target.value) || 25 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Duration for new timer sessions (5-120 min)
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Streak Threshold (minutes/day)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.streakThresholdMinutes}
              onChange={(e) =>
                updateSettings({ streakThresholdMinutes: parseInt(e.target.value) || 15 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Minimum minutes to qualify for streak (1-60 min)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Auto-start Breaks</label>
              <p className="text-sm text-muted-foreground">
                Automatically start break timer after focus session
              </p>
            </div>
            <Switch
              checked={settings.autoStartBreaks ?? true}
              onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Sound Notifications</label>
              <p className="text-sm text-muted-foreground">
                Play sound when timer completes
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled ?? true}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Theme</label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <Select
              value={settings.theme ?? "system"}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
