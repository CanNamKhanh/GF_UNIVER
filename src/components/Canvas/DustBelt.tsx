'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createDotTexture } from '@/lib/dotTexture';

const DUST_COUNT = 700;

interface DustBeltProps {
  radius: number;
}

/** A faint ring of drifting dust along the (otherwise invisible) orbit. */
export function DustBelt({ radius }: DustBeltProps): React.JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(createDotTexture, []);

  const geometry = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.9 + Math.random() * 0.2);
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return result;
  }, [radius]);

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture],
  );

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={pointsRef} geometry={geometry} raycast={() => null}>
      <pointsMaterial
        map={texture}
        color="#cfd6ff"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
