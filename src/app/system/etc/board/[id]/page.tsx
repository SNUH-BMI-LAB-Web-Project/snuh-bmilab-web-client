'use client';

import { useParams } from 'next/navigation';
import BoardDetail from '@/components/system/etc/board/board-detail';

export default function BoardDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  return (
    <div className="flex-1 space-y-4">
      <BoardDetail postId={postId} />
    </div>
  );
}
