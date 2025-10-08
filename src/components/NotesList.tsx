'use client'
import React from "react";
import { Note } from "../../types";
import { Ellipsis } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import _ from "lodash";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { useNoteStore } from "@/stores/useNoteStore";
import { DeleteIcon } from "./ui/delete";
import { motion } from "motion/react";

export default function NotesList({ notes }: { notes: Note[] }) {
    const router = useRouter()
    const { state: sidebarState } = useSidebar();
    const deleteNote = useNoteStore((state) => state.removeNote)
    const tags = useNoteStore(state => state.tags)

    const getTagColor = (tagName: string) => {
      const tag = tags.find(t => t.name === tagName)
      return tag?.color || 'transparent'
    }
    
    const handleDelete = (id: string) => {
      deleteNote(id)
    }

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${sidebarState === "expanded" ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
      {notes.map((note) => {
        const rotation = _.random(-2, 2, true);
        const tagColor = getTagColor(note.tag)
        return (
          <motion.div 
            key={note.id} 
            className="relative shadow-xl rounded-lg p-2 h-[250px]"
            initial={{ rotate: rotation}}
            whileHover={{ rotate: 0, scale: 1.05, boxShadow: '0px 8px 16px rgba(0,0,0,0.4)'}}
            style={{
              backgroundColor: tagColor,
              opacity: 0.9
            }}
          >
            <div className="flex justify-between items-center">
              <p className="text-xs border px-2 py-1 rounded-lg">{note.tag}</p>
              <Ellipsis className="w-4 h-4 cursor-pointer" />
            </div>
            <div className="mb-4 cursor-pointer" onClick={() => router.push(`notes/${note.id}`)}>
              <h2 className="text-lg my-1">{note.title}</h2>
              <div className="text-grey-400 mb-4">
                  <Markdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                  {_.truncate(note.content, { length: 150, omission: "..." })}
                  </Markdown>
              </div>
            </div>
              <DeleteIcon size={20} className="absolute bottom-4" onClick={() => handleDelete(note.id)}/>
              <p className="absolute bottom-4 right-2">
                  {formatDate(note.modifiedAt)}
              </p>
          </motion.div>
        );
      })}
    </div>
  );
}
