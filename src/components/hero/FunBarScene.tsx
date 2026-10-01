"use client";

import { RoundedBox, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { introElapsedSeconds } from "@/lib/intro";

interface FunBarSceneProps {
  reducedMotion: boolean;
  surprisePulse: number;
  isMobile?: boolean;
}

type GarnishKind = "ice" | "orange" | "kiwi";

interface GarnishParticle {
  kind: GarnishKind;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  drift: THREE.Vector3;
  spin: THREE.Vector3;
  phase: number;
  introDelay: number;
}

const KINDS: GarnishKind[] = ["ice", "orange", "kiwi"];

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function scaleForKind(kind: GarnishKind) {
  switch (kind) {
    case "ice":
      return randomInRange(0.42, 0.72);
    case "orange":
      return randomInRange(0.45, 0.7);
    case "kiwi":
      return randomInRange(0.4, 0.65);
  }
}

function easeOutBack(k: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
}

function createGarnishes(count: number): GarnishParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const kind = KINDS[i % KINDS.length];
    return {
      kind,
      introDelay: (i / Math.max(count - 1, 1)) * 0.42,
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
  reducedMotion: boolean,
  options: { spin?: boolean } = {}
) {
  const basePos = useRef(particle.position.clone());
  const allowSpin = options.spin !== false;

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const pop = reducedMotion
      ? 1
      : easeOutBack(
          THREE.MathUtils.clamp(
            (introElapsedSeconds() - particle.introDelay) / 0.38,
            0,
            1
          )
        );
    group.scale.setScalar(particle.scale * pop);

    if (reducedMotion) return;

    const { drift, spin, phase } = particle;

    group.position.x =
      basePos.current.x + Math.sin(t * 0.18 + phase) * 0.4 + drift.x * t * 0.12;
    group.position.y =
      basePos.current.y + Math.sin(t * 0.15 + phase * 1.3) * 0.35 + drift.y * t * 0.08;
    group.position.z =
      basePos.current.z + Math.cos(t * 0.16 + phase) * 0.25 + drift.z * t * 0.06;

    if (allowSpin) {
      group.rotation.x += spin.x * 0.006;
      group.rotation.y += spin.y * 0.006;
      group.rotation.z += spin.z * 0.006;
    }
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

  const bubbles = useMemo(
    () =>
      [
        { pos: [0.18, 0.12, 0.15] as const, r: 0.07 },
        { pos: [-0.22, -0.08, 0.1] as const, r: 0.05 },
        { pos: [0.05, -0.18, -0.2] as const, r: 0.06 },
        { pos: [-0.1, 0.2, -0.12] as const, r: 0.04 },
      ],
    []
  );

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={reducedMotion ? particle.scale : 0}
    >
      {/* Main translucent cube */}
      <RoundedBox args={[1.3, 1.08, 1.2]} radius={0.16} smoothness={6}>
        <meshPhysicalMaterial
          color="#eefaff"
          roughness={0.06}
          metalness={0.02}
          transmission={0.72}
          thickness={0.55}
          ior={1.31}
          transparent
          opacity={0.78}
          clearcoat={0.55}
          clearcoatRoughness={0.12}
          attenuationColor="#b8e8f5"
          attenuationDistance={1.2}
        />
      </RoundedBox>
      {/* Inner core — denser ice */}
      <RoundedBox args={[0.82, 0.66, 0.74]} radius={0.09} smoothness={4}>
        <meshPhysicalMaterial
          color="#d9f4ff"
          roughness={0.12}
          transmission={0.45}
          thickness={0.3}
          ior={1.33}
          transparent
          opacity={0.35}
        />
      </RoundedBox>
      {/* Frosted edge chip */}
      <RoundedBox
        args={[0.48, 0.36, 0.42]}
        radius={0.07}
        smoothness={3}
        position={[0.42, 0.36, 0.32]}
        rotation={[0.35, 0.5, 0.2]}
      >
        <meshPhysicalMaterial
          color="#f5fcff"
          roughness={0.25}
          transmission={0.5}
          thickness={0.2}
          transparent
          opacity={0.55}
        />
      </RoundedBox>
      {/* Trapped air bubbles */}
      {bubbles.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.r, 10, 10]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.1}
            transmission={0.9}
            thickness={0.05}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function OrangeSlice({
  particle,
  reducedMotion,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFloatMotion(ref, particle, reducedMotion, { spin: false });

  const segments = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  const faceY = 0.095;

  const FaceDetails = ({ y, flip }: { y: number; flip?: boolean }) => (
    <group position={[0, y, 0]} scale={[1, flip ? -1 : 1, 1]}>
      {/* Bright cut face */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.64, 48]} />
        <meshStandardMaterial color="#fdba74" roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Segment membranes + pulp — same layout as the earlier good face, flush */}
      {segments.map((i) => {
        const angle = (i / segments.length) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, -angle, 0]}>
            <mesh position={[0.3, 0.002, 0]}>
              <boxGeometry args={[0.48, 0.003, 0.018]} />
              <meshStandardMaterial color="#ffedd5" roughness={0.45} />
            </mesh>
            <mesh position={[0.34, 0.0015, 0]}>
              <boxGeometry args={[0.36, 0.002, 0.1]} />
              <meshStandardMaterial
                color="#f97316"
                roughness={0.4}
                transparent
                opacity={0.65}
              />
            </mesh>
          </group>
        );
      })}
      {/* Center pith */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 20]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={reducedMotion ? particle.scale : 0}
    >
      <mesh>
        <cylinderGeometry args={[0.65, 0.65, 0.18, 48]} />
        <meshStandardMaterial color="#f97316" roughness={0.42} />
      </mesh>
      <FaceDetails y={faceY} />
      <FaceDetails y={-faceY} flip />
    </group>
  );
}

