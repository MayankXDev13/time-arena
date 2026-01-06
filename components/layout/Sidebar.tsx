'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PiTimerBold, PiChartBar, PiGear } from 'react-icons/pi';

const navItems = [
  { href: '/', label: 'Timer', icon: PiTimerBold },
  { href: '/stats', label: 'Stats', icon: PiChartBar },
  { href: '/settings', label: 'Settings', icon: PiGear },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col min-h-screen border-r border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black/50 backdrop-blur-md">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
            <PiTimerBold className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Timer Arena</h1>
            <p className="text-xs text-zinc-400">Focus & Track</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group',
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:translate-x-1'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-all duration-300',
                isActive ? 'text-orange-400' : 'group-hover:scale-110'
              )} />
              <span className={cn(
                'transition-all duration-300',
                isActive ? 'font-semibold' : ''
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Built for productivity
        </p>
      </div>
    </aside>
  );
}
