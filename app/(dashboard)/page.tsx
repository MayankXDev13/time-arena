'use client';

import { Timer } from '@/components/timer/Timer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-center min-h-screen">
        <Timer />
      </div>
    </div>
  );
}
