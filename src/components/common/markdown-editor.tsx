'use client';

import React, { useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { useAuthStore } from '@/store/auth-store';
import { uploadFileWithPresignedUrl } from '@/lib/upload';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  content: string;
  setContent: (value: string) => void;
  hasMoreFeatures?: boolean;
  onImageUploaded?: (file: {
    fileId: string;
    fileName: string;
    size: number;
    uploadUrl: string;
  }) => void;
}

export default function MarkdownEditor({
  content,
  setContent,
  hasMoreFeatures = false,
  onImageUploaded,
}: MarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

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
      hooks={{
        addImageBlobHook: async (
          blob: Blob,
          callback: (url: string, altText: string) => void,
        ) => {
          try {
            const file = blob as File;
            const rec = await uploadFileWithPresignedUrl(file, accessToken!);

            const raw: unknown =
              rec?.uploadUrl ?? rec?.url ?? rec?.fileUrl ?? rec?.downloadUrl;

            let url: string | null = null;

            if (typeof raw === 'string') {
              url = raw;
            } else if (raw instanceof URL) {
              url = raw.toString();
            } else if (raw && typeof raw === 'object') {
              if (
                'href' in raw &&
                typeof (raw as { href: unknown }).href === 'string'
              ) {
                url = (raw as { href: string }).href;
              } else if (
                'url' in raw &&
                typeof (raw as { url: unknown }).url === 'string'
              ) {
                url = (raw as { url: string }).url;
              }
            }

            if (!url) {
              throw new Error('no string URL in response');
            }

            const alt = rec?.fileName || file?.name || 'image';

            callback(url, alt);

            if (rec?.fileId) {
              onImageUploaded?.({
                fileId: rec.fileId,
                fileName: rec.fileName,
                size: rec.size,
                uploadUrl: url,
              });
            }
          } catch (e) {
            console.error(e);
            toast.error('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
          }
        },
      }}
    />
  );
}
