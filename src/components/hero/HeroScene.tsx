"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { FunBarScene } from "./FunBarScene";
import { HeroFallback } from "./HeroFallback";

interface HeroSceneProps {
  surprisePulse: number;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroScene({ surprisePulse }: HeroSceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [veilOn, setVeilOn] = useState(false);

  useEffect(() => {
    setWebglOk(supportsWebGL());
    setIsMobile(window.innerWidth < 768);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setVeilOn(mq.matches);
    const onMotion = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMotion);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    const veilTimer = window.setTimeout(() => setVeilOn(true), 800);
    return () => {
      mq.removeEventListener("change", onMotion);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(veilTimer);
    };
  }, []);

  if (!webglOk || reducedMotion) {
    return <HeroFallback animate />;
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <HeroFallback animate={!ready} />
      <div
        className={`drink-tint absolute inset-0 transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <Canvas
          camera={{
            position: [0, 0, isMobile ? 2.05 : 2.8],
            fov: isMobile ? 64 : 58,
            near: 0.1,
            far: 20,
          }}
          dpr={isMobile ? [1, 1.25] : [1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            setReady(true);
          }}
        >
          <Suspense fallback={null}>
            <FunBarScene
              reducedMotion={reducedMotion}
              surprisePulse={surprisePulse}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </div>
      <div
        className={`readability-veil absolute inset-0 transition-opacity duration-1000 ${
          veilOn ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
