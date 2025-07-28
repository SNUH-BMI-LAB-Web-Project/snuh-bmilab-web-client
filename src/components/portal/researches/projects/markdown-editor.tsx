'use client';

import React, { useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';

interface MarkdownEditorProps {
  content: string;
  setContent: (value: string) => void;
  hasMoreFeatures?: boolean;
}

export default function MarkdownEditor({
  content,
  setContent,
  hasMoreFeatures = false,
}: MarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();

    if (!editorInstance) return undefined;

    const handleChange = () => {
      const markdown = editorInstance.getMarkdown();
      setContent(markdown);
    };

    editorInstance.on('change', handleChange);

    return () => {
      editorInstance.off('change', handleChange);
    };
  }, [setContent]);

  return (
    <Editor
      ref={editorRef}
      initialValue={
        content?.trim() === '' ? '여기에 내용을 입력해 주세요...' : content
      }
      placeholder=" "
      height="400px"
      initialEditType="markdown"
      previewStyle="vertical"
      hideModeSwitch
      useCommandShortcut
      toolbarItems={
        hasMoreFeatures
          ? [
              ['heading', 'bold', 'italic', 'strike'],
              ['hr', 'quote'],
              ['ul', 'ol', 'task'],
              ['code', 'codeblock'],
              ['table', 'link', 'image'],
            ]
          : [
              ['heading', 'bold', 'italic', 'strike'],
              ['hr', 'quote'],
              ['ul', 'ol', 'task'],
              ['code', 'codeblock'],
            ]
      }
    />
  );
}
