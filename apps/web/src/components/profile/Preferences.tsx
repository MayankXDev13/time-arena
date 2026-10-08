
import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useTimerStore } from "@/stores/useTimerStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function Preferences() {
  const { settings, updateSettings, isLoading } = useProfile();
  const { setBreakDuration, setWorkDuration } = useTimerStore();

  // Drafts keep keystrokes local; a single PATCH commits 600ms after the
  // last change (or immediately on blur/unmount) instead of per keystroke.
  // The Saving… flag tracks the actual in-flight request and clears on
  // settle — never lingering on merely-dirty state.
  const [focusDraft, setFocusDraft] = useState<string | null>(null);
  const [breakDraft, setBreakDraft] = useState<string | null>(null);
  const [savingFocus, setSavingFocus] = useState(false);
  const [savingBreak, setSavingBreak] = useState(false);
  const updateSettingsRef = useRef(updateSettings);
  updateSettingsRef.current = updateSettings;
  const commitFocus = useDebouncedCallback(async (value: number) => {
    setSavingFocus(true);
    try {
      await updateSettingsRef.current({ defaultTimerMinutes: value });
    } finally {
      setSavingFocus(false);
    }
  }, 600);
  const commitBreak = useDebouncedCallback(async (value: number) => {
    setSavingBreak(true);
    try {
      await updateSettingsRef.current({ breakDurationMinutes: value });
    } finally {
      setSavingBreak(false);
    }
  }, 600);

  useEffect(
    () => () => {
      commitFocus.flush();
      commitBreak.flush();
    },
    [commitFocus.flush, commitBreak.flush],
  );

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
                  commitFocus.call(Math.min(120, Math.max(5, parsed)));
                }
              }}
              onBlur={() => {
                if (focusDraft === null || focusDraft === "" || Number.isNaN(parseInt(focusDraft))) {
                  setFocusDraft(null);
                }
                commitFocus.flush();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Duration for new timer sessions (5-120 min)
              {savingFocus && <span> · Saving…</span>}
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
                  commitBreak.call(Math.min(30, Math.max(1, parsed)));
                }
              }}
              onBlur={() => {
                if (breakDraft === null || breakDraft === "" || Number.isNaN(parseInt(breakDraft))) {
                  setBreakDraft(null);
                }
                commitBreak.flush();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Duration for break sessions (1-30 min)
              {savingBreak && <span> · Saving…</span>}
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
        </div>
      </CardContent>
    </Card>
  );
}
