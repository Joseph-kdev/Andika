import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

export interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteStore {
  notes: Note[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>
  ) => void;
}

type NoteStorePersist = (
  config: StateCreator<NoteStore>,
  options: PersistOptions<NoteStore>
) => StateCreator<NoteStore>;

export const useNoteStore = create<NoteStore>(
  (persist as NoteStorePersist)(
    (set) => ({
      notes: [],
      addNote: (newNote) =>
        set((state) => ({ notes: [...state.notes, newNote] })),
      removeNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        })),
    }),
    {
      name: "notes-storage",
    }
  )
);
