'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PiTimer, PiClockCounterClockwise, PiGear, PiChartBar } from 'react-icons/pi';

const navItems = [
  { href: '/', label: 'Timer', icon: PiTimer },
  { href: '/stats', label: 'Stats', icon: PiChartBar },
  { href: '/history', label: 'History', icon: PiClockCounterClockwise },
  { href: '/settings', label: 'Settings', icon: PiGear },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 max-w-a border-r border-zinc-800 bg-zinc-900/50">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
