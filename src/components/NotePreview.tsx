"use client";
import "@/styles/markdown.scss";
import "../app/globals.css"
import { Note, useNoteStore } from "@/stores/useNoteStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function NotePreview({ note }: { note: Note }) {
  const router = useRouter();
  const [readyRemove, setReadyRemove] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);

  const removeNote = useNoteStore(store => store.removeNote)

  const handleEdit = () => {
    router.push(`notes/editor/${note.id}`);
  };

  const handleDelete = () => {
    setReadyRemove(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    removeNote(note.id);
    setIsDeleting(false)
    setReadyRemove(false)
  };

  return (
    <div className="px-2">
      {/* desktop action buttons */}
      <div className="hidden md:flex w-full justify-end gap-2 my-2 items-center">
        <Tooltip>
          <TooltipTrigger onClick={handleEdit}>
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M8 10H16M8 6H12M8 14H11"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M17.9541 16.9394L18.9541 15.9394C19.392 15.5015 20.102 15.5015 20.5399 15.9394V15.9394C20.9778 16.3773 20.9778 17.0873 20.5399 17.5252L19.5399 18.5252M17.9541 16.9394L14.963 19.9305C14.8131 20.0804 14.7147 20.2741 14.6821 20.4835L14.4394 22.0399L15.9957 21.7973C16.2052 21.7646 16.3988 21.6662 16.5487 21.5163L19.5399 18.5252M17.9541 16.9394L19.5399 18.5252"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
          </TooltipTrigger>
          <TooltipContent>
            Edit
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={handleDelete}>
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M21 6L15.375 6M3 6L8.625 6M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6L15.375 6"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
          </TooltipTrigger>
          <TooltipContent>
            Delete
          </TooltipContent>
        </Tooltip>
      </div>
      {/* mobile action buttons */}
      <div className="md:hidden flex items-center absolute top-3 gap-2">
        <button className="p-1 border rounded-full" onClick={handleEdit}>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#000000"
          >
            <path
              d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <button className="p-1 border rounded-full" onClick={handleDelete}>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#000000"
          >
            <path
              d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M21 6L15.375 6M3 6L8.625 6M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6L15.375 6"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
      </div>
      <div>
        <h2 className="text-2xl mt-8 md:mt-2">{note.title}</h2>
        <hr className="my-2" />
        <div className="prose max-w-none markdown-preview h-[86vh] overflow-y-scroll">
          <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {note.content}
          </Markdown>
        </div>
        <p className="overflow-y-scroll"></p>
      </div>
      {/* Trash interaction */}
      {readyRemove && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6 text-center">
            
            <h3 className="text-xl font-semibold mb-4">Delete Note</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this note.
              This action cannot be undone.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setReadyRemove(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
