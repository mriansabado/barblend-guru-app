"use client";

import { cn } from "@/lib/cn";

const blobs = [
  { className: "left-[8%] top-[12%] h-28 w-28 bg-bar-coral/25", delay: "" },
  { className: "right-[12%] top-[18%] h-36 w-36 bg-bar-mango/30", delay: "animate-float-delayed" },
  { className: "left-[35%] bottom-[25%] h-32 w-32 bg-bar-teal/20", delay: "animate-float" },
  { className: "right-[30%] top-[55%] h-24 w-24 bg-bar-pink/25", delay: "animate-float-delayed" },
];

const floaters = [
  { kind: "ice", left: "12%", top: "20%", delay: "0s", dur: "7s" },
  { kind: "orange", left: "78%", top: "28%", delay: "1s", dur: "6s" },
  { kind: "kiwi", left: "45%", top: "65%", delay: "0.5s", dur: "8s" },
  { kind: "ice", left: "62%", top: "72%", delay: "2s", dur: "7.5s" },
  { kind: "orange", left: "22%", top: "58%", delay: "1.5s", dur: "6.5s" },
  { kind: "kiwi", left: "88%", top: "52%", delay: "0.8s", dur: "9s" },
  { kind: "ice", left: "35%", top: "35%", delay: "2.2s", dur: "8s" },
  { kind: "orange", left: "55%", top: "18%", delay: "0.3s", dur: "7s" },
  { kind: "kiwi", left: "8%", top: "78%", delay: "1.2s", dur: "8.5s" },
] as const;

function FallbackGarnish({ kind }: { kind: (typeof floaters)[number]["kind"] }) {
  if (kind === "ice") {
    return (
      <div className="relative h-16 w-[4.5rem] rotate-12">
        <div className="absolute inset-0 rounded-xl border border-white/50 bg-gradient-to-br from-white/55 via-sky-100/35 to-cyan-200/25 shadow-xl backdrop-blur-sm" />
        <div className="absolute left-2 top-2 h-5 w-6 rounded-md border border-white/40 bg-white/30" />
        <div className="absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-white/45" />
        <div className="absolute left-5 bottom-4 h-1.5 w-1.5 rounded-full bg-white/35" />
      </div>
    );
  }
  if (kind === "orange") {
    return (
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg" />
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-[38%] w-[1.5px] origin-bottom bg-orange-100/80"
            style={{ transform: `translate(-50%, -100%) rotate(${i * 45}deg)` }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50" />
      </div>
    );
  }
  return (
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-lime-300 to-lime-600 shadow-lg" />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-100" />
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const r = 28;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        return (
          <div
            key={i}
            className="absolute h-1 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

export function HeroFallback({ animate = true }: { animate?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="bg-party absolute inset-0" />
      {animate &&
        blobs.map((b, i) => (
          <div
            key={i}
            className={cn("absolute rounded-full blur-3xl", b.className, b.delay)}
          />
        ))}
      {animate &&
        floaters.map((f, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-50"
            style={{
              left: f.left,
              top: f.top,
              animationDuration: f.dur,
              animationDelay: f.delay,
            }}
          >
            <FallbackGarnish kind={f.kind} />
          </div>
        ))}
    </div>
  );
}
