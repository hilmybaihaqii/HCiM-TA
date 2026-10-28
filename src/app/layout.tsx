import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import SplashScreen from "@/components/SplashScreen";
import { SplashProvider } from "@/components/SplashProvider";
import "./globals.css";

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
    <html lang="en" className={`${figtree.variable} font-sans`}>
      <body className="antialiased bg-white text-black">
        <SplashProvider>
          <SplashScreen />
          <CustomCursor />
          {children}
        </SplashProvider>
      </body>
    </html>
  );
}