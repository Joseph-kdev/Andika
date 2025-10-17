"use client";
import { DatePicker } from "@/components/DatePicker";
import { PlusIcon } from "@/components/ui/plus";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { debounce } from "lodash";
import { SearchIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { motion } from "motion/react";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/stores/useTaskStore";
import { Task } from "@/types";
import { Check, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const { state: sidebarState } = useSidebar();
  const [filter, setFilter] = useState("all");
  const tasks = useTaskStore((state) => state.tasks);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const filterTasks = (tasks: Task[]) => {
    let filteredTasks = tasks;

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      filteredTasks = tasks.filter((task) => {
        // Check if task was created on selected date
        const taskDate = new Date(task.createdAt);
        const isDueOnDate =
          task.dueDate &&
          new Date(task.dueDate).toDateString() === selectedDate.toDateString();

        return (taskDate >= startOfDay && taskDate <= endOfDay) || isDueOnDate;
      });
    }

    // Then apply status filter
    switch (filter) {
      case "completed":
        return filteredTasks.filter((task) => task.status === "completed");
      case "pending":
        return filteredTasks.filter((task) => task.status === "pending");
      case "overdue":
        return filteredTasks.filter((task) => task.status === "overdue");
      default:
        return filteredTasks;
    }
  };

  // Get filtered tasks
  const filteredTasks = filterTasks(tasks);

  // Update the task stats section
  const taskStats = {
    all: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const updateTask = useTaskStore.getState().updateTask;
    updateTask(taskId, {
      status: currentStatus === "completed" ? "pending" : "completed",
    });
  };

  return (
    <div className="px-2 w-full min-h-screen relative">
      <SidebarTrigger className="md:hidden absolute right-0" />
      <div>
        <h2 className="text-2xl">Tasks</h2>
        <p className="text-gray-600">Just do it.</p>
      </div>
      <div className="w-full md:max-w-md relative mt-4">
        <SearchIcon height={16} width={16} className="absolute top-2 left-0" />
        <input
          type="text"
          placeholder="Search for a task..."
          value={searchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full py-1 pl-6 text-base border-b border-gray-300 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <div
        className={`md:flex w-full ${
          sidebarState == "collapsed" ? "" : "md:flex-col lg:flex-row"
        }`}
      >
        <div className={`grid grid-cols-4 gap-4 shadow-lg lg:w-1/2`}>
          <div className="rounded-lg p-4 md:min-w-[100px]">
            <p className="text-xs mb-1">All</p>
            <p className="text-[2em]">{taskStats.all}</p>
          </div>
          <div className="rounded-lg p-4 md:min-w-[100px]">
            <p className="text-xs mb-1">Complete</p>
            <p className="text-[2em]">{taskStats.completed}</p>
          </div>
          <div className="rounded-lg p-4 md:min-w-[100px]">
            <p className="text-xs mb-1">Pending</p>
            <p className="text-[2em]">{taskStats.pending}</p>
          </div>
          <div className="rounded-lg p-4 md:min-w-[100px]">
            <p className="text-xs mb-1">Overdue</p>
            <p className="text-[2em]">{taskStats.overdue}</p>
          </div>
        </div>
        <div className="lg:w-1/2">
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>

      <div className="flex gap-2 my-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
          className={`${
            filter == "all"
              ? "shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              : "shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
          }`}
        >
          All
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          size="sm"
          className={`${
            filter == "completed"
              ? "shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              : "shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
          }`}
        >
          Completed
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          size="sm"
          className={`${
            filter == "pending"
              ? "shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              : "shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
          }`}
        >
          Pending
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          onClick={() => setFilter("overdue")}
          size="sm"
          className={`${
            filter == "overdue"
              ? "shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
              : "shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
          }`}
        >
          Overdue
        </Button>
      </div>

      <div
        className="rounded-full bg-accent-foreground absolute bottom-10 right-4 cursor-pointer z-40 shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
        onClick={() => setOpenTaskDialog(true)}
      >
        <PlusIcon size={48} className="text-white p-2" />
      </div>

      {openTaskDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur flex justify-center items-center z-50"
        >
          <div className="h-[80%] min-w-[90%] relative md:min-w-[50%] shadow-2xl">
            <TaskForm setOpenTaskDialog={setOpenTaskDialog} />
          </div>
        </motion.div>
      )}

      <div className="mt-6 space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found</p>
        ) : (
          filteredTasks.map((task) => (
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
                <button className="p-2 hover:bg-muted rounded-full">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
