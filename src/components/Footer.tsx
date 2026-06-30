"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FAFAFA] pt-24 pb-8 px-6 md:px-12 border-t border-neutral-200 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <Link
              href="/"
              className="text-3xl font-bold tracking-tighter text-black"
            >
              Cardiotox<span className="text-[#E63946]">.</span>
            </Link>
            <p className="mt-6 text-sm text-neutral-600 max-w-sm leading-relaxed">
              Advanced{" "}
              <span className="italic font-medium text-black">in silico</span>{" "}
              modeling for cardiac safety and animal-free research[cite: 265].
              Redefining predictive precision.
            </p>
          </div>

          <div className="mt-12">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-1">
              Origin
            </div>
            <div className="text-xs font-semibold text-neutral-800">
              Telkom University • HCIM 2026
            </div>
          </div>
        </div>

        <div className="hidden md:block md:col-span-1"></div>
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-6">
            Platform
          </h4>
          <ul className="space-y-4">
            {[
              "Model Overview",
              "Methodology",
              "API Documentation",
              "Research Papers",
            ].map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="group flex items-center w-max text-sm font-medium text-neutral-600 transition-colors duration-300 hover:text-black"
                >
                  {item}
                  <svg
                    className="w-3 h-3 text-[#E63946] opacity-0 -translate-x-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-1 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-6">
            Resources
          </h4>
          <ul className="space-y-4">
            {[
              "Ethics Policy",
              "Terms of Service",
              "Privacy Policy",
              "Support",
            ].map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="group flex items-center w-max text-sm font-medium text-neutral-600 transition-colors duration-300 hover:text-black"
                >
                  {item}
                  <svg
                    className="w-3 h-3 text-[#E63946] opacity-0 -translate-x-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-1 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-6">
            Connect
          </h4>
          <ul className="space-y-4">
            {["Twitter", "LinkedIn", "GitHub", "Email Us"].map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="group flex items-center w-max text-sm font-medium text-neutral-600 transition-colors duration-300 hover:text-black"
                >
                  {item}
                  <svg
                    className="w-3 h-3 text-[#E63946] opacity-0 -translate-x-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-1 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p className="text-xs font-medium text-neutral-800">
            © {currentYear} Cardiotox.
          </p>
          <span className="hidden md:block w-1 h-1 bg-neutral-300 rounded-full" />
          <p className="text-xs text-neutral-500 font-light">
            All rights reserved. Designed for digital precision.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-0.5 h-3 mr-4">
            {[1, 0.6, 0.8, 0.4, 1].map((h, idx) => (
              <div
                key={idx}
                className="w-0.5 bg-neutral-300"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <Link
            href="#"
            className="text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
