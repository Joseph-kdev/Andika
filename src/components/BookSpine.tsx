'use client';

import { NoteBook } from "@/types";
import _ from "lodash";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface BookSpineProps {
  notebook: NoteBook;
  index: number;
  totalOnShelf: number;
}

export default function BookSpine({
  notebook,
  index,
  totalOnShelf,
}: BookSpineProps) {
  // Generate random but consistent lean and rotation for this book
  const seed = parseInt(notebook.id);
  const lean = ((seed % 3) - 1) * 2; // -2, 0, or 2 degrees
  const offset = ((seed % 4) - 2) * 4; // Slight vertical offset
  const navigate = useRouter()

  const bookVariants = {
    initial: {
      opacity: 0,
      y: 100,
      rotateZ: 0,
    },
    animate: {
      opacity: 1,
      y: offset,
      rotateZ: lean,
    },
    hover: {
      y: offset - 16,
      z: 50,
      rotateZ: lean,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      transition: { duration: 0.3 },
    },
  };

  const titleVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.3 + index * 0.08, duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={bookVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="relative group cursor-pointer"
      style={{
        perspective: '1000px',
      }}
      onClick={() => navigate.push(`notebooks/editor/${notebook.id}`)}
    >
      <div
        className="relative w-16 h-56 rounded-sm overflow-hidden shadow-lg transition-all"
        style={{
          backgroundColor: notebook.color,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 2px,
              rgba(0, 0, 0, 0.1) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0, 0, 0, 0.05) 1px,
              rgba(0, 0, 0, 0.05) 2px
            )
          `,
        }}
      >
        {/* Spine gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none" />

        {/* Title text - vertical orientation */}
        <motion.div
          variants={titleVariants}
          className="absolute inset-0 flex items-center justify-center p-2"
        >
          <div
            className="text-xs font-bold text-center text-white/90 tracking-wider"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              wordBreak: 'break-word',
              lineHeight: '1.2',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            }}
          >
            {_.truncate(notebook.title, { length: 15 })}
          </div>
        </motion.div>

        {/* Bottom label area */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent flex items-center justify-center">
          <div className="text-[10px] text-white/60 font-mono tracking-tighter">
            {new Date(notebook.createdAt).getFullYear()}
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 20px ${notebook.color}40`,
          pointerEvents: 'none',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Tooltip on hover */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50"
      >
        {notebook.title}
      </motion.div>
    </motion.div>
  );
}
