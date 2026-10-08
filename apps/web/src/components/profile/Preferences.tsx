
import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Preferences() {
  const { settings, updateSettings, isLoading } = useProfile();
  const { setTheme } = useThemeStore();
  const { setBreakDuration, setWorkDuration } = useTimerStore();

  // Drafts keep keystrokes local; a single PATCH commits 600ms after the
  // last change (or immediately on blur/unmount) instead of per keystroke.
  const [focusDraft, setFocusDraft] = useState<string | null>(null);
  const [breakDraft, setBreakDraft] = useState<string | null>(null);
  const updateSettingsRef = useRef(updateSettings);
  updateSettingsRef.current = updateSettings;
  const commit = useDebouncedCallback(
    (patch: { defaultTimerMinutes?: number; breakDurationMinutes?: number }) =>
      void updateSettingsRef.current(patch),
    600,
  );

  useEffect(() => () => commit.flush(), [commit.flush]);

  // A draft reconciles once the server echoes the same value back.
  useEffect(() => {
    if (
      focusDraft !== null &&
      parseInt(focusDraft) === (settings?.defaultTimerMinutes ?? 25)
    ) {
      setFocusDraft(null);
    }
    if (
      breakDraft !== null &&
      parseInt(breakDraft) === (settings?.breakDurationMinutes ?? 5)
    ) {
      setBreakDraft(null);
    }
  }, [settings, focusDraft, breakDraft]);

  const focusDirty = focusDraft !== null;
  const breakDirty = breakDraft !== null;

  useEffect(() => {
    if (settings?.breakDurationMinutes) {
      setBreakDuration(settings.breakDurationMinutes);
    }
    if (settings?.defaultTimerMinutes) {
      setWorkDuration(settings.defaultTimerMinutes);
    }
  }, [settings?.breakDurationMinutes, settings?.defaultTimerMinutes, setBreakDuration, setWorkDuration]);

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
              value={focusDraft ?? (settings.defaultTimerMinutes ?? 25)}
              onChange={(e) => {
                const raw = e.target.value;
                setFocusDraft(raw);
                const parsed = parseInt(raw);
                if (!Number.isNaN(parsed)) {
                  commit.call({
                    defaultTimerMinutes: Math.min(120, Math.max(5, parsed)),
                  });
                }
              }}
              onBlur={() => {
                if (focusDraft === null || focusDraft === "" || Number.isNaN(parseInt(focusDraft))) {
                  setFocusDraft(null);
                }
                commit.flush();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Duration for new timer sessions (5-120 min)
              {focusDirty && <span> · Saving…</span>}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Break Duration (minutes)</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={breakDraft ?? (settings.breakDurationMinutes ?? 5)}
              onChange={(e) => {
                const raw = e.target.value;
                setBreakDraft(raw);
                const parsed = parseInt(raw);
                if (!Number.isNaN(parsed)) {
                  commit.call({
                    breakDurationMinutes: Math.min(30, Math.max(1, parsed)),
                  });
                }
              }}
              onBlur={() => {
                if (breakDraft === null || breakDraft === "" || Number.isNaN(parseInt(breakDraft))) {
                  setBreakDraft(null);
                }
                commit.flush();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Duration for break sessions (1-30 min)
              {breakDirty && <span> · Saving…</span>}
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
