'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSessionStore } from '@/stores/useSessionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { PiTrash, PiWarning } from 'react-icons/pi';

export function ClearDataDialog() {
  const { setSessions } = useSessionStore();
  const { setSettings } = useSettingsStore();
  const [open, setOpen] = useState(false);

  const handleClearData = () => {
    setSessions([]);
    setSettings({
      userId: '',
      streakThresholdMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-500/10">
          <PiTrash className="w-4 h-4 mr-2" />
          Clear All Data
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <PiWarning className="w-5 h-5 text-orange-500" />
            Clear All Data
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            This will permanently delete all your sessions and settings. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
            Clear Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
