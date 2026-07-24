'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

export const RevealText = ({ children }: { children: string }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  
  // Melacak posisi scroll relatif terhadap elemen teks ini
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Animasi mulai saat elemen 85% dari atas layar, 
    // dan selesai sepenuhnya saat elemen mencapai 45% dari atas layar
    offset: ['start 85%', 'end 45%'], 
  });

  const words = children.split(' ');

  return (
    <p
      ref={containerRef}
      className="flex flex-wrap text-2xl sm:text-3xl md:text-[40px] font-medium tracking-tight text-foreground leading-[1.3] md:leading-[1.2]"
    >
      {words.map((word, i) => {
        // Menghitung rentang animasi (kapan kata ini harus mulai dan selesai muncul)
        const start = i / words.length;
        const end = start + 1 / words.length;

        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

// Komponen pembantu untuk menganimasi setiap kata secara individual
interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  // Mapping nilai progress scroll ke opacity (0.15 -> 1) dan Y-axis (8px -> 0px)
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <span className="mr-[1.2vw] md:mr-3 mb-1 md:mb-3 relative inline-block">
      {/* Teks bayangan (opsional, agar teks tetap terbaca samar saat belum aktif) */}
      <span className="absolute opacity-0">{children}</span>
      
      {/* Teks utama yang dianimasikan */}
      <motion.span style={{ opacity, y }} className="inline-block text-foreground">
        {children}
      </motion.span>
    </span>
  );
};