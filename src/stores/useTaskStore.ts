import { Task } from "@/types";
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

export interface TaskStore {
  tasks: Task[];
  selectedDate: string;
  // Actions
  addTask: (taskData: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

type TaskStorePersist = (
  config: StateCreator<TaskStore>,
  options: PersistOptions<TaskStore>
) => StateCreator<TaskStore>;

export const useTaskStore = create<TaskStore>(
  (persist as TaskStorePersist)(
    (set) => ({
      tasks: [],
      selectedDate: new Date().toISOString().split('T')[0],

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
    }),
    {
      name: "tasks-storage",
    }
  )
);