function KiwiSlice({
  particle,
  reducedMotion,
}: {
  particle: GarnishParticle;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFloatMotion(ref, particle, reducedMotion, { spin: false });

  const faceY = 0.095;
  const rays = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const seeds = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2 + (i % 2) * 0.08;
      const r = 0.26 + (i % 3) * 0.04;
      return { angle, r };
    });
  }, []);

  const FaceDetails = ({ y, flip }: { y: number; flip?: boolean }) => (
    <group position={[0, y, 0]} scale={[1, flip ? -1 : 1, 1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.61, 48]} />
        <meshStandardMaterial color="#84cc16" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {rays.map((i) => {
        const angle = (i / rays.length) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.3, 0.001, Math.sin(angle) * 0.3]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.1, 0.002, 0.34]} />
            <meshStandardMaterial color="#a3e635" roughness={0.45} transparent opacity={0.5} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshStandardMaterial color="#f7fee7" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.75, 1]}>
        <circleGeometry args={[0.1, 20]} />
        <meshStandardMaterial color="#ecfccb" roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {seeds.map((s, i) => (
        <mesh
          key={i}
          position={[Math.cos(s.angle) * s.r, 0.0035, Math.sin(s.angle) * s.r]}
          rotation={[-Math.PI / 2, 0, s.angle]}
          scale={[1.6, 0.7, 1]}
        >
          <circleGeometry args={[0.022, 8]} />
          <meshStandardMaterial color="#1c1917" roughness={0.65} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group
      ref={ref}
      position={particle.position}
      rotation={particle.rotation}
      scale={reducedMotion ? particle.scale : 0}
    >
      <mesh>
        <cylinderGeometry args={[0.62, 0.62, 0.18, 48]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.45} />
      </mesh>
      <FaceDetails y={faceY} />
      <FaceDetails y={-faceY} flip />
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
    case "orange":
      return <OrangeSlice particle={particle} reducedMotion={reducedMotion} />;
    case "kiwi":
      return <KiwiSlice particle={particle} reducedMotion={reducedMotion} />;
  }
}

export function FunBarScene({ reducedMotion, surprisePulse, isMobile = false }: FunBarSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(0);

  const garnishes = useMemo(() => createGarnishes(isMobile ? 28 : 36), [isMobile]);

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
      pointer.current.x * 0.14,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.current.y * 0.09,
      0.05
    );
  });

  return (
    <>
      <ambientLight intensity={0.68} color="#ffe8d6" />
      <pointLight position={[4, 3, 2]} intensity={0.95} color="#ffb347" />
      <pointLight position={[-4, -2, 1]} intensity={0.75} color="#ff6b6b" />
      <pointLight position={[0, 0, 3]} intensity={0.45} color="#2dd4bf" />
      <fog attach="fog" args={["#553070", 4.5, 14]} />

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
