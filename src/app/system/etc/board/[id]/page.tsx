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
import {
  BoardApi,
  BoardDetail,
  CommentApi,
  CommentSummary,
  GetAllCommentsDomainTypeEnum,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import dynamic from 'next/dynamic';
import { formatDateTime } from '@/lib/utils';
import { positionLabelMap } from '@/constants/position-enum';
import { FileItem } from '@/components/common/file-item';
import { downloadFileFromUrl } from '@/utils/download-file';
import { Card } from '@/components/ui/card';
import ConfirmModal from '@/components/common/confirm-modal';
import { toast } from 'sonner';
import { hexToRgbaWithOpacity } from '@/utils/color-utils';
import { useAuthStore } from '@/store/auth-store';

const MarkdownViewer = dynamic(
  () => import('@/components/common/markdown-viewer'),
  { ssr: false },
);

const boardApi = new BoardApi(getApiConfig());

const commentApi = new CommentApi(getApiConfig());

const defaultColor = '#6b7280';

export default function BoardDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();

  const [post, setPost] = useState<BoardDetail | null>(null);
  const [comments, setComments] = useState<CommentSummary[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loading, setLoading] = useState(true);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // 게시물 상세 정보 불러오기
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

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const data = await commentApi.getAllComments({
        domainType: GetAllCommentsDomainTypeEnum.Board,
        entityId: Number(postId),
      });
      setComments(data.comments || []);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await commentApi.createComment({
        commentRequest: {
          domainType: GetAllCommentsDomainTypeEnum.Board,
          entityId: Number(postId),
          message: newComment.trim(),
        },
      });

      toast.success('댓글이 등록되었습니다.');
      setNewComment('');
      fetchComments(); // 댓글 목록 다시 불러오기
    } catch (error) {
      console.error('댓글 등록 실패:', error);
    }
  };

  const handleEditComment = (commentId: number) => {
    const comment = comments.find((c) => c.commentId === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingCommentContent(comment.message || '');
    }
  };

  const handleSaveComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) return;

    try {
      await commentApi.updateComment({
        commentId,
        commentRequest: {
          domainType: GetAllCommentsDomainTypeEnum.Board,
          entityId: Number(postId),
          message: editingCommentContent.trim(),
        },
      });

      toast.success('댓글이 수정되었습니다.');
      setEditingCommentId(null);
      setEditingCommentContent('');
      fetchComments(); // 목록 갱신
    } catch (error) {
      toast.error('댓글 수정 중 오류가 발생했습니다.');
      console.error('댓글 수정 실패:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.deleteComment({ commentId });
      toast.success('댓글이 삭제되었습니다.');
      fetchComments(); // 목록 갱신
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
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
    <div className="flex-1 space-y-4 md:px-10 lg:px-20">
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
              <Badge
                className="h-9 px-3 py-2 text-sm font-medium"
                style={{
                  backgroundColor: hexToRgbaWithOpacity(
                    post.boardCategory?.color || defaultColor,
                    0.1,
                  ),
                  color: post.boardCategory?.color,
                  borderColor: hexToRgbaWithOpacity(
                    post.boardCategory?.color || defaultColor,
                    0.5,
                  ),
                }}
              >
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
                  <div className="relative">
                    <Textarea
                      placeholder="댓글을 작성하세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      maxLength={200}
                    />

                    <div className="text-muted-foreground absolute right-1.5 bottom-1 text-xs">
                      {newComment.length}/200
                    </div>
                  </div>

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
                  <div key={comment.commentId}>
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
                              {comment.user?.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {comment.createdAt?.toLocaleString()}
                            </span>
                            {comment.updatedAt &&
                              comment.createdAt &&
                              new Date(comment.createdAt).getTime() !==
                                new Date(comment.updatedAt).getTime() && (
                                <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
                                  수정됨
                                </span>
                              )}
                          </div>
                          {comment.user?.userId === user?.userId && (
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
                                {editingCommentId === comment.commentId ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSaveComment(
                                          comment.commentId || -1,
                                        )
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
                                        handleEditComment(
                                          comment.commentId || -1,
                                        )
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      수정
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteComment(
                                          comment.commentId || -1,
                                        )
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
                          {editingCommentId === comment.commentId ? (
                            <div>
                              <Textarea
                                value={editingCommentContent}
                                onChange={(e) =>
                                  setEditingCommentContent(e.target.value)
                                }
                                rows={3}
                                className="resize-none border"
                              />
                              <div className="text-muted-foreground mt-1 flex justify-end pr-1 text-xs">
                                {editingCommentContent.length}/200
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {comment.message}
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
