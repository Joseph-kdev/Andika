"use client";

import Bookshelf from "@/components/BookShelf";
import NewNotebookModal from "@/components/NotebookModal";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAnalytics } from "@/hooks/use-analytics";
import { useNotebookStore } from "@/stores/useNotebookStore";
import { Flame, SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function NoteBookPage() {
  const { state: sidebarState } = useSidebar();
  const analytics = useAnalytics();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotebook, notebooks } = useNotebookStore()

  const handleCreateNotebook = (title: string, color: string) => {
    if(title.length == 0) {
      throw new Error('Title can not be blank')
    }

    addNotebook({ title: title, color: color, pages: [] })
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
            notebooks={notebooks}
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
