'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useSplash } from '../SplashProvider';

/*
 * Kedua model sudah disederhanakan + dikompres meshopt dengan gltf-transform
 * dari file asli 75 MB (±2 juta segitiga):
 *   heart.glb         2,7 MB  ±436 ribu segitiga  (desktop)
 *   heart-mobile.glb  1,4 MB  ±198 ribu segitiga  (HP)
 */
const MODEL_DESKTOP = '/models/heart.glb';
const MODEL_MOBILE = '/models/heart-mobile.glb';
const MOBILE_QUERY = '(max-width: 767px)';
const SPIN_SPEED = 0.21; // rad/detik, setara autoRotateSpeed 1 sebelumnya
// Pembuluh besar di atas menarik titik tengah massa ke kanan, jadi badan jantung tampak
// condong ke kiri. Geser sedikit ke kanan supaya terlihat pas di tengah.
const OPTICAL_OFFSET_X = { desktop: 0.08, mobile: 0.14 };

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Titik tengah massa (rata-rata posisi vertex) dalam koordinat lokal model,
 * supaya jantung berputar di porosnya sendiri. Dihitung relatif terhadap `scene`
 * karena objek ini di-cache useGLTF dan bisa sudah punya parent/offset.
 */
function useMassCenter(scene: THREE.Object3D) {
  return useMemo(() => {
    const sum = new THREE.Vector3();
    const v = new THREE.Vector3();
    const toLocal = new THREE.Matrix4();
    let count = 0;
    scene.updateMatrixWorld(true);
    const sceneInverse = scene.matrixWorld.clone().invert();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      toLocal.multiplyMatrices(sceneInverse, mesh.matrixWorld);
      const pos = mesh.geometry.attributes.position;
      // Sampel tiap 8 vertex sudah cukup akurat dan jauh lebih cepat.
      for (let i = 0; i < pos.count; i += 8) {
        sum.add(v.fromBufferAttribute(pos, i).applyMatrix4(toLocal));
        count++;
      }
    });
    return count ? sum.divideScalar(count) : sum;
  }, [scene]);
}

/**
 * OrbitControls memasang `touch-action: none` di canvas, sehingga swipe di atas jantung
 * tidak bisa scroll halaman. Kita ganti ke `pan-y`: geser vertikal satu jari tetap
 * scroll, sedangkan geser horizontal (putar) dan cubit dua jari (zoom) diteruskan ke kontrol.
 */
function AllowVerticalScroll() {
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const apply = () => {
      if (canvas.style.touchAction !== 'pan-y') canvas.style.setProperty('touch-action', 'pan-y');
    };
    apply();
    // Kontrol bisa memasang ulang style saat reconnect; jaga supaya tetap pan-y.
    const observer = new MutationObserver(apply);
    observer.observe(canvas, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [canvas]);
  return null;
}

/**
 * Memberi tahu parent begitu model selesai dimuat (komponen ini baru mount setelah Suspense selesai).
 * Animasi muncul (naik + membesar) dikerjakan di dalam scene, bukan lewat CSS transform di
 * pembungkus canvas: R3F mengukur canvas dengan getBoundingClientRect, yang ikut terkena
 * transform, sehingga canvas sempat tersimpan 94% ukuran aslinya sampai halaman di-scroll.
 */
function Model({ isMobile, show, onLoaded }: { isMobile: boolean; show: boolean; onLoaded: () => void }) {
  const { scene } = useGLTF(isMobile ? MODEL_MOBILE : MODEL_DESKTOP);
  const center = useMassCenter(scene);
  const spin = useRef<THREE.Group>(null);
  const reveal = useRef(0);

  const scale = isMobile ? 1.75 : 1.7;
  const posY = isMobile ? -0.85 : -0.8;

  useEffect(() => onLoaded(), [scene, onLoaded]);
  useFrame((_, delta) => {
    const g = spin.current;
    if (!g) return;
    g.rotation.y += delta * SPIN_SPEED;
    if (show && reveal.current < 1) {
      reveal.current = THREE.MathUtils.damp(reveal.current, 1, 3.2, delta);
      if (reveal.current > 0.999) reveal.current = 1;
    }
    const t = reveal.current;
    g.scale.setScalar(scale * (0.9 + 0.1 * t));
    g.position.y = posY - 0.3 * (1 - t);
  });

  return (
    <group ref={spin} position={[isMobile ? OPTICAL_OFFSET_X.mobile : OPTICAL_OFFSET_X.desktop, posY - 0.3, 0]} scale={scale * 0.9}>
      <primitive object={scene} position={[-center.x, 0, -center.z]} />
    </group>
  );
}

export default function Heart3D() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const { setPageReady, splashDone } = useSplash();
  const [ready, setReady] = useState(false);
  // Jantung baru muncul setelah splash terbuka, supaya animasinya benar-benar terlihat.
  const show = ready && splashDone;
  const [inView, setInView] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleLoaded = useCallback(() => {
    setPageReady(true);
    setReady(true);
  }, [setPageReady]);

  // Berhenti render saat hero sudah di-scroll lewat, supaya GPU/baterai tidak terpakai sia-sia.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      // Roda mouse di atas jantung dipakai untuk zoom (OrbitControls), bukan untuk scroll halus.
      data-lenis-prevent-wheel
      // Hanya opacity di sini. Jangan beri transform: ukuran canvas akan terbaca salah (lihat Model).
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ opacity: show ? 1 : 0 }}
    >
      {/* Bayangan lembut di bawah jantung supaya terlihat berdiri; ikut muncul bersama model. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[64%] md:top-[68%] -translate-x-1/2 w-[38vw] max-w-[220px] md:w-[15vw] md:max-w-[240px] h-4 md:h-6 rounded-[100%] bg-foreground/20 blur-xl"
      />
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop={inView ? 'always' : 'never'}
        // Ukur dari offsetWidth/Height (abaikan transform leluhur) supaya ukuran canvas selalu pas.
        resize={{ offsetSize: true }}
        gl={{ powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Desktop: drag = putar, scroll = zoom. HP: geser samping = putar, cubit = zoom. */}
          <OrbitControls enableZoom enablePan={false} enableDamping={false} minDistance={2.6} maxDistance={6} />
          <AllowVerticalScroll />
          <Model isMobile={isMobile} show={show} onLoaded={handleLoaded} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
