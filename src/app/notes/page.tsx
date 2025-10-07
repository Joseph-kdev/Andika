"use client";
import NotesList from "@/components/NotesList";
import { BoxesIcon } from "@/components/ui/boxes";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@/components/ui/heart";
import { PlusIcon } from "@/components/ui/plus";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserIcon } from "@/components/ui/user";
import { useNoteStore } from "@/stores/useNoteStore";
import { debounce } from "lodash";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { v4 as uuid4 } from "uuid";

export default function Notes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, SetSelectedTag] = useState("all");
  const router = useRouter();

  const notes = useNoteStore((state) => state.notes);
  const addNote = useNoteStore((state) => state.addNote);
  const tags = useNoteStore((state) => state.tags);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value)
    }, 300),
    []
  )

  const createNew = () => {
    const noteId = uuid4();
    addNote({
      id: noteId,
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      tag: "",
    });
    router.push(`notes/${noteId}`);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTag === "all") return matchesSearch;
    return matchesSearch && note.tag === selectedTag;
  });

  const handleTagSelect = (tag: string) => {
    SetSelectedTag(tag);
  };

  return (
    <div className="px-2 w-full min-h-screen relative">
      <SidebarTrigger className="md:hidden absolute right-0" />
      <div>
        <h2 className="text-2xl">Notes</h2>
        <p className="text-gray-600">Jot your thoughts down.</p>
      </div>
      <div className="w-full md:max-w-md relative mt-4">
        <SearchIcon height={16} width={16} className="absolute top-2 left-0" />
        <input
          type="text"
          placeholder="Search for a note..."
          value={searchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full py-1 pl-6 text-base border-b border-gray-300 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="mt-2 flex gap-2 overflow-auto py-2 mb-4">
        <Button variant={selectedTag === "all" ? "default" : "outline"} onClick={() => handleTagSelect("all")} className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1">
          <BoxesIcon />
          All
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            onClick={() => handleTagSelect(tag)}
            className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
          >
            {tag === "Personal" ? (
              <UserIcon />
            ) : tag === "Favorite" ? (
              <HeartIcon />
            ) : null}
            {tag}
          </Button>
        ))}
      </div>
      <div
        className="rounded-full bg-accent-foreground absolute bottom-10 right-4 cursor-pointer z-40"
        onClick={createNew}
      >
        <PlusIcon size={48} className="text-white p-2" />
      </div>

      <NotesList notes={filteredNotes} />
    </div>
  );
}
