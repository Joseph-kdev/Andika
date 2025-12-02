import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { NoteBook, Page } from "@/types";
import { v4 as uuid4 } from "uuid";

interface NotebookStore {
  notebooks: NoteBook[];
  
  // Actions
  addNotebook: (notebook: Omit<NoteBook, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  updateNotebook: (id: string, updates: Partial<NoteBook>) => void;
  deleteNotebook: (id: string) => void;
  
  // Page actions
  addPage: (notebookId: string, page: Omit<Page, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  updatePage: (notebookId: string, pageId: string, updates: Partial<Page>) => void;
  deletePage: (notebookId: string, pageId: string) => void;
}

type NotebookStorePersist = (
  config: StateCreator<NotebookStore>,
  options: PersistOptions<NotebookStore>
) => StateCreator<NotebookStore>;

export const useNotebookStore = create<NotebookStore>(
  (persist as NotebookStorePersist)(
    (set) => ({
      notebooks: [],

      addNotebook: (notebookData) =>
        set((state) => ({
          notebooks: [
            ...state.notebooks,
            {
              id: uuid4(),
              ...notebookData,
              pages: [],
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNotebook: (id, updates) =>
        set((state) => ({
          notebooks: state.notebooks.map((notebook) =>
            notebook.id === id
              ? { ...notebook, ...updates, modifiedAt: new Date().toISOString() }
              : notebook
          ),
        })),

      deleteNotebook: (id) =>
        set((state) => ({
          notebooks: state.notebooks.filter((n) => n.id !== id),
        })),

      addPage: (notebookId, pageData) =>
        set((state) => ({
          notebooks: state.notebooks.map((notebook) =>
            notebook.id === notebookId
              ? {
                  ...notebook,
                  pages: [
                    ...notebook.pages,
                    {
                      id: uuid4(),
                      ...pageData,
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                    },
                  ],
                  modifiedAt: new Date().toISOString(),
                }
              : notebook
          ),
        })),

      updatePage: (notebookId, pageId, updates) =>
        set((state) => ({
          notebooks: state.notebooks.map((notebook) =>
            notebook.id === notebookId
              ? {
                  ...notebook,
                  pages: notebook.pages.map((page) =>
                    page.id === pageId
                      ? { ...page, ...updates, modifiedAt: new Date().toISOString() }
                      : page
                  ),
                  modifiedAt: new Date().toISOString(),
                }
              : notebook
          ),
        })),

      deletePage: (notebookId, pageId) =>
        set((state) => ({
          notebooks: state.notebooks.map((notebook) =>
            notebook.id === notebookId
              ? {
                  ...notebook,
                  pages: notebook.pages.filter((p) => p.id !== pageId),
                  modifiedAt: new Date().toISOString(),
                }
              : notebook
          ),
        })),
    }),
    {
      name: "notebooks-storage",
    }
  )
);