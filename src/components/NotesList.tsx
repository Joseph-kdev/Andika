"use client";
import React, { useState } from "react";
import { Note } from "../types";
import { PinIcon, PinOffIcon, X } from "lucide-react";
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
import { Button } from "./ui/button";
import Image from "next/image";

export default function NotesList({ notes }: { notes: Note[] }) {
  const router = useRouter();
  const { state: sidebarState } = useSidebar();
  const deleteNote = useNoteStore((state) => state.removeNote);
  const tags = useNoteStore((state) => state.tags);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const togglePinNote = useNoteStore((state) => state.togglePinNote);

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || "transparent";
  };

  const handleDeleteDialog = (note: Note) => {
    console.log("selected note", note);
    setSelectedNote(note);
    setOpenDeleteDialog(true);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
  };

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${
        sidebarState === "expanded"
          ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }`}
    >
      {notes.map((note) => {
        const rotation = _.random(-2, 2, true);
        const tagColor = getTagColor(note.tag);
        return (
          <motion.div
            key={note.id}
            className="relative shadow-xl rounded-lg p-2 h-[250px]"
            initial={{ rotate: rotation }}
            whileHover={{
              rotate: 0,
              scale: 1.05,
              boxShadow: "0px 8px 16px rgba(0,0,0,0.4)",
            }}
            style={{
              backgroundColor: tagColor,
            }}
          >
            <div className="flex justify-between items-center">
              <p className="text-[8px] border-accent border-1 px-2 py-1 rounded-lg">
                {note.tag}
              </p>
              <button
                onClick={() => togglePinNote(note.id)}
                className="p-1 hover:bg-muted rounded-full"
              >
                {note.isPinned ? (
                  <PinOffIcon className="h-4 w-4 text-primary" />
                ) : (
                  <PinIcon className="h-4 w-4 text-foreground" />
                )}
              </button>
            </div>
            <div
              className="mb-4 cursor-pointer mt-2"
              onClick={() => router.push(`notes/${note.id}`)}
            >
              <h2 className="text-lg my-1 font-semibold">{note.title}</h2>
              <div className="mb-4">
                <Markdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {_.truncate(note.content, { length: 150, omission: "..." })}
                </Markdown>
              </div>
            </div>
            <DeleteIcon
              size={20}
              className="absolute bottom-4"
              onClick={() => handleDeleteDialog(note)}
            />
            <p className="absolute bottom-4 right-2 opacity-70">
              {formatDate(note.modifiedAt)}
            </p>
          </motion.div>
        );
      })}
      {openDeleteDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur flex justify-center items-center z-50"
        >
          <div className="bg-background shadow-2xl rounded-lg p-6 relative">
            <div className="flex-1 flex justify-center my-6">
              <Image
                width={260}
                height={260}
                src="/delete-ilt.svg"
                alt="delete svg"
              />
            </div>
            <h4 className="font-medium text-center mt-2">
              Are you sure you want to delete the note:
            </h4>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              &quot;{selectedNote?.title}&quot;
            </p>
            <div className="flex-1 mt-4 flex justify-center gap-3">
              <Button
                variant={"destructive"}
                className="shadow-[0_4px_0_var(--secondary-two)] active:shadow-none active:translate-y-1"
                onClick={() => {
                  if (selectedNote) {
                    handleDelete(selectedNote.id);
                    setOpenDeleteDialog(false);
                  }
                }}
              >
                Delete
              </Button>
              <Button
                variant={"outline"}
                className="shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                onClick={() => setOpenDeleteDialog(false)}
              >
                Cancel
              </Button>
            </div>
            <div
              className="border bg-background rounded-md hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 absolute top-4 right-5 cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1 p-1"
              onClick={() => setOpenDeleteDialog(false)}
            >
              <X
                width={12}
                height={12}
                onClick={() => setOpenDeleteDialog(false)}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
