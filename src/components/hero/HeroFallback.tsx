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
  { kind: "cherry", left: "78%", top: "28%", delay: "1s", dur: "6s" },
  { kind: "pineapple", left: "45%", top: "65%", delay: "0.5s", dur: "8s" },
  { kind: "ice", left: "62%", top: "72%", delay: "2s", dur: "7.5s" },
  { kind: "cherry", left: "22%", top: "58%", delay: "1.5s", dur: "6.5s" },
  { kind: "pineapple", left: "88%", top: "52%", delay: "0.8s", dur: "9s" },
  { kind: "ice", left: "35%", top: "35%", delay: "2.2s", dur: "8s" },
  { kind: "cherry", left: "55%", top: "18%", delay: "0.3s", dur: "7s" },
  { kind: "pineapple", left: "8%", top: "78%", delay: "1.2s", dur: "8.5s" },
] as const;

function FallbackGarnish({ kind }: { kind: (typeof floaters)[number]["kind"] }) {
  if (kind === "ice") {
    return (
      <div className="h-7 w-8 rotate-12 rounded-md border border-white/40 bg-gradient-to-br from-white/50 to-sky-200/30 shadow-lg backdrop-blur-sm" />
    );
  }
  if (kind === "cherry") {
    return (
      <div className="relative">
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-md" />
        <div className="absolute -top-3 left-2 h-3 w-0.5 rotate-[25deg] rounded-full bg-green-700" />
      </div>
    );
  }
  return (
    <div
      className="h-8 w-8 rounded-full border-[5px] border-amber-400/80 bg-amber-100/20 shadow-md"
      style={{ clipPath: "polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%)" }}
    />
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
            className="absolute animate-float opacity-40"
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
