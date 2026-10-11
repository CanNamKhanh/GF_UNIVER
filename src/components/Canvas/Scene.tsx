'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { Memory } from '@/data/memories';
import { OrbitingPhotos } from './OrbitingPhotos';

const MIN_DISTANCE = 4;
const MAX_DISTANCE = 24;
const ZOOM_STEP = 1.3; // each button press changes the distance by this factor

export interface ZoomCommand {
  /** Increment for every button press so repeated presses are detected. */
  seq: number;
  /** 1 = zoom in, -1 = zoom out */
  direction: 1 | -1;
}

/** Pulls the camera back on small screens so the whole orbit stays visible. */
function ResponsiveCamera(): null {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const tier = width < 640 ? 0 : width < 1024 ? 1 : 2;

  useEffect(() => {
    const distance = [14, 11.5, 10][tier] ?? 10;
    camera.position.set(0, 2.2, distance);
    camera.updateProjectionMatrix();
  }, [camera, tier]);

  return null;
}

/** Smoothly dollies the camera toward/away from the center for the on-screen +/- buttons. */
function ZoomController({ command }: { command: ZoomCommand | null }): null {
  const camera = useThree((state) => state.camera);
  const remaining = useRef(0); // log-space distance still to travel
  const lastSeq = useRef(0);

  useEffect(() => {
    if (!command || command.seq === lastSeq.current) return;
    lastSeq.current = command.seq;
    remaining.current += command.direction * Math.log(ZOOM_STEP);
  }, [command]);

  useFrame((_, delta) => {
    if (Math.abs(remaining.current) < 0.0005) {
      remaining.current = 0;
      return;
    }
    const step = remaining.current * (1 - Math.exp(-8 * delta));
    remaining.current -= step;

    const distance = camera.position.length();
    const next = THREE.MathUtils.clamp(distance * Math.exp(-step), MIN_DISTANCE, MAX_DISTANCE);
    camera.position.multiplyScalar(next / distance);
  });

  return null;
}

export interface SceneProps {
  memories: Memory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoomCommand: ZoomCommand | null;
}

export function Scene({
  memories,
  selectedId,
  onSelect,
  zoomCommand,
}: SceneProps): React.JSX.Element {
  const isModalOpen = selectedId !== null;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2.2, 10], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ResponsiveCamera />
      <ZoomController command={zoomCommand} />

      {/* Depth layers on top of the backdrop: a few real 3D stars + glitter */}
      <Stars radius={90} depth={60} count={2200} factor={3} saturation={0} fade speed={1.2} />
      <Sparkles count={140} scale={[40, 24, 40]} size={2.2} speed={0.22} opacity={0.85} color="#ffffff" raycast={() => null} />

      <Suspense fallback={null}>
        <OrbitingPhotos
          memories={memories}
          paused={isModalOpen}
          onSelect={onSelect}
        />
      </Suspense>

      <OrbitControls
        enabled={!isModalOpen}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        zoomSpeed={0.7}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
        rotateSpeed={0.55}
      />
    </Canvas>
  );
}
