"use client"

import React, { useCallback, useEffect, useState} from 'react'
import "easymde/dist/easymde.min.css";
import { SimpleEditor } from './tiptap-templates/simple/simple-editor';
import { debounce } from 'lodash';

interface EditorProps {
    content: string;
    onContentChange: (content: string) => void;
}

export default function Editor({ content, onContentChange }: EditorProps) {
    const [value, setValue] = useState(content);

  const debouncedOnChange = useCallback(
    debounce((textContent: string) => {
      onContentChange(textContent);
    }, 1000),
    [onContentChange]
  );

  //handle editor changes
  const handleChange = useCallback(
    (textContent: string) => {
        setValue(textContent)
        debouncedOnChange(textContent)
    }, [debouncedOnChange])

    // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <div>
        <SimpleEditor content={value} onChange={handleChange} />
    </div>
  )
}
