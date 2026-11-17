import type { Viewport } from "next";

// Formulir akun berlatar hitam (di ponsel selayar penuh): toolbar Safari/Chrome mobile ikut hitam
export const viewport: Viewport = { themeColor: "#0A0A0A" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
