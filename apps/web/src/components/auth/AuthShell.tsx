import { Link } from "react-router-dom";
import { Timer } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  bottomNote,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  bottomNote?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0d13] px-4 py-12 text-white">
      {/* ambient orange glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b33c0e]/30 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e86a2c]/20 blur-[100px]" />
      </div>

      {/* concentric rings */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute size-[560px] rounded-full border border-[#e86a2c]/20" />
        <div className="absolute size-[760px] rounded-full border border-[#e86a2c]/10" />
        <div className="absolute size-[980px] rounded-full border border-white/[0.04]" />
      </div>

      {/* dot grids left / right */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[4%] top-1/2 hidden h-[520px] w-[280px] -translate-y-1/2 md:block"
        style={{
          backgroundImage: "radial-gradient(#e86a2c 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 75%)",
          opacity: 0.45,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[4%] top-1/2 hidden h-[520px] w-[280px] -translate-y-1/2 md:block"
        style={{
          backgroundImage: "radial-gradient(#e86a2c 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 75%)",
          opacity: 0.45,
        }}
      />

      {/* centered card */}
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#12151d]/95 px-6 py-8 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-8">
        <Link to="/" className="flex items-center justify-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-[#f0642b]">
            <Timer className="size-5 text-black" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[22px] font-bold tracking-tight">Time Arena</span>
        </Link>

        <p className="mt-7 text-center text-[11px] font-bold uppercase tracking-[0.32em] text-[#f0642b]">
          {eyebrow}
        </p>
        <h1 className="font-display mt-2 text-center text-[30px] font-bold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-center text-[14px] leading-relaxed text-white/60">
          {description}
        </p>

        <div className="mt-6">{children}</div>

        {bottomNote && (
          <p className="mt-5 text-center text-sm text-white/60">{bottomNote}</p>
        )}
      </div>
    </div>
  );
}
