import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { Note } from "../types";

interface TagInfo {
  name: string;
  color: string;
  emoji?: string;
}

const defaultTags: TagInfo[] = [
  { name: "Personal", color: "#FFE4E1", emoji:'' },
  { name: "Favorite", color: "#FFF0F5", emoji:'' },
];

interface NoteStore {
  notes: Note[];
  tags: TagInfo[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content" | "tag">>
  ) => void;
  addTag: (tag: TagInfo) => void;
  removeTag: (tagName: string) => void;
  updateTag:(tagName: string, updates: Partial<Pick<TagInfo, "name" | "color" | "emoji">>) => void;
}

type NoteStorePersist = (
  config: StateCreator<NoteStore>,
  options: PersistOptions<NoteStore>
) => StateCreator<NoteStore>;

export const useNoteStore = create<NoteStore>(
  (persist as NoteStorePersist)(
    (set) => ({
      notes: [],
      tags: defaultTags,  // Initialize with default tags
      addNote: (newNote) =>
        set((state) => ({ notes: [...state.notes, {...newNote, createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), tag: newNote.tag || "untagged"}] })),
      removeNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, modifiedAt: new Date().toISOString() } : note
          ),
        })),
      addTag: (tag: TagInfo) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),
      removeTag: (tagName: string) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.name !== tagName),
        })),
      updateTag: (tagName, updates) => set((state) => ({
        tags: state.tags.map(tag => tag.name === tagName ? {...tag, ...updates} : tag)
      }))
    }),
    {
      name: "notes-storage",
    }
  )
);
