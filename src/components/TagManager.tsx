import React, { useRef, useState } from "react";
import { useNoteStore } from "@/stores/useNoteStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "./ui/emoji-picker";
import { Circle } from "@uiw/react-color";
import { useOnClickOutside } from "usehooks-ts";

interface EditingTag {
  originalName: string;
  name: string;
  color: string;
  emoji: string;
}

export default function TagManager({ setOpenTagManage }: { setOpenTagManage: (value: boolean) => void }) {
  const tags = useNoteStore((state) => state.tags);
  const updateTag = useNoteStore((state) => state.updateTag);
  const removeTag = useNoteStore((state) => state.removeTag);
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, () => setOpenTagManage(false));

  const handleEditStart = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    console.log("tag to edit", tag)
    if (tag) {
      setEditingTag({
        originalName: tag.name,
        name: tag.name,
        color: tag.color,
        emoji: tag.emoji || "",
      });
    }
  };

  const handleEditSave = () => {
    console.log("first")
    if (editingTag) {
      updateTag(editingTag.originalName, {
        name: editingTag.name,
        color: editingTag.color,
        emoji: editingTag.emoji,
      });
      setEditingTag(null);
    }
  };

  const handleDelete = (tagName: string) => {
    removeTag(tagName);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background p-6 rounded-lg shadow-lg w-[90%] max-w-md" ref={ref}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Tags</h2>
          <Button variant="ghost" onClick={() => setOpenTagManage(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {tags.map((tag) => (
            <div key={tag.name} className="flex gap-2 p-2 border rounded-lg">
              {editingTag?.originalName === tag.name ? (
                <div className="flex flex-col gap-4">
                  <Input
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <div>
                    <p className="mb-2 text-sm">Pick a color for your tag:</p>
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
                      color={editingTag.color}
                      onChange={(color) =>
                        setEditingTag({ ...editingTag, color: color.hex })
                      }
                    />
                  </div>
                  <div className="relative">
                    <p className="mb-2 text-sm">
                      An emoji for your tag: {editingTag.emoji}
                    </p>
                    <EmojiPicker
                      className="h-[156px] w-full rounded-lg border shadow-md"
                      onEmojiSelect={({ emoji }) => {
                        setEditingTag({ ...editingTag, emoji });
                      }}
                    >
                      <EmojiPickerSearch />
                      <EmojiPickerContent className="w-full active:bg-accent" />
                    </EmojiPicker>
                  </div>
                  <Button
                    onClick={handleEditSave}
                    className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1 bg-primary/90"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.emoji}</span>
                    <span>{tag.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleEditStart(tag.name)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(tag.name)}
                    disabled={
                      tag.name === "Personal" ||
                      tag.name === "Work" ||
                      tag.name === "Favorite"
                    }
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
