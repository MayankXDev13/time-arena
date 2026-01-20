import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Timer } from "@/components/timer/Timer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-16 pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Timer />
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
