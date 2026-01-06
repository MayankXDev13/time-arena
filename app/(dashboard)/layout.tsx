'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
