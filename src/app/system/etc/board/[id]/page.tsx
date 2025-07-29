'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Paperclip,
  Save,
  X,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BoardApi, BoardDetail } from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import dynamic from 'next/dynamic';
import { formatDateTime } from '@/lib/utils';
import { positionLabelMap } from '@/constants/position-enum';
import { FileItem } from '@/components/portal/researches/projects/file-item';
import { downloadFileFromUrl } from '@/utils/download-file';
import { Card } from '@/components/ui/card';
import ConfirmModal from '@/components/common/confirm-modal';
import { toast } from 'sonner';

const MarkdownViewer = dynamic(
  () => import('@/components/portal/researches/projects/markdown-viewer'),
  { ssr: false },
);

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

const boardApi = new BoardApi(getApiConfig());

export default function BoardDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();

  const [post, setPost] = useState<BoardDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = '현재사용자';
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await boardApi.getBoardById({ boardId: Number(postId) });
        setPost(data);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    try {
      await boardApi.deleteBoard({ boardId: Number(postId) });
      toast.success('게시글이 삭제되었습니다.');
      router.push('/system/etc/board');
    } catch (e) {
      console.log(e);
    } finally {
      setShowDeleteAlert(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: currentUser,
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingCommentContent(comment.content);
    }
  };

  const handleSaveComment = (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content: editingCommentContent.trim(),
              updatedAt: new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : comment,
      ),
    );
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <div className="text-lg text-slate-600">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-2 text-xl font-semibold text-slate-700">
            게시글을 찾을 수 없습니다
          </div>
          <div className="text-slate-500">
            요청하신 게시글이 존재하지 않거나 삭제되었습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="min-h-screen bg-white">
        <div className="">
          {/* 상단 네비게이션 */}
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <Link href="/system/etc/board">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* 게시글 헤더 */}
          <div className="mb-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <Badge className="px-4 py-2 text-sm font-medium">
                {post.boardCategory?.name}
              </Badge>
              <div className="flex justify-end gap-2">
                <Button asChild>
                  <Link href={`/system/etc/board/${postId}/edit`}>
                    <Edit /> 수정하기
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash /> 삭제하기
                </Button>
              </div>
            </div>

            <h1 className="mb-8 text-3xl leading-tight font-bold">
              {post.title}
            </h1>

            {/* 작성자 정보 */}
            <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center">
              {/* 프로필 이미지 */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage
                  src={
                    post.author?.profileImageUrl || '/default-profile-image.svg'
                  }
                  alt={post.author?.name}
                  className="object-cover"
                />
              </Avatar>

              {/* 왼쪽: 작성자 정보 + 오른쪽: 조회수 등 */}
              <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {/* 작성자 정보 */}
                <div>
                  <div className="flex items-center gap-2 text-lg font-medium text-black">
                    {post.author?.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {post.author?.organization} {post.author?.department}{' '}
                    {post.author?.position &&
                      positionLabelMap[post.author.position]}{' '}
                    · {post.author?.email}
                  </div>
                </div>

                {/* 오른쪽 정보 */}
                <div className="flex flex-col gap-2 text-right">
                  <div className="text-muted-foreground flex flex-wrap justify-end gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>조회 {post.viewCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>댓글 {comments.length}</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <div>
                      최초 작성일:{' '}
                      {post.createdAt
                        ? formatDateTime(post.createdAt.toString())
                        : '-'}
                    </div>
                    <div>
                      최종 수정일:{' '}
                      {post.updatedAt
                        ? formatDateTime(post.updatedAt.toString())
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="mb-12">
            <MarkdownViewer content={post.content || ''} />
          </div>

          {/* 첨부파일 */}
          {post.files && post.files.length > 0 && (
            <div className="mb-12 border-b pb-8">
              <div className="mb-6 flex items-center gap-3">
                <Paperclip className="h-5 w-5" />
                <h3 className="text-xl font-semibold">
                  첨부파일 ({post.files.length})
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                {post.files && post.files.length > 0 ? (
                  post.files.map((file, index) => (
                    <FileItem
                      key={file.fileId}
                      file={{
                        name: file.fileName!,
                      }}
                      index={index}
                      onAction={() =>
                        downloadFileFromUrl(file.fileName!, file.uploadUrl!)
                      }
                      mode="download"
                    />
                  ))
                ) : (
                  <Card className="text-muted-foreground px-4 py-6 text-center text-sm">
                    등록된 첨부파일이 없습니다.
                  </Card>
                )}
              </ul>
            </div>
          )}

          {/* 댓글 섹션 */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              {/* <MessageCircle className="h-6 w-6" /> */}
              <h2 className="text-xl font-bold">댓글</h2>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground text-sm"
              >
                {comments.length}
              </Badge>
            </div>

            {/* 댓글 작성 */}
            <div className="mb-8">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={
                      post.author?.profileImageUrl ||
                      '/default-profile-image.svg'
                    }
                    alt={post.author?.name}
                    className="object-cover"
                  />
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="댓글을 작성하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none border"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      댓글 등록
                    </Button>
                  </div>
                </div>
              </div>
              <Separator className="mt-8" />
            </div>

            {/* 댓글 목록 */}
            <div>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={comment.id}>
                    <div className="group flex gap-4 py-6">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage
                          src={
                            post.author?.profileImageUrl ||
                            '/default-profile-image.svg'
                          }
                          alt={post.author?.name}
                          className="object-cover"
                        />
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {comment.author}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {comment.createdAt}
                            </span>
                            {comment.updatedAt && (
                              <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
                                수정됨
                              </span>
                            )}
                          </div>
                          {comment.author === currentUser && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {editingCommentId === comment.id ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSaveComment(comment.id)
                                      }
                                    >
                                      <Save className="mr-2 h-4 w-4" />
                                      저장
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={handleCancelEdit}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      취소
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditComment(comment.id)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      수정
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="text-destructive"
                                    >
                                      <Trash2 className="text-destructive mr-2 h-4 w-4" />
                                      삭제
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="pl-0">
                          {editingCommentId === comment.id ? (
                            <Textarea
                              value={editingCommentContent}
                              onChange={(e) =>
                                setEditingCommentContent(e.target.value)
                              }
                              rows={3}
                              className="resize-none border"
                            />
                          ) : (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < comments.length - 1 && (
                      <div className="border-b" />
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <MessageCircle className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-muted-foreground mb-1 text-lg font-medium">
                    아직 댓글이 없습니다
                  </h3>
                  <p className="text-muted-foreground">
                    이 게시글에 첫 번째 댓글을 작성해보세요!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        title="게시글 삭제"
        description="해당 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
      />
    </div>
  );
}
