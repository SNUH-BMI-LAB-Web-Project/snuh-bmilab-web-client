import { Suspense } from 'react';
import BoardDetail from '@/components/system/etc/board/board-detail';

interface BoardDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BoardDetailPage({
  params,
}: BoardDetailPageProps) {
  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <BoardDetail postId={params.id} />
      </Suspense>
    </div>
  );
}
