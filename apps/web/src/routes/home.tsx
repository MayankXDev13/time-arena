
import { Timer } from "@/components/timer/Timer";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useTimerStore } from "@/stores/useTimerStore";

export default function Home() {
  const { isOpen } = useSidebarStore();
  const mode = useTimerStore((s) => s.mode);

  return (
    <div
      className={`arena-backdrop relative min-h-screen overflow-x-clip transition-all duration-300 ${
        isOpen ? "md:pl-72" : "md:pl-20"
      }`}
      data-mode={mode}
    >
      {/* mockup backdrop: glow + rings + dot grids */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[38%] h-[480px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--arena-ember)] opacity-[0.13] blur-[130px] dark:opacity-[0.22]" />
        <div className="absolute left-1/2 top-[38%] h-[300px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--arena-ember)] opacity-[0.1] blur-[90px] dark:opacity-[0.16]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
        <div className="absolute size-[560px] rounded-full border border-[var(--arena-ember)] opacity-15" />
        <div className="absolute size-[780px] rounded-full border border-[var(--arena-ember)] opacity-10" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-[24%] top-1/2 hidden h-[480px] w-[220px] -translate-y-1/2 lg:block"
        style={{
          backgroundImage: "radial-gradient(var(--arena-ember) 1.1px, transparent 1.1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 72%)",
          opacity: 0.35,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[2%] top-1/2 hidden h-[480px] w-[220px] -translate-y-1/2 lg:block"
        style={{
          backgroundImage: "radial-gradient(var(--arena-ember) 1.1px, transparent 1.1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 72%)",
          opacity: 0.35,
        }}
      />

      <div className="arena-stage relative mx-auto flex min-h-screen w-full max-w-[600px] flex-col px-4 py-8 md:px-8">
        <div className="w-full">
          <section aria-label="Focus timer" className="min-w-0">
            <div className="animate-arena-rise-1 timer-card mx-auto max-w-[540px] rounded-[24px] border border-border/70 bg-card/90 px-4 py-6 shadow-[0_24px_70px_-30px_color-mix(in_srgb,var(--arena-ember)_45%,transparent)] backdrop-blur-sm md:px-8">
              <Timer />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
