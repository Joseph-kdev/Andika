import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { Note } from "../../types";

interface NoteStore {
  notes: Note[];
  tags: string[],
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content" | "tag">>
  ) => void;
  addTag: (tag: string) => void;
}

type NoteStorePersist = (
  config: StateCreator<NoteStore>,
  options: PersistOptions<NoteStore>
) => StateCreator<NoteStore>;

export const useNoteStore = create<NoteStore>(
  (persist as NoteStorePersist)(
    (set) => ({
      notes: [],
      tags: ['Personal', 'Favorite', 'Untagged'],
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
        addTag(tag) {
          set((state) => ({
            tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag]
          }))
        },
    }),
    {
      name: "notes-storage",
    }
  )
);
