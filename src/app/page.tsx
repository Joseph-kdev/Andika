"use client";

import NotesList from "@/components/NotesList";
import { BookTextIcon } from "@/components/ui/book-text";
import { useNoteStore } from "@/stores/useNoteStore";
import { useTaskStore } from "@/stores/useTaskStore";
import "react-circular-progressbar/dist/styles.css";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import RadialSeparators from "@/components/RadialSeparator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { formatDate } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { Flame, PinIcon, PinOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import { useAnalytics } from "@/hooks/use-analytics";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const notes = useNoteStore((state) => state.notes);
  const tasks = useTaskStore((state) => state.tasks);
  const { state: sidebarState } = useSidebar();
  // Replace your existing refs and state
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const pinnedNoteRef = useRef<HTMLDivElement>(null);
  const recentContainerRef = useRef<HTMLDivElement>(null);
  const recentNoteRef = useRef<HTMLDivElement>(null);

  const [pinnedDragConstraints, setPinnedDragConstraints] = useState({
    left: 0,
    right: 0,
  });
  const [recentDragConstraints, setRecentDragConstraints] = useState({
    left: 0,
    right: 0,
  });

  const tags = useNoteStore((state) => state.tags);
  const router = useRouter();

  const togglePinNote = useNoteStore((state) => state.togglePinNote);
  const analytics = useAnalytics();

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || "transparent";
  };

  // Get recent and pinned notes
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const recentNotes = notes
    .filter((note) => !note.isPinned) // Exclude pinned notes from recent
    .sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    )
    .slice(0, 4);
  const pendingTasks = tasks
    .filter((task) => task.status === "pending" || task.status === "overdue")
    .slice(0, 3);

  // Update the useEffect
  useEffect(() => {
    const updateConstraints = () => {
      // Update pinned notes constraints
      if (pinnedContainerRef.current && pinnedNoteRef.current) {
        const containerWidth = pinnedContainerRef.current.offsetWidth;
        const noteWidth = pinnedNoteRef.current.scrollWidth;
        const maxDrag = Math.max(0, noteWidth - containerWidth);
        setPinnedDragConstraints({ left: -maxDrag, right: 0 });
      }

      // Update recent notes constraints
      if (recentContainerRef.current && recentNoteRef.current) {
        const containerWidth = recentContainerRef.current.offsetWidth;
        const noteWidth = recentNoteRef.current.scrollWidth;
        const maxDrag = Math.max(0, noteWidth - containerWidth);
        setRecentDragConstraints({ left: -maxDrag, right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [notes, sidebarState, pinnedNotes.length, recentNotes.length]);

  return (
    <div
      className={`px-4 border my-2 shadow-2xl rounded-md py-2 w-full ${
        sidebarState === "collapsed"
          ? "md:w-[calc(100vw-4rem)]"
          : "md:w-[calc(100vw-15rem)]"
      }`}
    >
      <SidebarTrigger className="md:hidden absolute right-2" />
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">Welcome back</h1>
      </div>

      <section className="mb-4 md:flex md:gap-4">
        <div className="mb-2 md:min-w-xs">
          <h2 className="mb-1">Analytics</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full flex justify-center items-center">
                  <Flame
                    className="w-8 h-8"
                    fill={analytics.streak.days > 0 ? "#ff9a00" : "none"}
                    stroke={analytics.streak.days > 0 ? "#ff5900c0" : "black"}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="">{analytics.streak.days} consecutive days</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full flex justify-center items-center">
                  <BookTextIcon className="w-8 h-8" color="#d99d29" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notes Created</p>
                  <p className="">{analytics.noteStats.thisWeek} this week</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-full w-12 h-12">
                  <CircularProgressbarWithChildren
                    value={analytics.tasksStats.completionRate}
                    text={`${analytics.tasksStats.completionRate}%`}
                    strokeWidth={10}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                    })}
                  >
                    <RadialSeparators
                      count={12}
                      style={{
                        background: "#fff",
                        width: "2px",
                        // This needs to be equal to props.strokeWidth
                        height: `${10}%`,
                      }}
                    />
                  </CircularProgressbarWithChildren>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="">{analytics.tasksStats.completed} completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          <h2 className="mb-2 md:mb-4">Pinned notes</h2>
          {pinnedNotes.length === 0 ? (
            <div
              className={`relative h-[268px] w-full flex rounded-md ${
                sidebarState === "collapsed"
                  ? "md:w-[calc(100vw-28rem)]"
                  : "md:w-[calc(100vw-36rem)]"
              }`}
            >
              <div className="absolute inset-0 bg-white/90 z-20"></div>
              <div className="w-full flex justify-center">
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 z-50">
                  <h3>No pinned notes so far</h3>
                  <Button
                    variant={"outline"}
                    className="mt-1 w-20 shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                    onClick={() => router.push("/notes")}
                  >
                    Get started
                  </Button>
                </div>
              </div>
              <Image
                className="h-[268px] min-w-sm"
                width={260}
                height={100}
                src={
                  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHExcnE1dGUzcWs1eGp2MWRlcWppaWZvMG8zbzV2Z3cyYXlwb2c5NyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/iqatr9kJTDezD9YLpZ/giphy.gif"
                }
                alt="sticking notes"
              />
              <Image
                className="h-[268px] min-w-sm"
                width={260}
                height={100}
                src={
                  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHExcnE1dGUzcWs1eGp2MWRlcWppaWZvMG8zbzV2Z3cyYXlwb2c5NyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/iqatr9kJTDezD9YLpZ/giphy.gif"
                }
                alt="sticking notes"
              />
              <Image
                className="h-[268px] min-w-sm"
                width={260}
                height={100}
                src={
                  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHExcnE1dGUzcWs1eGp2MWRlcWppaWZvMG8zbzV2Z3cyYXlwb2c5NyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/iqatr9kJTDezD9YLpZ/giphy.gif"
                }
                alt="sticking notes"
              />
            </div>
          ) : (
            <div>
              <div className="md:hidden">
                <NotesList notes={pinnedNotes} />
              </div>
              <div
                className="hidden md:block flex-1 overflow-hidden gap-2 py-2 no-scrollbar cursor-grab active:cursor-grabbing"
                ref={pinnedContainerRef}
              >
                <motion.div
                  ref={pinnedNoteRef}
                  drag="x"
                  dragConstraints={pinnedDragConstraints}
                  dragElastic={0.1}
                  dragMomentum={true}
                  className="flex gap-4"
                >
                  {pinnedNotes.map((note) => {
                    const rotation = _.random(-2, 2, true);
                    const tagColor = getTagColor(note.tag);
                    return (
                      <motion.div
                        key={note.id}
                        className="relative shadow-xl rounded-lg p-2 h-[250px] md:min-w-sm"
                        initial={{ rotate: rotation }}
                        whileHover={{
                          rotate: 0,
                          boxShadow: "0px 8px 16px rgba(0,0,0,0.4)",
                        }}
                        style={{
                          backgroundColor: tagColor,
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-[8px] border-accent border-1 px-2 py-1 rounded-lg">
                            {note.tag}
                          </p>
                          <button
                            onClick={() => togglePinNote(note.id)}
                            className="p-1 hover:bg-muted rounded-full"
                          >
                            {note.isPinned ? (
                              <PinOffIcon className="h-4 w-4 text-primary" />
                            ) : (
                              <PinIcon className="h-4 w-4 text-foreground" />
                            )}
                          </button>
                        </div>
                        <div
                          className="mb-4 cursor-pointer mt-2"
                          onClick={() => router.push(`notes/${note.id}`)}
                        >
                          <h2 className="text-lg my-1 font-semibold">
                            {note.title}
                          </h2>
                          <div className="mb-4">
                            <Markdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            >
                              {_.truncate(note.content, {
                                length: 150,
                                omission: "...",
                              })}
                            </Markdown>
                          </div>
                        </div>
                        <p className="absolute bottom-4 right-2 opacity-70">
                          {formatDate(note.modifiedAt)}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-4 md:flex md:gap-4">
        <div className="mb-2 md:min-w-xs">
          <h2 className="mb-1">Pending tasks</h2>
          {pendingTasks.length === 0 ? (
            <div className="w-full shadow-xl h-[260px] flex flex-col items-center p-4">
              <div className="flex justify-center">
                <Image
                  width="132"
                  height="120"
                  src="/sloth-sleeping.png"
                  alt="sleeping sloth"
                />
              </div>
              <div className="text-center">
                <h3>All Clear</h3>
                <p className="text-muted-foreground">No pending tasks!</p>
              </div>
              <Button
                variant={"outline"}
                className="mt-4 w-20 shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                onClick={() => router.push("/tasks")}
              >
                Show All
              </Button>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg shadow-sm"
              >
                <div
                  className={`h-5 w-5 rounded-full bg-red-400 border-2 flex items-center justify-center
                `}
                ></div>
                <div className="flex-1 flex flex-col">
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
                  <span className="text-xs text-muted-foreground mt-1">
                    {task.dueDate
                      ? `Due by ${formatDate(task.dueDate)}`
                      : "No due date"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="overflow-hidden">
          <h2 className="mb-2 md:mb-4">Recent notes</h2>
          {recentNotes.length === 0 ? (
            <div
              className={`relative border h-[260px] w-full flex rounded-md ${
                sidebarState === "collapsed"
                  ? "md:w-[calc(100vw-28rem)]"
                  : "md:w-[calc(100vw-36rem)]"
              }`}
            >
              <div className="w-full flex justify-center bg-[#f8f9fe]">
                <div className="relative text-center">
                  <div className="flex justify-center">
                    <p className="absolute top-10">
                      Seems you haven&apos;t created any
                    </p>
                  </div>
                  <Image
                    className=""
                    width={260}
                    height={100}
                    src={
                      "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXpzOTBqMXN4aGMydTFva3hsajd2ZmtmZmZzdDBoZWx1cDF3d29tbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6wZpP5PLB9WEpwaqiW/giphy.gif"
                    }
                    alt="recent notes"
                  />
                  <div className="w-full flex justify-center">
                    <Button
                      variant={"outline"}
                      className="mt-1 w-20 shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1 absolute bottom-8"
                      onClick={() => router.push("/notes")}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="md:hidden">
                <NotesList notes={recentNotes} />
              </div>
              <div
                className="hidden md:block flex-1 overflow-hidden gap-2 py-2 no-scrollbar cursor-grab active:cursor-grabbing"
                ref={recentContainerRef}
              >
                <motion.div
                  ref={recentNoteRef}
                  drag="x"
                  dragConstraints={recentDragConstraints}
                  dragElastic={0.1}
                  dragMomentum={true}
                  className="flex gap-4"
                >
                  {recentNotes.map((note) => {
                    const rotation = _.random(-2, 2, true);
                    const tagColor = getTagColor(note.tag);
                    return (
                      <motion.div
                        key={note.id}
                        className="relative shadow-xl rounded-lg p-2 h-[250px] md:min-w-sm"
                        initial={{ rotate: rotation }}
                        whileHover={{
                          rotate: 0,
                          boxShadow: "0px 8px 16px rgba(0,0,0,0.4)",
                        }}
                        style={{
                          backgroundColor: tagColor,
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-[8px] border-accent border-1 px-2 py-1 rounded-lg">
                            {note.tag}
                          </p>
                          <button
                            onClick={() => togglePinNote(note.id)}
                            className="p-1 hover:bg-muted rounded-full"
                          >
                            {note.isPinned ? (
                              <PinOffIcon className="h-4 w-4 text-primary" />
                            ) : (
                              <PinIcon className="h-4 w-4 text-foreground" />
                            )}
                          </button>
                        </div>
                        <div
                          className="mb-4 cursor-pointer mt-2"
                          onClick={() => router.push(`notes/${note.id}`)}
                        >
                          <h2 className="text-lg my-1 font-semibold">
                            {note.title}
                          </h2>
                          <div className="mb-4">
                            <Markdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            >
                              {_.truncate(note.content, {
                                length: 150,
                                omission: "...",
                              })}
                            </Markdown>
                          </div>
                        </div>
                        <p className="absolute bottom-4 right-2 opacity-70">
                          {formatDate(note.modifiedAt)}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* <section>
        <h2 className="mb-1">
              Scrapbook
        </h2>
        <div className="min-h-15 border p-2">
              <Textarea placeholder="Random thoughts..." className="mt-4" />
        </div>
      </section> */}
    </div>
  );
}
