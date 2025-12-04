"use client";

import { useParams } from "next/navigation";
import _ from "lodash";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useNotebookStore } from "@/stores/useNotebookStore";
import { PlusIcon } from "@/components/ui/plus";
import { motion } from "motion/react";
import { formatDate } from "@/lib/utils";
import { Page } from "@/types";
import Editor from "@/components/editor";
import { v4 as uuid4 } from "uuid";
import { ChevronRight, ChevronsRight, ChevronLeft, Flame } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import Image from "next/image";

export default function EditingPage() {
  const { id } = useParams<{ id: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(true);
  const { state: sidebarState } = useSidebar();
  const { notebooks, addPage, updatePage } = useNotebookStore();
  const book = notebooks.find((book) => book.id === id);
  const [pageTitle, setPageTitle] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const contentRef = useRef("");
  const hasUnsavedChanges = useRef(false);
  const analytics = useAnalytics();

  // Initialize with first page when book loads
  useEffect(() => {
    if (book && book.pages.length > 0 && !selectedPage) {
      const firstPage = book.pages[0];
      setSelectedPageId(firstPage.id);
      setSelectedPage(firstPage);
      setPageTitle(firstPage.title);
      contentRef.current = firstPage.content;
    }
  }, [book?.id]);

  // Update selected page when book pages change
  useEffect(() => {
    if (book && selectedPageId) {
      const updatedPage = book.pages.find((p) => p.id === selectedPageId);
      if (updatedPage) {
        setSelectedPage(updatedPage);
        setPageTitle(updatedPage.title);
        contentRef.current = updatedPage.content;
      }
    }
  }, [book?.pages, selectedPageId]);

  const onSelectPage = (page: Page) => {
    // Save current page if there are unsaved changes
    if (hasUnsavedChanges.current && selectedPage) {
      updatePage(id, selectedPage.id, {
        title: pageTitle,
        content: contentRef.current,
      });
      hasUnsavedChanges.current = false;
    }

    // Get the fresh page data from the updated store
    const updatedBook = notebooks.find((b) => b.id === id);
    const freshPage = updatedBook?.pages.find((p) => p.id === page.id);

    if (freshPage) {
      setSelectedPageId(freshPage.id);
      setSelectedPage(freshPage);
      setPageTitle(freshPage.title);
      contentRef.current = freshPage.content;
    }
  };

  const handleSave = () => {
    if (!selectedPage) return;

    try {
      setIsSaving(true);
      updatePage(id, selectedPage.id, {
        title: pageTitle,
        content: contentRef.current,
      });
      hasUnsavedChanges.current = false;

      setTimeout(() => {
        setIsSaving(false);
      }, 800);
    } catch (error) {
      setIsSaving(false);
      console.error("Failed to save:", error);
    }
  };

  const createNew = () => {
    // Save current page if there are unsaved changes
    if (hasUnsavedChanges.current && selectedPage) {
      updatePage(id, selectedPage.id, {
        title: pageTitle,
        content: contentRef.current,
      });
      hasUnsavedChanges.current = false;
    }

    const newPage: Omit<Page, "id" | "createdAt" | "modifiedAt"> = {
      title: "Untitled Page",
      content: "",
    };

    addPage(id, newPage);

    // Update local state with the new page
    const updatedBook = notebooks.find((b) => b.id === id);
    if (updatedBook && updatedBook.pages.length > 0) {
      const addedPage = updatedBook.pages[updatedBook.pages.length - 1];
      setSelectedPageId(addedPage.id);
      setSelectedPage(addedPage);
      setPageTitle(addedPage.title);
      contentRef.current = addedPage.content;
    }
  };

  return (
    <div
      className={`flex px-4 w-full min-h-screen relative border my-2 shadow-2xl rounded-md py-2 gap-2 md:gap-4 pt-10 ${
        sidebarState === "expanded"
          ? "md:w-[calc(100vw-16rem)]"
          : "md:w-[calc(100vw-5rem)]"
      }`}
    >
      <div className={`absolute top-0 w-full ${!isPagesOpen && "text-center"}`}>
        <p className="p-2">{book?.title}</p>
      </div>
      <div className="absolute right-2 top-0 flex items-center">
        <div className="p-2 rounded-full flex justify-center items-center">
          <Flame
            className="w-5 h-5"
            fill={analytics.streak.days > 0 ? "#ff9a00" : "none"}
            stroke={analytics.streak.days > 0 ? "#ff5900c0" : "black"}
          />
          <p className="">{analytics.streak.days}</p>
        </div>
        <SidebarTrigger className="md:hidden" />
      </div>

      <div
        className={`overflow-y-auto transition-all duration-300 ${
          isPagesOpen
            ? sidebarState === "expanded"
              ? "w-1/3"
              : "w-1/3"
            : "hidden"
        }`}
      >
        <Button
          onClick={createNew}
          className="w-full flex items-center p-2 gap-1 md:gap-4 cursor-pointer rounded-4xl shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1 text-xs md:text-sm"
        >
          <PlusIcon />
          <p>New Page</p>
        </Button>
        {book?.pages.length == 0 ? (
          <div className="p-4 text-center flex flex-col items-center gap-2 mt-2">
            <Image
              className=""
              width={100}
              height={50}
              src={"/paper-pad.svg"}
              alt="No pages"
            />
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              No pages yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2 py-2 mt-2">
            {book?.pages.map((page) => (
              <motion.button
                key={page.id}
                onClick={() => onSelectPage(page)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedPageId === page.id
                    ? "bg-secondary border-l-4 border-muted-foreground"
                    : "hover:bg-gray-100 border-l-4 border-transparent"
                }`}
              >
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {page.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(page.modifiedAt)}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`w-full overflow-hidden flex flex-col transition-all duration-300 ${
          isPagesOpen
            ? sidebarState === "expanded"
              ? "w-2/3 md:max-w-5xl mx-auto"
              : "w-2/3 md:max-w-5xl mx-auto"
            : "w-2/3 md:max-w-5xl mx-auto"
        }`}
      >
        {book?.pages.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <div>
              <Image
                className=""
                width={200}
                height={160}
                src={"/sloth-lap.png"}
                alt="No pages"
              />
              <p className="text-xs md:text-sm text-gray-600 mt-2">Lets goooooo, make a page.</p>
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`flex justify-between items-end transition-all duration-300 relative flex-wrap gap-2`}
            >
              <div className="absolute top-0 flex items-center gap-1 justify-start">
                <Button
                  onClick={() => setIsPagesOpen(!isPagesOpen)}
                  variant="outline"
                  className="p-2 h-auto w-auto hover:bg-transparent cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1"
                >
                  {isPagesOpen ? <ChevronLeft /> : <ChevronRight />}
                </Button>
                <ChevronsRight width={16} />
                <p className="text-xs truncate">
                  {_.truncate(book?.title, { length: 15 })}
                </p>
                <ChevronRight width={16} />
                <p className="text-xs truncate">
                  {_.truncate(selectedPage?.title, { length: 15 })}
                </p>
              </div>
              <div className="flex-1 mt-12 min-w-0">
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    hasUnsavedChanges.current = true;
                  }}
                  placeholder="Page title"
                  className="w-full focus:outline-none text-lg font-semibold"
                />
              </div>
              <Button
                className={`shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1 transition-all flex-shrink text-xs h-6 ${
                  isSaving
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-amber-500"
                }`}
                onClick={handleSave}
                variant={"default"}
              >
                {isSaving ? "Saved!" : "Save"}
              </Button>
            </div>
            <div
              className={`md:max-w-5xl mx-auto mt-1 ${
                isPagesOpen ? "w-full overflow-x-auto" : "w-full"
              }`}
            >
              {selectedPage ? (
                <Editor
                  content={selectedPage.content}
                  contentRef={contentRef}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onContentChange={(pageId, updates) => {
                    // Persist incoming autosave content to the notebook store
                    contentRef.current = updates.content;
                    hasUnsavedChanges.current = false;
                    try {
                      updatePage(id, pageId, {
                        content: updates.content,
                      });
                    } catch (err) {
                      console.error("Failed to autosave page content:", err);
                    }
                  }}
                  noteId={selectedPage.id}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No pages yet. Create one to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
