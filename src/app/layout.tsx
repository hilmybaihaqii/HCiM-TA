import BubbleOrigin from '@/components/ui/BubbleOrigin';
import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import SplashScreen from "@/components/SplashScreen";
import { SplashProvider } from "@/components/SplashProvider";
import LanguageProvider from "@/i18n/LanguageProvider";
import "./globals.css";
import "@/i18n/i18n.css";

import CustomCursor from "@/components/ui/CustomCursor";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Cardiotoxicity Prediction",
  description: "Animal-free cardiotoxicity prediction platform.",
};

// viewportFit "cover": halaman boleh mengisi area notch/home bar, jarak aman diatur lewat env(safe-area-inset-*).
// themeColor: warna toolbar Safari/Chrome mobile sama dengan latar halaman.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F4F3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: skrip di bawah boleh menambah atribut data-splash-seen sebelum React hidup
    <html lang="en" className={`${figtree.variable} font-sans`} suppressHydrationWarning>
      <head>
        {/* Sebelum halaman tergambar: kalau splash sudah pernah tampil di tab ini, sembunyikan lapisannya
            yang ikut dirender server, supaya tidak berkedip sesaat sebelum React menghapusnya. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('hasSeenSplash')==='true'||/[?&]login=success/.test(location.search))document.documentElement.setAttribute('data-splash-seen','')}catch(e){}",
          }}
        />
        {/* Pengguna bahasa Indonesia: tahan tampilan sampai teks diganti; batas waktu mencegah layar kosong */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var l=localStorage.getItem('cardivex-lang');if(l==='id'||l==='ko'){var h=document.documentElement;h.lang=l;h.setAttribute('data-i18n-pending','');setTimeout(function(){h.removeAttribute('data-i18n-pending')},2500)}}catch(e){}",
          }}
        />
      </head>
      <body className="antialiased bg-white text-black">
        <LanguageProvider>
          <SplashProvider>
            <SplashScreen />
            <CustomCursor />
            <BubbleOrigin />
            {children}
          </SplashProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}