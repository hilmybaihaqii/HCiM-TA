import React from 'react';
import LabNavbar from './components/LabNavbar';
import LabFooter from './components/LabFooter';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      
      {/* Modul Navigasi Terisolasi */}
      <LabNavbar />

      {/* 
        flex-1 memastikan area konten utama merentang penuh, 
        sehingga footer selalu terdorong ke bawah layar 
      */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Modul Footer Terisolasi */}
      <LabFooter />
      
    </div>
  );
}