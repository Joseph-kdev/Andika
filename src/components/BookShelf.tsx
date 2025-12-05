"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { NoteBook } from "@/types";
import BookSpine from "./BookSpine";
import { PlusIcon } from "./ui/plus";
import Image from "next/image";

interface BookshelfProps {
  notebooks: NoteBook[];
  onCreateNew: () => void;
}

const SHELF_COUNT = 2;
const BOOKS_PER_SHELF = 8;

export default function Bookshelf({ notebooks, onCreateNew }: BookshelfProps) {
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.offsetWidth;
        const maxDrag = Math.max(0, contentWidth - containerWidth);
        setDragConstraints({ left: -maxDrag, right: 0 });
      }
    };

    // Use ResizeObserver to track content size changes
    const resizeObserver = new ResizeObserver(() => {
      updateConstraints();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Initial calculation with a small delay to ensure DOM is ready
    const timer = setTimeout(updateConstraints, 100);

    window.addEventListener("resize", updateConstraints);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConstraints);
      resizeObserver.disconnect();
    };
  }, [notebooks]);

  // Distribute books across shelves
  const shelves = useMemo(() => {
    const distribution: NoteBook[][] = Array(SHELF_COUNT)
      .fill(null)
      .map(() => []);

    notebooks.forEach((notebook, index) => {
      const shelfIndex = index % SHELF_COUNT;
      distribution[shelfIndex].push(notebook);
    });

    return distribution;
  }, [notebooks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const shelfVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className=""
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="flex-1 gap-2 overflow-hidden py-2 no-scrollbar cursor-grab active:cursor-grabbing flex"
        ref={containerRef}
      >
        {/* Bookshelf container with wooden appearance */}
        <motion.div
          className="relative space-y-8 w-full"
          ref={contentRef}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={true}
          whileDrag={{ cursor: "grabbing" }}
        >
          {shelves.map((shelfBooks, shelfIndex) => (
            <motion.div
              key={shelfIndex}
              variants={shelfVariants}
              className="relative pb-4"
            >
              {/* Books on this shelf */}
              <div className="flex items-end justify-center gap-3 min-h-64 px-4 shadow-inner shadow-black/20 rounded-md mt-4">
                {shelfBooks.length === 0 ? (
                  <div className="flex-1 h-60 flex flex-col items-center justify-center text-amber-900/30 text-sm bg-[url('/abstract-paper.svg')] bg-center bg-cover">
                    <div className="absolute inset-0 bg-white/80 z-20"></div>
                      <Image
                        className="z-30"
                        width={260}
                        height={100}
                        src={"/empty-shelves.png"}
                        alt="empty shelves"
                      />
                    <p className="z-40 text-foreground absolute bottom-20">Empty shelf</p>
                  </div>
                ) : (
                  shelfBooks.map((notebook, bookIndex) => (
                    <BookSpine
                      key={notebook.id}
                      notebook={notebook}
                      index={bookIndex}
                      totalOnShelf={shelfBooks.length}
                    />
                  ))
                )}

                {/* Add book button on each shelf if space */}
                {/* {shelfBooks.length < BOOKS_PER_SHELF && (
                  <motion.button
                    onClick={onCreateNew}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-16 h-56 bg-gradient-to-b from-amber-800 to-amber-900 rounded border-2 border-dashed border-amber-700 hover:border-amber-500 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-amber-600" />
                  </motion.button>
                )} */}
              </div>

              {/* Shelf line */}
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent shadow-[0_2px_0_hsla(0,0%,100%,0.15)] z-30" />
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* Floating add button for mobile/when shelves are full */}
      <div
        className="rounded-full bg-accent-foreground absolute bottom-10 right-4 cursor-pointer z-40 shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
        onClick={onCreateNew}
      >
        <PlusIcon size={48} className="text-white p-2" />
      </div>
    </motion.div>
  );
}
