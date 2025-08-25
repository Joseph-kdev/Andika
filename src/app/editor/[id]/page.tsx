"use client";

import Editor from "@/components/editor";
import { useNoteStore } from "@/stores/useNoteStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { debounce } from "lodash";

export default function EdittingPage() {
  const { id } = useParams<{ id: string }>();
  const note = useNoteStore((state) => state.notes.find((n) => n.id === id));
  const updateNote = useNoteStore((state) => state.updateNote);
  const addNote = useNoteStore((state) => state.addNote);
  const [title, setTitle] = useState(note?.title || "");

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(id, { title: newTitle });
  };

  const handleContentChange = debounce((content: string) => {
    updateNote(id, { content });
  }, 1000);

  // Handle missing note
  useEffect(() => {
    if (!note) {
      addNote({ id, title: "", content: "" });
    }
  }, [id, note, addNote]);

    // Cleanup debounced functions
  useEffect(() => {
    return () => {
      handleContentChange.cancel();
    };
  }, [handleContentChange]);
  
  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Note title"
      />
      {note ? (
        <Editor content={note?.content} onContentChange={handleContentChange} />
      ) : (
        <div>loading..</div>
      )}
    </div>
  );
}
