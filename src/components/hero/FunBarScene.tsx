"use client";

import { RoundedBox, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface FunBarSceneProps {
  reducedMotion: boolean;
  surprisePulse: number;
}

type GarnishKind = "ice" | "cherry" | "pineapple";

interface GarnishParticle {
  kind: GarnishKind;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  drift: THREE.Vector3;
  spin: THREE.Vector3;
  phase: number;
}

const KINDS: GarnishKind[] = ["ice", "cherry", "pineapple"];

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function scaleForKind(kind: GarnishKind) {
  switch (kind) {
    case "ice":
      return randomInRange(0.16, 0.34);
    case "cherry":
      return randomInRange(0.14, 0.26);
    case "pineapple":
      return randomInRange(0.28, 0.48);
  }
}

function createGarnishes(count: number): GarnishParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const kind = KINDS[i % KINDS.length];
    return {
      kind,
      position: new THREE.Vector3(
        randomInRange(-5, 5),
        randomInRange(-3.5, 3.5),
        randomInRange(-4, 1.2)
      ),
      rotation: new THREE.Euler(
        randomInRange(0, Math.PI),
        randomInRange(0, Math.PI),
        randomInRange(0, Math.PI)
      ),
      scale: scaleForKind(kind),
      drift: new THREE.Vector3(
        randomInRange(-0.05, 0.05),
        randomInRange(-0.04, 0.04),
        randomInRange(-0.03, 0.03)
      ),
      spin: new THREE.Vector3(
        randomInRange(-0.12, 0.12),
        randomInRange(-0.14, 0.14),
        randomInRange(-0.1, 0.1)
      ),
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function useFloatMotion(
  ref: React.RefObject<THREE.Group>,
  particle: GarnishParticle,
  reducedMotion: boolean
) {
  const basePos = useRef(particle.position.clone());

  useFrame((state) => {
    const group = ref.current;
    if (!group || reducedMotion) return;

    const t = state.clock.elapsedTime;
    const { drift, spin, phase } = particle;

    group.position.x =
      basePos.current.x + Math.sin(t * 0.18 + phase) * 0.4 + drift.x * t * 0.12;
    group.position.y =
      basePos.current.y + Math.sin(t * 0.15 + phase * 1.3) * 0.35 + drift.y * t * 0.08;
    group.position.z =
      basePos.current.z + Math.cos(t * 0.16 + phase) * 0.25 + drift.z * t * 0.06;

    group.rotation.x += spin.x * 0.006;
    group.rotation.y += spin.y * 0.006;
    group.rotation.z += spin.z * 0.006;
  });
}

function IceCube({
  particle,
  reducedMotion,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFloatMotion(ref, particle, reducedMotion);

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={particle.scale}
    >
      <RoundedBox args={[1, 0.78, 0.9]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#eefaff"
          roughness={0.08}
          metalness={0.02}
          transmission={0.62}
          thickness={0.4}
          ior={1.31}
          transparent
          opacity={0.82}
          clearcoat={0.4}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>
    </group>
  );
}

function Cherry({
  particle,
  reducedMotion,
  pulseRef,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
  pulseRef: React.RefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  useFloatMotion(ref, particle, reducedMotion);

  useFrame(() => {
    if (!bodyMat.current) return;
    const pulse = pulseRef.current ?? 0;
    bodyMat.current.emissiveIntensity = 0.05 + pulse * 0.35;
  });

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={particle.scale}
    >
      <mesh>
        <sphereGeometry args={[0.44, 20, 20]} />
        <meshStandardMaterial
          ref={bodyMat}
          color="#b91c1c"
          roughness={0.35}
          emissive="#7f1d1d"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[0.12, 0.38, 0.08]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fecaca" roughness={0.3} />
      </mesh>
      <mesh position={[0.04, 0.62, 0]} rotation={[0.15, 0.2, 0.45]}>
        <cylinderGeometry args={[0.028, 0.022, 0.38, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
    </group>
  );
}

function PineappleSlice({
  particle,
  reducedMotion,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFloatMotion(ref, particle, reducedMotion);

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={particle.scale}
    >
      <mesh rotation={[Math.PI / 2, 0.2, 0]}>
        <ringGeometry args={[0.2, 1, 36, 1, 0.2, Math.PI * 0.72]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.55}
          emissive="#d97706"
          emissiveIntensity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.2, 0]} position={[0, 0, 0.01]}>
        <ringGeometry args={[0.2, 0.32, 24, 1, 0.2, Math.PI * 0.72]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[0.35, 0.55, 0.75].map((r, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(0.8 + idx * 0.35) * r * 0.55, 0.05, Math.sin(0.8 + idx * 0.35) * r * 0.55]}
        >
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingGarnish({
  particle,
  reducedMotion,
  pulseRef,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
  pulseRef: React.RefObject<number>;
}) {
  switch (particle.kind) {
    case "ice":
      return <IceCube particle={particle} reducedMotion={reducedMotion} />;
    case "cherry":
      return (
        <Cherry particle={particle} reducedMotion={reducedMotion} pulseRef={pulseRef} />
      );
    case "pineapple":
      return <PineappleSlice particle={particle} reducedMotion={reducedMotion} />;
  }
}

export function FunBarScene({ reducedMotion, surprisePulse }: FunBarSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(0);

  const garnishes = useMemo(() => createGarnishes(36), []);

  useEffect(() => {
    pulseRef.current = 1;
  }, [surprisePulse]);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    pulseRef.current = Math.max(0, pulseRef.current - delta * 0.6);
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.current.x * 0.05,
      0.035
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.current.y * 0.035,
      0.035
    );
  });

  return (
    <>
      <ambientLight intensity={0.68} color="#ffe8d6" />
      <pointLight position={[4, 3, 2]} intensity={0.95} color="#ffb347" />
      <pointLight position={[-4, -2, 1]} intensity={0.75} color="#ff6b6b" />
      <pointLight position={[0, 0, 3]} intensity={0.45} color="#2dd4bf" />
      <fog attach="fog" args={["#2a1638", 4.5, 14]} />

      {!reducedMotion && (
        <Sparkles count={35} scale={[12, 8, 6]} size={1.2} speed={0.12} opacity={0.25} color="#ffd699" />
      )}

      <group ref={groupRef}>
        {garnishes.map((g, i) => (
          <FloatingGarnish
            key={`${g.kind}-${i}`}
            particle={g}
            reducedMotion={reducedMotion}
            pulseRef={pulseRef}
          />
        ))}
      </group>
    </>
  );
}
