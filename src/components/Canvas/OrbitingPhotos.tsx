'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Memory } from '@/data/memories';
import { TextureErrorBoundary } from './TextureErrorBoundary';
import { DustBelt } from './DustBelt';

const TAU = Math.PI * 2;
const BASE_SPEED = 0.045; // radians per second (~2.3 minutes per full turn)
const DRAG_THRESHOLD = 4; // px — ignore clicks that were really drags

const PHOTO_WIDTH = 0.96;
const PHOTO_HEIGHT = 1.28;
const CORNER_RADIUS = 0.08;
const PHOTO_ASPECT = PHOTO_WIDTH / PHOTO_HEIGHT;
const IDLE_OPACITY = 0.3;
const HOVER_OPACITY = 0.95;

const SPARKLE_COLORS = ['#ffe9a8', '#ffb3d1', '#ffffff', '#a9b8ff'] as const;

/** Rounded-rectangle plane with normalized UVs (so the texture maps cleanly). */
function createPhotoGeometry(): THREE.ShapeGeometry {
  const w = PHOTO_WIDTH / 2;
  const h = PHOTO_HEIGHT / 2;
  const r = CORNER_RADIUS;

  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);

  const geometry = new THREE.ShapeGeometry(shape, 8);
  const position = geometry.getAttribute('position');
  const uvs = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uvs[i * 2] = (position.getX(i) + w) / PHOTO_WIDTH;
    uvs[i * 2 + 1] = (position.getY(i) + h) / PHOTO_HEIGHT;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

interface PhotoCardProps {
  memory: Memory;
  index: number;
  total: number;
  geometry: THREE.BufferGeometry;
  angleRef: MutableRefObject<number>;
  radius: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function PhotoCard({
  memory,
  index,
  total,
  geometry,
  angleRef,
  radius,
  isHovered,
  onHover,
  onSelect,
}: PhotoCardProps): React.JSX.Element {
  const source = useTexture(memory.imageUrl);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scaleRef = useRef(1);
  const opacityRef = useRef(IDLE_OPACITY);
  // Tiny per-photo orbit offset so the photos read like a loose asteroid field
  const radiusJitter = 1 + (((index * 7919) % 100) / 100 - 0.5) * 0.16;

  // Per-card texture clone, cropped "cover"-style so any photo shape fills the 3:4 plane
  const texture = useMemo(() => {
    const clone = source.clone();
    const image = source.image as { width: number; height: number } | undefined;
    if (image && image.width > 0 && image.height > 0) {
      const imageAspect = image.width / image.height;
      if (imageAspect > PHOTO_ASPECT) {
        clone.repeat.x = PHOTO_ASPECT / imageAspect;
        clone.offset.x = (1 - clone.repeat.x) / 2;
      } else {
        clone.repeat.y = imageAspect / PHOTO_ASPECT;
        clone.offset.y = (1 - clone.repeat.y) / 2;
      }
    }
    clone.needsUpdate = true;
    return clone;
  }, [source]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const angle = angleRef.current + (index / total) * TAU;
    const r = radius * radiusJitter;
    // Circular orbit in the XZ plane; each photo drifts gently like a small asteroid
    group.position.set(
      Math.cos(angle) * r,
      Math.sin(t * 0.35 + index * 2.1) * 0.22,
      Math.sin(angle) * r,
    );
    // Face the viewer, then add a slow tumble
    group.lookAt(state.camera.position);
    group.rotateZ(Math.sin(t * 0.4 + index) * 0.1);
    group.rotateY(Math.sin(t * 0.3 + index * 1.7) * 0.16);
    group.rotateX(Math.sin(t * 0.25 + index * 0.9) * 0.08);

    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, isHovered ? 1.25 : 1, 8, delta);
    group.scale.setScalar(scaleRef.current);

    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      isHovered ? HOVER_OPACITY : IDLE_OPACITY,
      8,
      delta,
    );
    if (materialRef.current) materialRef.current.opacity = opacityRef.current;
  });

  const handleOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    onHover(memory.id);
  };

  const handleOut = (): void => onHover(null);

  const handleClick = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    if (e.delta > DRAG_THRESHOLD) return;
    onSelect(memory.id);
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {/* Frameless photo, slightly translucent */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={IDLE_OPACITY}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Tiny glowing specks around the photo */}
      <Sparkles
        count={12}
        scale={[PHOTO_WIDTH * 2.2, PHOTO_HEIGHT * 1.7, 1]}
        size={2.2}
        speed={0.35}
        opacity={0.9}
        color={SPARKLE_COLORS[index % SPARKLE_COLORS.length] ?? '#ffffff'}
        raycast={() => null}
      />

      {isHovered && (
        <Html
          center
          position={[0, -0.95, 0.1]}
          distanceFactor={9}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white shadow-lg backdrop-blur-md">
            {memory.title}
          </div>
        </Html>
      )}
    </group>
  );
}

interface OrbitingPhotosProps {
  memories: Memory[];
  /** Freeze the orbit (e.g. while the modal is open). */
  paused: boolean;
  onSelect: (id: string) => void;
}

export function OrbitingPhotos({
  memories,
  paused,
  onSelect,
}: OrbitingPhotosProps): React.JSX.Element {
  const width = useThree((state) => state.size.width);
  const [rawHoveredId, setHoveredId] = useState<string | null>(null);
  // If the hovered memory was deleted, drop the stale id so the orbit doesn't stay frozen
  const hoveredId = memories.some((m) => m.id === rawHoveredId) ? rawHoveredId : null;
  const angleRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);

  const geometry = useMemo(createPhotoGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Responsive orbit size (invisible circle)
  const scale = width < 640 ? 0.68 : width < 1024 ? 0.88 : 1;
  const radius = 5.2 * scale;

  // Pointer cursor feedback
  useEffect(() => {
    document.body.style.cursor = hoveredId ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredId]);

  // Runs before the cards' frame callbacks (negative priority) so they never lag a frame.
  useFrame((_, delta) => {
    const target = paused || hoveredId !== null ? 0 : BASE_SPEED;
    speedRef.current = THREE.MathUtils.damp(speedRef.current, target, 3, delta);
    angleRef.current += speedRef.current * Math.min(delta, 0.05);
  }, -1);

  return (
    <group>
      <DustBelt radius={radius} />
      {memories.map((memory, index) => (
        <TextureErrorBoundary key={memory.id} resetKey={memory.imageUrl}>
          <Suspense fallback={null}>
            <PhotoCard
              memory={memory}
              index={index}
              total={memories.length}
              geometry={geometry}
              angleRef={angleRef}
              radius={radius}
              isHovered={hoveredId === memory.id}
              onHover={setHoveredId}
              onSelect={onSelect}
            />
          </Suspense>
        </TextureErrorBoundary>
      ))}
    </group>
  );
}
