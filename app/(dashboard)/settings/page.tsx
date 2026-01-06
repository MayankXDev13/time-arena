'use client';

import { SettingsForm } from '@/components/settings/SettingsForm';
import { ClearDataDialog } from '@/components/settings/ClearDataDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your preferences</p>
      </div>

      <div className="space-y-6">
        <SettingsForm />

        <Separator className="bg-zinc-800" />

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">
              Clear all your local data. This will delete all sessions and reset your settings.
            </p>
            <ClearDataDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
