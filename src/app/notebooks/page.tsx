"use client";

import Bookshelf from "@/components/BookShelf";
import NewNotebookModal from "@/components/NotebookModal";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAnalytics } from "@/hooks/use-analytics";
import { NoteBook } from "@/types";
import { Flame, SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const mockNotebooks = [
  {
    id: "1",
    title: "Travel Journal 2024",
    color: "#8B4513",
    createdAt: "2024-01-15",
  },
  { id: "2", title: "Recipe Book", color: "#2F4F2F", createdAt: "2024-02-10" },
  {
    id: "3",
    title: "Meeting Notes",
    color: "#1E3A8A",
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    title: "Project Alpha",
    color: "#4A4A4A",
    createdAt: "2024-03-05",
  },
  {
    id: "5",
    title: "Ideas & Thoughts",
    color: "#8B0000",
    createdAt: "2024-02-28",
  },
  { id: "6", title: "Book Summary", color: "#006400", createdAt: "2024-03-10" },
  {
    id: "7",
    title: "Code Snippets",
    color: "#1a1a1a",
    createdAt: "2024-03-15",
  },
  { id: "8", title: "Learning Log", color: "#B8860B", createdAt: "2024-02-20" },
  {
    id: "9",
    title: "Daily Standup",
    color: "#4B0082",
    createdAt: "2024-03-18",
  },
  {
    id: "10",
    title: "Design System",
    color: "#2F4F4F",
    createdAt: "2024-03-12",
  },
  {
    id: "11",
    title: "Personal Goals",
    color: "#8B4513",
    createdAt: "2024-01-01",
  },
  { id: "12", title: "Reflections", color: "#DC143C", createdAt: "2024-03-20" },
  {
    id: "13",
    title: "Travel Journal 2024",
    color: "#8B4513",
    createdAt: "2024-01-15",
  },
  { id: "14", title: "Recipe Book", color: "#2F4F2F", createdAt: "2024-02-10" },
  {
    id: "15",
    title: "Meeting Notes",
    color: "#1E3A8A",
    createdAt: "2024-01-20",
  },
];

export default function NoteBookPage() {
  const { state: sidebarState } = useSidebar();
  const analytics = useAnalytics();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNotebook = (title: string, color: string) => {
    const newNotebook = {
      id: Date.now().toString(),
      title,
      color,
      createdAt: new Date().toISOString(),
    };
    setIsModalOpen(false);
  };

  return (
    <div
      className={`px-4 w-full min-h-screen relative border my-2 shadow-2xl rounded-md py-2 ${
        sidebarState === "collapsed"
          ? "md:w-[calc(100vw-5.5rem)]"
          : "md:w-[calc(100vw-15.5rem)]"
      }`}
    >
      <div className="absolute right-2 top-2 flex items-center">
        <div className="p-2 rounded-full flex justify-center items-center">
          <Flame
            className="w-5 h-5"
            fill={analytics.streak.days > 0 ? "#ff9a00" : "none"}
            stroke={analytics.streak.days > 0 ? "#ff5900c0" : "black"}
          />
          <p className="">{analytics.streak.days}</p>
        </div>
        <SidebarTrigger className="md:hidden" />
      </div>
      <div>
        <h2 className="text-2xl">Notebooks</h2>
        <p className="text-gray-600">Clock it</p>
      </div>
      <div className="w-full md:max-w-md relative mt-4">
        <SearchIcon height={16} width={16} className="absolute top-2 left-0" />
        <input
          type="text"
          placeholder="Search for a notebook..."
          className="w-full py-1 pl-6 text-base border-b border-gray-300 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className=""
        >
          <Bookshelf
            notebooks={[]}
            onCreateNew={() => setIsModalOpen(true)}
          />
        </motion.div>
      </div>
      <NewNotebookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateNotebook}
      />
    </div>
  );
}
