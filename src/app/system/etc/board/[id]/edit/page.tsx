'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  BoardApi,
  BoardDetail,
  BoardRequest,
  FileSummary,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import { BoardPostForm } from '@/components/system/etc/board/board-post-form';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

const boardApi = new BoardApi(getApiConfig());

export default function EditBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await boardApi.getBoardById({ boardId: Number(id) });
        setPost(data);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (
    data: { boardId: number; request: BoardRequest },
    newFiles: FileSummary[],
    removedFileUrls: FileSummary[],
  ): Promise<void> => {
    try {
      const removedFileIds = removedFileUrls
        .map((f) => f.fileId!)
        .filter(Boolean);

      if (removedFileIds.length > 0) {
        await Promise.all(
          removedFileIds.map((fileId) =>
            boardApi.deleteBoardFile({ boardId: data.boardId, fileId }),
          ),
        );
      }

      const fileIds = newFiles.map((f) => f.fileId!).filter(Boolean);

      await boardApi.updateBoard({
        boardId: data.boardId,
        boardRequest: {
          ...data.request,
          fileIds,
        },
      });

      toast.success('게시글이 성공적으로 수정되었습니다.');
      router.push(`/system/etc/board/${data.boardId}`);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <div className="px-30 py-10 text-center">불러오는 중...</div>;
  }

  if (!post) {
    return (
      <div className="px-30 py-10 text-center">게시글을 찾을 수 없습니다.</div>
    );
  }

  return (
    <div className="mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/system/etc/board/${post?.boardId}`)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">게시글 등록</h1>
      </div>

      {/* 등록 폼 */}
      <BoardPostForm initialData={post} onUpdate={handleUpdate} isEditing />
    </div>
  );
}
