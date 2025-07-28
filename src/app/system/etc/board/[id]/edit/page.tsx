'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BoardApi, BoardRequest, FileSummary } from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';
import { BoardPostForm } from '@/components/system/etc/board/board-post-form';

const boardApi = new BoardApi(getApiConfig());

export default function NewProject() {
  const router = useRouter();

  const handleCreate = async (data: BoardRequest, newFiles: FileSummary[]) => {
    try {
      await boardApi.createBoard({
        boardRequest: {
          ...data,
          fileIds: newFiles.map((file) => file.fileId!).filter(Boolean),
        },
      });

      toast.success('게시글이 성공적으로 등록되었습니다!');
      router.push('/system/etc/board');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/system/etc/board')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">게시글 등록</h1>
      </div>

      {/* 등록 폼 */}
      <BoardPostForm onCreate={handleCreate} />
    </div>
  );
}
