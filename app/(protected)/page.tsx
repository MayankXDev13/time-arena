"use client";

import { Timer } from "@/components/timer/Timer";
import { useSidebarStore } from "@/stores/useSidebarStore";

export default function Home() {
  const { isOpen } = useSidebarStore();

  return (
    <div className={`h-screen flex items-center justify-center overflow-hidden transition-all duration-300 ${
      isOpen ? "md:pl-64" : "md:pl-0"
    }`}>
      <Timer />
    </div>
  );
}
