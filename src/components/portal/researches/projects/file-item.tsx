'use client';

import { Button } from '@/components/ui/button';
import { FileText, X, Download } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

type Mode = 'remove' | 'download';

interface FileItemProps {
  file: {
    name: string;
    size?: number;
  };
  index?: number;
  onAction?: (index: number) => void;
  mode?: Mode;
  className?: string;
}

export function FileItem({
  file,
  index = 0,
  onAction,
  mode = 'remove',
  className,
}: FileItemProps) {
  const Icon = mode === 'download' ? Download : X;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border p-3 transition-colors',
        className,
      )}
    >
      <div className="flex items-center overflow-hidden">
        <div className="bg-muted/50 mr-3 rounded-lg p-2">
          <FileText className="text-muted-foreground h-5 w-5" />
        </div>
        <div className="truncate">
          <div className="truncate text-sm font-medium">{file.name}</div>
          {/* <div className="text-muted-foreground text-xs"> */}
          {/*   {formatFileSize(file.size)} */}
          {/* </div> */}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onAction?.(index)}
        className="h-8 w-8 flex-shrink-0"
      >
        <Icon className="h-4 w-4" />
        <span className="sr-only">
          {mode === 'download' ? '다운로드' : '제거'}
        </span>
      </Button>
    </div>
  );
}
