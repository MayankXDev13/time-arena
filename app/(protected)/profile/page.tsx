"use client";

import { useSidebarStore } from "@/stores/useSidebarStore";

export default function ProfilePage() {
  const { isOpen } = useSidebarStore();

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${
      isOpen ? "md:pl-64" : "md:pl-0"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-muted-foreground text-center py-8">
            Profile settings coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
