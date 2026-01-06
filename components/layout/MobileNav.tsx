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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-orange-500' : 'text-zinc-500'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
