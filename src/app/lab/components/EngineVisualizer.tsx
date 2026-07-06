'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, Network, Activity, Check } from 'lucide-react';

type Stage = 'idle' | 'ingestion' | 'inference' | 'consensus' | 'completed';

const nodes = [
  { id: 'ingestion', label: 'Input Matrix', icon: Database },
  { id: 'inference', label: 'Base Learners', icon: Cpu },
  { id: 'consensus', label: 'Aggregator', icon: Network },
  { id: 'completed', label: 'Output Node', icon: Activity },
];

export default function EngineVisualizer({ activeStage }: { activeStage: Stage }) {
  const getStageIndex = (stage: Stage) => {
    if (stage === 'idle' || stage === 'ingestion') return 0;
    if (stage === 'inference') return 1;
    if (stage === 'consensus') return 2;
    if (stage === 'completed') return 3;
    return 0;
  };

  const currentIndex = getStageIndex(activeStage);

  return (
    <div className="w-full py-12 md:py-20 relative overflow-hidden flex justify-center bg-[#FAFAFA]">
      
      {/* Background Dot Pattern (Menciptakan nuansa "Canvas/Blueprint" seperti di gambar) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #E5E5E5 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      {/* Main Container Card (Rounded, White, Soft Shadow) */}
      <div className="w-full max-w-5xl mx-6 relative z-10 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] py-14 px-8 md:px-16">
        
        <div className="flex items-start justify-between relative w-full h-32">
          
          {/* ==========================================
              TRACK LINES (Connecting the nodes)
              ========================================== */}
          {/* Track Belakang (Abu-abu tipis) */}
          <div className="absolute top-10 left-[10%] right-[10%] h-[2px] bg-neutral-100 -translate-y-1/2 z-0 rounded-full" />
          
          {/* Track Aktif (Gradien dari Node sebelumnya yang berwarna Hitam menuju Node Aktif berwarna Merah) */}
          <div className="absolute top-10 left-[10%] right-[10%] h-[2px] -translate-y-1/2 z-0 overflow-hidden rounded-full">
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#18181B] to-[#E63946] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / (nodes.length - 1)) * 100}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* ==========================================
              RENDER NODES
              ========================================== */}
          {nodes.map((node, i) => {
            const isCompleted = i < currentIndex || (i === currentIndex && activeStage === 'completed');
            const isActive = i === currentIndex && activeStage !== 'completed';
            const isIdle = activeStage === 'idle';

            const Icon = isCompleted ? Check : node.icon;

            return (
              <div key={node.id} className="relative z-10 flex flex-col items-center group w-1/4">
                
                {/* Node Circle Container */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Efek Soft Glow Merah (Hanya untuk node yang sedang aktif diproses) */}
                  {isActive && !isIdle && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute -inset-10 bg-[#E63946]/10 rounded-full blur-xl -z-10"
                    />
                  )}

                  {/* Lingkaran Node Utama */}
                  <motion.div
                    animate={{
                      backgroundColor: isCompleted ? '#18181B' : isActive ? '#E63946' : '#FFFFFF',
                      borderColor: isCompleted || isActive ? 'transparent' : '#E5E5E5',
                      color: isCompleted || isActive ? '#FFFFFF' : '#A3A3A3',
                      scale: isActive && !isIdle ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-[1.5px] flex items-center justify-center relative shadow-sm z-10`}
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={isCompleted ? 3 : 1.5} />
                  </motion.div>
                </div>

                {/* Typography & Labels */}
                <div className="flex flex-col items-center text-center mt-6">
                  {/* Label "PHASE 0X" */}
                  <span className={`text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] transition-colors duration-500 mb-1.5
                    ${isActive ? 'text-[#E63946] font-bold' : isCompleted ? 'text-neutral-400' : 'text-neutral-300'}`}
                  >
                    Phase 0{i + 1}
                  </span>
                  
                  {/* Judul Node */}
                  <span className={`text-xs md:text-sm transition-colors duration-500
                    ${isActive ? 'text-neutral-900 font-semibold' : isCompleted ? 'text-neutral-700 font-medium' : 'text-neutral-400 font-medium'}`}
                  >
                    {node.label}
                  </span>
                  
                  {/* Badge "PROCESSING" (Hanya muncul saat tahap aktif dan bukan idle) */}
                  {isActive && !isIdle && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <motion.span 
                        animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-[#FCE8EA] text-[#D9534F] text-[8px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase"
                      >
                        Processing
                      </motion.span>
                    </motion.div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}