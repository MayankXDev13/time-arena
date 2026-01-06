'use client';

import { Timer } from '@/components/timer/Timer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent mb-6">
            Timer Arena
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light">
            Focus. Track. Improve.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Timer />
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-zinc-500">
            Built with precision for productivity
          </p>
        </div>
      </div>
    </div>
  );
}
