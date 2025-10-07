"use client"

import React, { useCallback, useEffect, MutableRefObject } from 'react'
import "easymde/dist/easymde.min.css";
import { SimpleEditor } from './tiptap-templates/simple/simple-editor';
import { useSidebar } from "@/components/ui/sidebar";

interface EditorProps {
    content: string;
    contentRef: MutableRefObject<string>;
    hasUnsavedChanges: MutableRefObject<boolean>;
    onContentChange: (id: string, updates: { content: string }) => void;
    noteId: string;
}

export default function Editor({ 
  content, 
  contentRef, 
  hasUnsavedChanges, 
  onContentChange,
  noteId
}: EditorProps) {
  const handleChange = useCallback((newContent: string) => {
    contentRef.current = newContent;
    hasUnsavedChanges.current = true;
  }, [contentRef, hasUnsavedChanges]);

  // Autosave after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges.current) {
        onContentChange(noteId, { content: contentRef.current });
        hasUnsavedChanges.current = false;
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [onContentChange, noteId, contentRef]);

  // Add warning when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  const { state: sidebarState } = useSidebar();
  
  return (
    <div className={`h-full overflow-y-auto transition-all duration-300 ${
      sidebarState === "collapsed" ? "md:px-4" : "md:px-2"
    }`}>
      <SimpleEditor 
        content={content} 
        onChange={handleChange} 
      />
    </div>
  );
}
