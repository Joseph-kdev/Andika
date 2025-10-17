export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  tag: string;
}

export type Priority = "low" | "medium" | "high"

export type TaskStatus = "pending" | "completed" | "overdue"


export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface CreateTaskInput {
  title: string
  description: string
  dueDate: string
  priority: Priority
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  dueDate?: Date | null
  priority?: Priority
  status?: TaskStatus
}