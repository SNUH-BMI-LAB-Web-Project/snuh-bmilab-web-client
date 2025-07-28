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
  Calendar,
  Download,
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

  const handleDeletePost = () => {
    router.push('/admin/board');
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
            <div className="mb-6 flex items-center justify-between">
              <Badge className="px-4 py-2 text-sm font-medium">
                {post.boardCategory?.name}
              </Badge>
              <div className="flex justify-end gap-2">
                <Button asChild>
                  <Link href={`/system/researches/projects/${postId}/edit`}>
                    <Edit /> 수정하기
                  </Link>
                </Button>
                <Button variant="destructive" onClick={handleDeletePost}>
                  <Trash /> 삭제하기
                </Button>
              </div>
            </div>

            <h1 className="mb-8 text-4xl leading-tight font-bold text-gray-900">
              {post.title}
            </h1>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-4 border-b pb-6">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={
                    post.author?.profileImageUrl || '/default-profile-image.svg'
                  }
                  alt={post.author?.name}
                  className="object-cover"
                />
              </Avatar>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {post.author?.name}
                  </span>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>조회 {post.viewCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>댓글 {comments.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {/* <span>최초 작성일: {post.createdAt}</span> */}
                  </div>
                  {post.updatedAt !== post.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {/* <span>최종 수정일: {post.updatedAt}</span> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="mb-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-lg leading-8 font-normal whitespace-pre-line text-gray-800">
                {post.content}
              </div>
            </div>
          </div>

          {/* 첨부파일 */}
          {post.files && post.files.length > 0 && (
            <div className="mb-12 border-b pb-8">
              <div className="mb-6 flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  첨부파일 ({post.files.length})
                </h3>
              </div>
              <div className="space-y-3">
                {post.files.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <Paperclip className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">
                        {file.fileName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      다운로드
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 댓글 섹션 */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">댓글</h2>
              <Badge
                variant="secondary"
                className="bg-gray-100 text-sm text-gray-700"
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
                    className="resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="bg-gray-800 text-white hover:bg-gray-900"
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
                            <span className="text-sm font-medium text-gray-900">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500">
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
                              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-sm leading-relaxed text-gray-700">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < comments.length - 1 && (
                      <div className="border-b border-gray-100" />
                    )}
                  </div>
                ))
              ) : (
                <div className="border-t py-12 text-center">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-700">
                    아직 댓글이 없습니다
                  </h3>
                  <p className="text-gray-500">
                    이 게시글에 첫 번째 댓글을 작성해보세요!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
