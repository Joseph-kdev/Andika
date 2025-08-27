"use client";

import Editor from "@/components/editor";
import { useNoteStore } from "@/stores/useNoteStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { debounce } from "lodash";

export default function EdittingPage() {
  const { id } = useParams<{ id: string }>();
  const note = useNoteStore((state) => state.notes.find((n) => n.id === id));
  const updateNote = useNoteStore((state) => state.updateNote);
  const router = useRouter()
  const [title, setTitle] = useState(note?.title || "");
  const [isSaving, setIsSaving] = useState(false)

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(id, { title: newTitle });
  };

  const handleContentChange = debounce((content: string) => {
    updateNote(id, { content });
  }, 1000);

  // Handle missing note
  useEffect(() => {
    if(!note) {
      router.push("/")
    }
  }, []);

    // Cleanup debounced functions
  useEffect(() => {
    return () => {
      handleContentChange.cancel();
    };
  }, [handleContentChange]);

  const handleSave = () => {
    try {
      setIsSaving(true);
      handleContentChange.cancel();
      
      updateNote(id, { 
        title, 
        content: note?.content || '' 
      });
      
      // Show success state
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      // Handle error
      setIsSaving(false);
      console.error('Failed to save:', error);
    }
  }
  
  return (
    <div className="p-2">
      <div className="flex justify-between md:px-[15%]">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title"
            className="py-2 focus:outline-none text-xl"
          />
          <hr />
        </div>
        <button className={`border p-2 cursor-pointer ${isSaving ? 'bg-green-500 border-green-500' : "border-amber-500"}`} onClick={handleSave}>
          {isSaving ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div>
        {note ? (
          <Editor content={note?.content} onContentChange={handleContentChange} />
        ) : (
          <div>loading..</div>
        )}
      </div>
    </div>
  );
}
