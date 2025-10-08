"use client";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useNoteStore } from "@/stores/useNoteStore";
import _ from "lodash";
import { ChevronDown, ChevronsRight, ChevronUp, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useOnClickOutside } from "usehooks-ts";
import { UserIcon } from "@/components/ui/user";
import { HeartIcon } from "@/components/ui/heart";
import { Circle } from "@uiw/react-color";
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from "@/components/ui/emoji-picker";

export default function Note() {
  const { id } = useParams<{ id: string }>();
  const notes = useNoteStore((state) => state.notes);
  const note = notes.find((note) => note.id == id);
  const updateNote = useNoteStore((state) => state.updateNote);
  const addTag = useNoteStore((state) => state.addTag);
  const tags = useNoteStore((state) => state.tags);

  const [title, setTitle] = useState(note?.title || "");
  const [selectedTag, setSelectedTag] = useState(note?.tag || "Untagged");
  const [isSaving, setIsSaving] = useState(false);
  const [showOtherNotes, setShowOtherNotes] = useState(true);
  const contentRef = useRef(note?.content || "");
  const hasUnsavedChanges = useRef(false);

  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("")

  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const { state: sidebarState } = useSidebar();
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpenTagDialog(false));

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(id, { title: newTitle });
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    updateNote(id, { tag });
    hasUnsavedChanges.current = true;
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag({
        name: newTagName,
        color: newTagColor,
        emoji: newTagEmoji
      });
      setNewTagName("");
      setNewTagColor("#ffffff");
      setNewTagEmoji('')
      setOpenTagDialog(false);
    }
  };

  const handleSave = () => {
    try {
      setIsSaving(true);
      updateNote(id, {
        title,
        content: contentRef.current,
        tag: selectedTag,
      });

      hasUnsavedChanges.current = false;

      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      console.error("Failed to save:", error);
    }
  };

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && noteRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const noteWidth = noteRef.current.scrollWidth;
        const maxDrag = Math.max(0, noteWidth - containerWidth);
        setDragConstraints({ left: -maxDrag, right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [notes, sidebarState]);

  useEffect(() => {
    setTitle(note?.title || "");
    setSelectedTag(note?.tag || "Untagged");
  }, [note]);

  console.log("tags", tags);

  return (
    <div
      className={`p-2 w-full md:mx-auto ${
        sidebarState === "collapsed"
          ? "md:w-[calc(100vw-4rem)]"
          : "md:w-[calc(100vw-16rem)]"
      }`}
    >
      <div className="flex w-full justify-between">
        <div className="flex items-center gap-1">
          <p className="">Notes</p>
          <ChevronsRight className="w-6 h-6" />
          <p>{note?.title === "" ? "Unnamed" : note?.title}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowOtherNotes(!showOtherNotes)}
          className="hidden md:block shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
        >
          {showOtherNotes && notes.length > 1 ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div
        className="flex-1 gap-2 overflow-hidden py-2 no-scrollbar cursor-grab active:cursor-grabbing"
        ref={containerRef}
      >
        <motion.div
          ref={noteRef}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={true}
          className="flex gap-4"
        >
          {showOtherNotes && notes.length > 1 &&
            notes.map((n) => (
              <div
                key={n.id}
                className="hidden md:flex rounded-lg p-4 shadow-md flex-col justify-between min-w-sm overflow-x-auto cursor-pointer"
              >
                <div>
                  <h3 className="text-lg font-semibold">{n.title}</h3>
                  <p className="text-gray-700 mt-2">
                    {_.truncate(n.content, { length: 50, omission: "..." })}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium">
                    {n.tag}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(n.modifiedAt)}
                  </span>
                </div>
              </div>
            ))}
        </motion.div>
      </div>

      <div className="shadow-2xl rounded-lg pt-4 mt-4">
        <div className="flex justify-between md:max-w-5xl mx-auto mb-4">
          <input
            type="text"
            placeholder="Note title"
            value={title}
            className="py-1 pl-1 text-base border-b border-gray-300 outline-none text-gray-700 placeholder-gray-400 w-2/3"
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <Button
            className={`mr-2 border pb-2 cursor-pointer shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1 ${
              isSaving ? "bg-green-500 border-green-500" : "border-amber-500"
            }`}
            onClick={handleSave}
            variant={"secondary"}
          >
            {isSaving ? "Saved!" : "Save"}
          </Button>
        </div>

        <div className="mt-1 flex gap-2 overflow-auto py-2 md:max-w-5xl mx-auto mb-1">
          {tags.map((tag, index) => (
            <Button
              key={index}
              variant={selectedTag === tag.name ? "default" : "outline"}
              onClick={() => handleTagChange(tag.name)}
              className={`shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1 hover:${tag.color}`}
            >
              {tag.name === "Personal" ? (
                <UserIcon />
              ) : tag.name === "Favorite" ? (
                <HeartIcon />
              ) : null}
              {tag.emoji}{"  "}
              {tag.name}
            </Button>
          ))}
          <Button
            variant={"outline"}
            onClick={() => setOpenTagDialog(true)}
            className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1"
          >
            <Plus />
            New Tag
          </Button>
        </div>

        {openTagDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex justify-center items-center z-50"
          >
            <div
              className="bg-white min-w-sm p-4 rounded-lg relative"
              ref={ref}
            >
              <X className="w-4 h-4 absolute top-2 right-4" />
              <h2 className="text-center text-lg mb-4">Create New Tag</h2>
              <div className="flex flex-col gap-4 mb-4">
                <Input
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <p>Pick a color for your tag:</p>
                <Circle
                  colors={[
                    "#f44336",
                    "#e91e63",
                    "#9c27b0",
                    "#673ab7",
                    "#3f51b5",
                    "#2196f3",
                    "#F44E3B",
                    "#FE9200",
                    "#FCDC00",
                    "#DBDF00",
                  ]}
                  color={newTagColor}
                  onChange={(color) => setNewTagColor(color.hex)}
                />
                <p>
                  An emoji for your tag: {newTagEmoji ? newTagEmoji : ''}
                </p>
                <EmojiPicker
                  className="h-[156px] w-full rounded-lg border shadow-md"
                  onEmojiSelect={({ emoji }) => {
                    setNewTagEmoji(emoji)
                  }}
                >
                  <EmojiPickerSearch />
                  <EmojiPickerContent className="w-full active:bg-accent" />
                </EmojiPicker>
              </div>
              <div className="w-full flex justify-center">
                <Button onClick={handleAddTag}>Create</Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className=" md:max-w-5xl mx-auto">
          {note ? (
            <Editor
              content={note.content}
              contentRef={contentRef}
              hasUnsavedChanges={hasUnsavedChanges}
              onContentChange={updateNote}
              noteId={id}
            />
          ) : (
            <div>loading..</div>
          )}
        </div>
      </div>
    </div>
  );
}
