import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient color layer — membentang di sepanjang tinggi konten,
          bukan cuma di Hero, supaya warnanya hidup dari atas sampai bawah. */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[0%] -left-[10%] w-[42vw] h-[42vw] max-w-130 max-h-130 rounded-full bg-accent/25 blur-[90px]" />
        <div className="absolute top-[12%] -right-[8%] w-[36vw] h-[36vw] max-w-115 max-h-115 rounded-full bg-teal/25 blur-[90px]" />
        <div className="absolute top-[30%] left-[2%] w-[28vw] h-[28vw] max-w-90 max-h-90 rounded-full bg-amber/22 blur-[85px]" />
        <div className="absolute top-[48%] -right-[10%] w-[34vw] h-[34vw] max-w-110 max-h-110 rounded-full bg-teal/22 blur-[90px]" />
        <div className="absolute top-[65%] -left-[8%] w-[32vw] h-[32vw] max-w-105 max-h-105 rounded-full bg-accent/22 blur-[85px]" />
        <div className="absolute top-[82%] right-[5%] w-[28vw] h-[28vw] max-w-90 max-h-90 rounded-full bg-amber/22 blur-[85px]" />
        <div className="absolute top-[98%] left-[15%] w-[26vw] h-[26vw] max-w-85 max-h-85 rounded-full bg-teal/18 blur-[80px]" />
      </div>

      <Navbar />
      <main className="relative z-10 flex flex-col w-full">{children}</main>
      <Footer />
    </div>
  );
}
