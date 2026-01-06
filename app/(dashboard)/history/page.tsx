'use client';

import { SessionList } from '@/components/sessions/SessionList';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Session History</h1>
        <p className="text-zinc-400">View your past sessions</p>
      </div>

      <SessionList />
    </div>
  );
}
