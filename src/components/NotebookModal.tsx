"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import _ from "lodash";

const COLORS = [
  "hsl(24.999999999999996, 75.9493670886076%, 30.98039215686274%)", // Saddle Brown
  "#2F4F2F", // Dark Slate Gray
  "#1E3A8A", // Deep Blue
  "#4A4A4A", // Dark Gray
  "#8B0000", // Dark Red
  "#006400", // Dark Green
  "#1a1a1a", // Almost Black
  "#B8860B", // Dark Goldenrod
  "#4B0082", // Indigo
  "#2F4F4F", // Dark Cyan
  "#DC143C", // Crimson
  "#654321", // Dark Brown
];

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, color: string) => void;
}

export default function NewNotebookModal({
  isOpen,
  onClose,
  onCreate,
}: NewNotebookModalProps) {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title, selectedColor);
      setTitle("");
      setSelectedColor(COLORS[0]);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const contentVariants = {
    hidden: { scale: 0.95, y: 20 },
    visible: {
      scale: 1,
      y: 0,
    },
    exit: {
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 backdrop-blur flex items-center justify-center p-4 z-40"
          onClick={onClose}
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Create Notebook
              </h2>
              <Button
                variant={"outline"}
                className="cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                onClick={onClose}
              >
                <X width={12} height={12} />
              </Button>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notebook Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Enter notebook title..."
                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Book Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full aspect-square rounded transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-primary"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div className="flex justify-center">
                <div
                  className="w-12 h-32 rounded-sm shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <div
                    className="text-xs font-bold text-white/90 text-center px-1"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {_.truncate(title, { length: 15 }) || "Title"}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant={'outline'}
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              >
                Create
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
