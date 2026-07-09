import React from 'react';
import LabNavbar from './components/LabNavbar';
import LabFooter from './components/LabFooter';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      <LabNavbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <LabFooter />
      
    </div>
  );
}