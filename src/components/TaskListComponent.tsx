"use client";
import { formatDate } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import { Priority, Task } from "@/types";
import { Check, Pencil, X } from "lucide-react";
import { DeleteIcon } from "./ui/delete";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { Textarea } from "./ui/textarea";

interface FormData {
  title: string;
  priority: Priority | "";
  dueDate: string;
  description: string;
}

function TaskDeleteDialog({
  task,
  setOpenDeleteDialog,
}: {
  task: Task | null;
  setOpenDeleteDialog: Dispatch<SetStateAction<boolean>>;
}) {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const handleDelete = () => {
    if (!task) {
      return;
    }
    deleteTask(task?.id);
    setOpenDeleteDialog(false);
  };

  return (
    <div className="bg-background shadow-2xl rounded-lg p-6">
      <div className="flex-1 flex justify-center my-6">
        <Image
          width={260}
          height={260}
          src="/delete-ilt.svg"
          alt="delete svg"
        />
      </div>
      <h4 className="font-medium text-center mt-2">
        Are you sure you want to delete the task:
      </h4>
      <p className="text-sm text-muted-foreground mt-1 text-center">
        &quot;{task?.title}&quot; created on{" "}
        {formatDate(task?.createdAt as Date)}
      </p>
      <div className="flex-1 mt-4 flex justify-center gap-3">
        <Button
          variant={"destructive"}
          className="shadow-[0_4px_0_var(--secondary-two)] active:shadow-none active:translate-y-1"
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant={"outline"}
          className="shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
          onClick={() => setOpenDeleteDialog(false)}
        >
          Cancel
        </Button>
      </div>
      <div
        className="border bg-background rounded-md hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 absolute top-4 right-5 cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1 p-1"
        onClick={() => setOpenDeleteDialog(false)}
      >
        <X width={12} height={12} />
      </div>
    </div>
  );
}

function TaskEditDialog({
  task,
  setOpenEditDialog,
}: {
  task: Task | null;
  setOpenEditDialog: Dispatch<SetStateAction<boolean>>;
}) {
  const updateTask = useTaskStore((state) => state.updateTask);

  const [formData, setFormData] = useState<FormData>({
    title: task?.title ?? "",
    priority: task?.priority ?? "low",
    // ensure dueDate is a YYYY-MM-DD string for the date input
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    description: task?.description ?? "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: keyof FormData
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmTaskUpdate = () => {
    if (!task) return;
    if (!formData.title) return;

    updateTask(task.id, {
      title: formData.title,
      description: formData.description ?? undefined,
      priority: formData.priority as Priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
    });

    setOpenEditDialog(false);
  };

  return (
    <div className="bg-background p-6 rounded-lg relative">
      <FieldSet>
        <FieldLegend>Edit Task Details</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel>Task title</FieldLabel>
            <Input
              id="title"
              autoComplete="off"
              placeholder="Enter your task"
              value={formData.title}
              onChange={(e) => handleInputChange(e, "title")}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Select
              onValueChange={(value) => handleInputChange(value, "priority")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Due date</FieldLabel>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange(e, "dueDate")}
              required
            />
          </Field>
          <Field>
            <FieldLabel>
              Description <span>(optional)</span>
            </FieldLabel>
            <Textarea
              id="checkout-7j9-optional-comments"
              placeholder="What are you up to?"
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleInputChange(e, "description")}
            />
          </Field>
          <Field orientation="horizontal">
            <Button
              className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              onClick={confirmTaskUpdate}
            >
              Save
            </Button>
            <Button
              variant={"outline"}
              className="shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
              onClick={() => setOpenEditDialog(false)}
            >
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button
        variant={"outline"}
        className="absolute top-4 right-5 cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
        onClick={() => setOpenEditDialog(false)}
      >
        <X width={12} height={12} />
      </Button>
    </div>
  );
}

export default function TaskListComponent({ tasks }: { tasks: Task[] }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const updateTask = useTaskStore.getState().updateTask;
    updateTask(taskId, {
      status: currentStatus === "completed" ? "pending" : "completed",
    });
  };

  const handleDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const handleEditDialog = (task: Task) => {
    setSelectedTask(task);
    setOpenEditDialog(true);
  };

  return (
    <div className="mt-6 space-y-2">
      {tasks.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center">
          <Image
            className=""
            width={120}
            height={100}
            src={"/sloth-nap.png"}
            alt="No tasks"
          />
          <p className="text-center text-gray-500">No tasks found</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-background rounded-lg border shadow-sm"
          >
            <button
              onClick={() => toggleTaskStatus(task.id, task.status)}
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors
                  ${
                    task.status === "completed"
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  }`}
            >
              {task.status === "completed" && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </button>

            <div className="flex-1 flex flex-col md:flex-row ">
              <div className="">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      task.status === "completed"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start justify-center md:hidden gap-1">
                <span className="text-xs text-muted-foreground">
                  {task.createdAt
                    ? `Created on ${formatDate(task.createdAt)}`
                    : "No creation date found"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {task.dueDate
                    ? `Due by ${formatDate(task.dueDate)}`
                    : "No due date"}
                </span>
              </div>
            </div>

            <div className="flex-1 hidden md:flex flex-col items-start justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                {task.createdAt
                  ? `Created on ${formatDate(task.createdAt)}`
                  : "No creation date found"}
              </span>
              <span className="text-xs text-muted-foreground">
                {task.dueDate
                  ? `Due by ${formatDate(task.dueDate)}`
                  : "No due date"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                className="p-2 hover:bg-muted rounded-md shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                onClick={() => handleEditDialog(task)}
              >
                <Pencil className="text-muted-foreground" />
              </Button>
              <Button
                variant={"outline"}
                className="p-2 hover:bg-muted rounded-md shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                onClick={() => handleDeleteDialog(task)}
              >
                <DeleteIcon />
              </Button>
            </div>
          </div>
        ))
      )}

      {openDeleteDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur flex justify-center items-center z-50"
        >
          <div className="relative">
            <TaskDeleteDialog
              task={selectedTask}
              setOpenDeleteDialog={setOpenDeleteDialog}
            />
          </div>
        </motion.div>
      )}

      {openEditDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur flex justify-center items-center z-50"
        >
          <div className="h-[80%] min-w-[90%] relative md:min-w-[50%] shadow-2xl">
            <TaskEditDialog
              task={selectedTask}
              setOpenEditDialog={setOpenEditDialog}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
