import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Timer } from "@/components/timer/Timer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex items-center justify-center overflow-hidden">
        <Timer />
      </main>
      <MobileNav />
    </div>
  );
}
