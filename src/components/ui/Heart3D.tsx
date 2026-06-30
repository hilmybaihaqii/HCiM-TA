'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

// Kita lempar status isMobile ke dalam Model
function Model({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF('/models/heart.glb');
  
  // Jika di HP, skalanya mengecil (1.1) dan posisinya disesuaikan (-0.8)
  // Jika di Desktop, kembali ke ukuran besar (1.5) dan posisi (-1.2)
  const scale = isMobile ? 1.5 : 1.7;
  const posY = isMobile ? -0.7 : -0.8;

  return <primitive object={scene} scale={scale} position={[0, posY, 0]} />;
}

export default function Heart3D() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fungsi untuk mendeteksi apakah layar berukuran HP (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Cek saat pertama kali dimuat
    checkMobile();
    
    // Cek ulang jika pengguna memutar/resize layar HP
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // style={{ touchAction: 'none' }} SANGAT PENTING di mobile
    // Ini menghentikan layar agar tidak ikut ke-scroll saat kamu memutar jantung
    <div 
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
      style={{ touchAction: 'none' }}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={true} 
            autoRotateSpeed={1} 
            dampingFactor={0.05} 
          />
          
          {/* Panggil model dengan menyisipkan properti isMobile */}
          <Model isMobile={isMobile} />

          <Environment preset="city" />
          
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/heart.glb');