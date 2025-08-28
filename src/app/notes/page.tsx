"use client";

import { Note, useNoteStore } from "@/stores/useNoteStore";
import { useRouter } from "next/navigation";
import { v4 as uuid4 } from "uuid";
import _ from "lodash";
import { useEffect, useState } from "react";
import NotePreview from "@/components/NotePreview";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";

export default function Home() {
  const addNote = useNoteStore((state) => state.addNote);
  const router = useRouter();
  const notes = useNoteStore((state) => state.notes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth > 768) {
      if (notes.length > 0 && !selectedNote) {
        setSelectedNote(notes[0]);
      }
    }
  }, [notes, selectedNote]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const createNew = () => {
    const noteId = uuid4();
    addNote({
      id: noteId,
      title: "",
      content: "",
    });
    router.push(`notes/editor/${noteId}`);
  };

  return (
    <div className="p-1 w-full">
      <div className="md:flex flex-row gap-2">
        <div className="md:w-1/3">
          <button
            onClick={createNew}
            className="border w-full flex items-center p-2 gap-4 cursor-pointer"
          >
            <svg
              width="24px"
              height="24px"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="#000000"
            >
              <path
                d="M8 12H12M16 12H12M12 12V8M12 12V16"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <p>Create New</p>
          </button>
          <ul className="mt-2">
            {notes.map((n) => (
              <li
                className={`px-2 py-4 shadow-md cursor-pointer ${
                  selectedNote?.id === n.id ? "bg-gray-800 text-white" : ""
                }`}
                key={n.id}
                onClick={() => handleNoteSelect(n)}
              >
                <h2 className="text-xl font-semibold">{n.title}</h2>
                <div className="text-sm mt-1">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {_.truncate(n.content, { length: 50, omission: "..." })}
                  </Markdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* for desktop interfaces */}
        {selectedNote && (
          <div className="hidden md:block w-2/3 border">
            <NotePreview note={selectedNote} />
          </div>
        )}
      </div>

      {/* for mobile interfaces */}
      {isModalOpen && selectedNote && (
        <div className="md:hidden fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-4">
          <div className="bg-white w-full h-[80vh] max-w-md rounded-lg overflow-y-scroll relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 p-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="py-4 mt-4">
              <NotePreview note={selectedNote} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
