'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useProgress } from '@react-three/drei';
import { animate } from 'framer-motion';
import * as THREE from 'three';
import { useSplash } from '../SplashProvider';

function ProgressReporter({ onReady }: { onReady: () => void }) {
  const { progress } = useProgress();
  const { setPageReady } = useSplash();

  useEffect(() => {
    if (progress === 100) {
      setPageReady(true);
      onReady();
    }
  }, [progress, setPageReady, onReady]);

  return null;
}

function Model({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF('/models/heart.glb');
  const scale = isMobile ? 1.5 : 1.7;
  const posY = isMobile ? -0.9 : -0.8;
  return <primitive object={scene} scale={scale} position={[0, posY, 0]} />;
}

// Sudut terpendek dari a ke b (menghindari "muter jauh" saat autoRotate
// sudah menggeser theta berkali-kali putaran sebelum user melepas drag).
function shortestAngle(a: number, b: number) {
  const twoPi = Math.PI * 2;
  let diff = (b - a) % twoPi;
  if (diff > Math.PI) diff -= twoPi;
  if (diff < -Math.PI) diff += twoPi;
  return a + diff;
}

// Mengembalikan kamera ke orientasi awal dengan efek pegas/bouncy
// begitu user selesai drag/zoom heart-nya.
function CameraSnapBack({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const initial = useRef<{ theta: number; phi: number; radius: number } | null>(null);
  const stopAnim = useRef<null | (() => void)>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.update();
    initial.current = {
      theta: controls.getAzimuthalAngle(),
      phi: controls.getPolarAngle(),
      radius: controls.getDistance(),
    };

    const handleStart = () => {
      stopAnim.current?.();
      controls.autoRotate = false;
    };

    const handleEnd = () => {
      const init = initial.current;
      if (!init) return;

      const from = {
        theta: controls.getAzimuthalAngle(),
        phi: controls.getPolarAngle(),
        radius: controls.getDistance(),
      };
      const target = {
        theta: shortestAngle(from.theta, init.theta),
        phi: init.phi,
        radius: init.radius,
      };

      const controller = animate(0, 1, {
        type: 'spring',
        stiffness: 90,
        damping: 11,
        mass: 1,
        onUpdate: (t) => {
          const theta = THREE.MathUtils.lerp(from.theta, target.theta, t);
          const phi = THREE.MathUtils.lerp(from.phi, target.phi, t);
          const radius = THREE.MathUtils.lerp(from.radius, target.radius, t);

          const offset = new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
          controls.object.position.copy(controls.target).add(offset);
        },
        onComplete: () => {
          controls.autoRotate = true;
        },
      });
      stopAnim.current = controller.stop;
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, [controlsRef]);

  return null;
}

export default function Heart3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false); // untuk fade-in halus
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-700 ease-out"
      style={{ touchAction: 'none', opacity: ready ? 1 : 0 }}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ProgressReporter onReady={() => setReady(true)} />
        <Suspense fallback={null}>
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={1}
            dampingFactor={0.05}
          />
          <CameraSnapBack controlsRef={controlsRef} />
          <Model isMobile={isMobile} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/heart.glb');
