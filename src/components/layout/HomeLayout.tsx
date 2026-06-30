import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <main className="relative flex flex-col w-full">{children}</main>
      <Footer />
    </div>
  );
}
