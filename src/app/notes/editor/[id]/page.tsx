"use client";

import { useNoteStore } from "@/stores/useNoteStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Editor from "@/components/editor";
import { v4 as uuid4 } from "uuid";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import _ from "lodash";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function EditingPage() {
  const { id } = useParams<{ id: string }>();
  const notes = useNoteStore((state) => state.notes);
  const note = notes.find((n) => n.id === id);
  const updateNote = useNoteStore((state) => state.updateNote);
  const addNote = useNoteStore((state) => state.addNote);
  const router = useRouter();
  const [title, setTitle] = useState(note?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef(note?.content || "");
  const hasUnsavedChanges = useRef(false);
  const { state: sidebarState } = useSidebar();

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(id, { title: newTitle });
  };

  const handleSave = () => {
    try {
      setIsSaving(true);
      updateNote(id, { 
        title, 
        content: contentRef.current
      });
      
      hasUnsavedChanges.current = false;
      
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save:', error);
    }
  };

  const createNew = () => {
    const noteId = uuid4();
    addNote({
      id: noteId,
      title: "",
      content: "",
    });
    router.push(`/notes/editor/${noteId}`);
  };

  // Handle missing note
  useEffect(() => {
    if(!note) {
      router.push("/notes")
    }
  }, [note]);
  
  return (
    <div className={`flex h-screen w-screen ${sidebarState === 'expanded' ? 'md:w-[calc(100vw-16rem)]' : 'md:w-[calc(100vw-5rem)]'}`}>
      {/* Notes List - Hidden on mobile */}
      <div className={`hidden md:block overflow-y-auto transition-all duration-300 ${
        sidebarState === 'expanded' ? 'md:w-1/3 mx-1' : 'md:w-1/4 mx-2'
      }`}>
        <button
          onClick={createNew}
          className="border w-full flex items-center p-2 gap-4 cursor-pointer hover:bg-gray-50 rounded-4xl"
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
              className={`px-2 py-4 shadow-md cursor-pointer rounded-xl ${
                id === n.id ? "bg-gray-800 text-white" : ""
              }`}
              key={n.id}
              onClick={() => router.push(`/notes/editor/${n.id}`)}
            >
              <h2 className="text-xl font-semibold">{n.title || "Untitled"}</h2>
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

      {/* Editor Area */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${
        sidebarState === 'expanded' ? 'md:w-2/3' : 'md:w-3/4'
      }`}>
        <div className="p-2">
          <div className="flex w-full justify-center">
            <div className={`flex justify-between w-full transition-all duration-300 ${
              sidebarState === "collapsed" 
                ? "md:min-w-[940px]" 
                : "md:min-w-[748px]"
            }`}>
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Note title"
                  className="w-full py-2 focus:outline-none text-xl"
                />
                <hr />
              </div>
              <Button 
                className={`ml-4 border p-2 cursor-pointer ${
                  isSaving ? 'bg-green-500 border-green-500' : "border-amber-500"
                }`} 
                onClick={handleSave}
                variant={"secondary"}
              >
                {isSaving ? 'Saved!' : 'Save'}
              </Button>
            </div>
          </div>
          <div className={`mx-auto transition-all duration-300 mt-1 ${
            sidebarState === "collapsed" 
              ? "md:min-w-[960px]" 
              : "md:min-w-[748px]"
          }`}>
            {note ? (
              <Editor 
                content={note.content} 
                contentRef={contentRef}
                hasUnsavedChanges={hasUnsavedChanges}
                onContentChange={updateNote}
                noteId={id}
              />
            ) : (
              <div>loading..</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
