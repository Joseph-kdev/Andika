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
  updateOverdueTasks: () => void;
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

      updateOverdueTasks: () => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.status === 'pending' && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            console.log(`Task: ${task.title}, Due: ${dueDate.toISOString()}, Today: ${today.toISOString()}, Is Overdue: ${dueDate < today}`);
            if (dueDate < today) {
              return {
                ...task,
                status: 'overdue' as const,
                updatedAt: new Date(),
              };
            }
          }
          return task;
        })
      })),
    }),
    {
      name: "tasks-storage",
    }
  )
);
