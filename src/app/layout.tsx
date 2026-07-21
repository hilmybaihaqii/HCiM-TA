import type { Metadata } from "next";
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