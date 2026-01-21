import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 md:transition-all md:duration-300 overflow-hidden">
          {children}
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
