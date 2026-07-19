'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useProgress } from '@react-three/drei';
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

export default function Heart3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false); // untuk fade-in halus

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
            enableZoom={true}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={1}
            dampingFactor={0.05}
          />
          <Model isMobile={isMobile} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/heart.glb');