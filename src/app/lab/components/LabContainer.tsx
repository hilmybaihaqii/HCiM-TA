import React from 'react';

/**
 * Pembungkus halaman lab: lebar maksimum, jarak tepi, dan jarak ke navbar sama di semua halaman.
 * Jarak atas ikut safe-area (notch iPhone / mode standalone), karena navbar fixed juga ikut turun.
 * - wide   : Digital Lab, Full Pipeline, Logs, Admin
 * - narrow : Profile
 */
export default function LabContainer({ children, size = 'wide', className = '' }: {
  children: React.ReactNode;
  size?: 'wide' | 'narrow';
  className?: string;
}) {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 md:px-12 pb-20
        pt-[calc(7rem+env(safe-area-inset-top))] md:pt-[calc(9rem+env(safe-area-inset-top))]
        ${size === 'narrow' ? 'max-w-4xl' : 'max-w-7xl'} ${className}`}
    >
      {children}
    </div>
  );
}
