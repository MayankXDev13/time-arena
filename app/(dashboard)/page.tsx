'use client';

import { Timer } from '@/components/timer/Timer';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Timer />
      </div>
    </div>
  );
}
