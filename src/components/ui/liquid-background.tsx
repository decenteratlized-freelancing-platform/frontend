"use client";

import { motion } from "framer-motion";

export const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-zinc-950">
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-zinc-950/40 z-10" />

      {/* Animated Blob 1 (Blue/Purple) */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-50 mix-blend-screen"
      />

      {/* Animated Blob 2 (Cyan/Teal) */}
      <motion.div
        animate={{
          x: [0, -150, 150, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[120px] opacity-40 mix-blend-screen"
      />

      {/* Animated Blob 3 (Violet/Pink) */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 100, -100, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[90px] opacity-30 mix-blend-screen"
      />
    </div>
  );
};
