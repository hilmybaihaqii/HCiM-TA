"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

gsap.registerPlugin(ScrollTrigger);

// TypeScript Interfaces (Menyelesaikan error "any")
interface TooltipPayload {
  color?: string;
  name?: string;
  value?: number | string;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Custom Tooltip yang responsif
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505]/95 backdrop-blur-md border border-neutral-800 p-2 md:p-3 rounded-md shadow-2xl">
        <p className="text-[#FAFAFA] font-mono text-[9px] md:text-[10px] mb-1 md:mb-2 border-b border-neutral-700 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="font-mono text-[10px] md:text-xs font-semibold"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProblemBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const successRateData = [
    { phase: "Ph I-II", with: 52.4, without: 52.0 },
    { phase: "Ph II-III", with: 46.3, without: 28.3 },
    { phase: "Ph III-NDA", with: 68.2, without: 57.1 },
    { phase: "NDA-Apprv", with: 96.0, without: 90.3 },
    { phase: "Total", with: 15.9, without: 7.6 },
  ];

  const costData = [
    { year: "2013", cost: 1.3 },
    { year: "2015", cost: 1.51 },
    { year: "2019", cost: 2.43 },
    { year: "2021", cost: 1.99 },
    { year: "2024", cost: 2.23 },
  ];

  const animalData = [
    { year: "2021", subjects: 45841 },
    { year: "2022", subjects: 51762 },
    { year: "2023", subjects: 64013 },
  ];

  const stories = [
    {
      id: "01",
      metric: "7.6%",
      title: "The Attrition Crisis",
      description:
        "Relying on conventional single-biomarker hERG testing yields disproportionately high false-positive rates. Viable therapeutics are prematurely abandoned, dragging the success rate down to a critical 7.6%.",
      source: "Source: QLS Advisors © Statista 2026",
      videoSrc: "/videos/lab.mp4",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={successRateData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="phase"
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar
              dataKey="without"
              name="Without Biomarkers"
              fill="#444"
              unit="%"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="with"
              name="With Biomarkers"
              fill="#FAFAFA"
              unit="%"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "02",
      metric: "$2.23B",
      title: "Financial Hemorrhage",
      description:
        "Misclassifying drug safety is an irreversible industrial loss. The average expenditure to bring a single compound to market climbed to an astronomical $2.23 billion in 2024, nearly doubling since 2013.",
      source: "Source: Deloitte © Statista 2026",
      videoSrc: "/videos/data.mp4",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={costData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FAFAFA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FAFAFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cost"
              name="Avg R&D Cost"
              stroke="#FAFAFA"
              strokeWidth={2}
              fill="url(#colorCost)"
              unit="B"
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "03",
      metric: "+39%",
      title: "The Ethical Flaw",
      description:
        "Despite clear inefficiencies, research remains heavily dependent on animal models, surging by 39% from 2021 to 2023. Human in silico simulations offer a more accurate and ethical alternative.",
      source: "Source: GOV.UK © Statista 2026",
      videoSrc: "/videos/heart.mp4",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={animalData}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: "#888", fontSize: 8, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 5000", "dataMax + 5000"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="step"
              dataKey="subjects"
              name="Animal Subjects"
              stroke="#FAFAFA"
              strokeWidth={2}
              dot={{ fill: "#FAFAFA", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      const totalScenes = stories.length;

      // Initial states: Gunakan y: 40 agar tidak terlalu jauh terdorong keluar layar di Mobile
      gsap.set(".story-card:not(:first-child)", {
        autoAlpha: 0,
        y: 40,
        scale: 0.95,
      });
      gsap.set(".bg-video:not(:first-child)", { autoAlpha: 0 });

      // Set 2 Progress Bar (X untuk Mobile, Y untuk Desktop)
      gsap.set(".progress-fill-y", { scaleY: 0 });
      gsap.set(".progress-fill-x", { scaleX: 0 });

      stories.forEach((_, index) => {
        if (index < totalScenes - 1) {
          tl.to(`.story-card-${index}`, {
            autoAlpha: 0,
            y: -40,
            scale: 0.95,
            duration: 1,
            ease: "power2.inOut",
          });

          tl.to(`.bg-video-${index}`, { autoAlpha: 0, duration: 1 }, "<");

          tl.to(
            `.story-card-${index + 1}`,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power2.inOut",
            },
            "<",
          );

          tl.to(`.bg-video-${index + 1}`, { autoAlpha: 1, duration: 1 }, "<");
        }

        // Animasikan kedua tipe Progress Bar
        const progress = (index + 1) / totalScenes;
        tl.to(
          ".progress-fill-y",
          { scaleY: progress, duration: 1, ease: "none" },
          "<",
        );
        tl.to(
          ".progress-fill-x",
          { scaleX: progress, duration: 1, ease: "none" },
          "<",
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[400dvh] bg-[#050505] text-white font-sans"
    >
      {/* Sticky Container (Menggunakan h-dvh) */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-dvh overflow-hidden flex flex-col justify-center"
      >
        {/* Latar Belakang Video & Overlay */}
        <div className="absolute inset-0 w-full h-full z-0">
          {stories.map((story, index) => (
            <video
              key={`video-${index}`}
              className={`bg-video bg-video-${index} absolute inset-0 w-full h-full object-cover`}
              src={story.videoSrc}
              autoPlay
              muted
              loop
              playsInline
            />
          ))}
          <div className="absolute inset-0 bg-black/60 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-[#050505]/40 z-10" />
        </div>

        {/* Konten Utama */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 pt-24 md:pt-32 pb-6 md:pb-12 flex flex-col md:flex-row gap-4 md:gap-8 items-center h-full">
          {/* KOLOM KIRI: Konteks (Responsive Row/Col) */}
          <div className="w-full md:w-1/3 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 h-auto md:h-full justify-start md:justify-center shrink-0">
            {/* Desktop Progress Bar (Vertical) */}
            <div className="hidden md:block relative h-64 w-1 bg-neutral-800/50 rounded-full overflow-hidden shrink-0">
              <div className="progress-fill-y absolute top-0 left-0 w-full h-full bg-white origin-top" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-white/60 text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] mb-2 md:mb-3">
                The Core Problem
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-white leading-snug">
                Scientifically over-cautious, <br className="hidden md:block" />
                <span className="text-white/50 italic font-serif">
                  financially destructive.
                </span>
              </h3>
            </motion.div>

            {/* Mobile Progress Bar (Horizontal) */}
            <div className="block md:hidden relative w-full h-1 bg-neutral-800/50 rounded-full overflow-hidden shrink-0 mt-2">
              <div className="progress-fill-x absolute top-0 left-0 w-full h-full bg-white origin-left" />
            </div>
          </div>

          {/* KOLOM KANAN: Glassmorphism Card */}
          <div className="w-full md:w-2/3 relative flex-1 flex items-center justify-center min-h-[50vh]">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`story-card story-card-${index} absolute w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-10 shadow-2xl flex flex-col justify-center`}
              >
                {/* Header (Angka mengecil secara otomatis di HP) */}
                <div className="flex flex-row items-end gap-3 md:gap-6 mb-3 md:mb-6">
                  <h4 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter text-white">
                    {story.metric}
                  </h4>
                  <div className="pb-1 md:pb-2">
                    <span className="inline-block px-2 py-1 bg-white/10 rounded text-[8px] md:text-[10px] font-mono text-white/80 mb-1 md:mb-2">
                      [ DATA_{story.id} ]
                    </span>
                    <h5 className="text-sm sm:text-lg md:text-2xl font-medium text-white leading-tight">
                      {story.title}
                    </h5>
                  </div>
                </div>

                {/* Teks Deskripsi (Font disesuaikan di mobile agar tidak panjang ke bawah) */}
                <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-light mb-4 md:mb-8">
                  {story.description}
                </p>

                {/* Grafik (Ketinggian diatur dinamis: h-32 di Mobile, h-48 di Desktop) */}
                <div className="w-full h-32 sm:h-40 md:h-48 border-t border-white/10 pt-4 md:pt-6 relative group">
                  {story.chart}
                </div>

                {/* Source Citation */}
                <p className="text-[8px] md:text-[9px] font-mono text-neutral-500 mt-4 md:mt-6 text-right uppercase">
                  {story.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
