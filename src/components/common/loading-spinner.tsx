'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  text = '로딩 중...',
}: {
  text?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-primary h-10 w-10 animate-spin" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
