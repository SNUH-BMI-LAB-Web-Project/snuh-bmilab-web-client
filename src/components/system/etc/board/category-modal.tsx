'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookOpen, Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import {
  AdminBoardCategoryApi,
  BoardCategoryApi,
  BoardCategorySummary,
} from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';
import { hexToRgbaWithOpacity } from '@/utils/color-utils';
import { HexColorPicker } from 'react-colorful';

const categoryApi = new BoardCategoryApi(getApiConfig());

const adminCategoryApi = new AdminBoardCategoryApi(getApiConfig());

const defaultColor = '#6b7280';

export default function CategoryModal() {
  const [open, setOpen] = useState(false);
  const [boardCategories, setBoardCategories] = useState<
    BoardCategorySummary[]
  >([]);
  const [editingCategory, setEditingCategory] =
    useState<BoardCategorySummary | null>(null);
  const [deleteCategory, setDeleteCategory] =
    useState<BoardCategorySummary | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(defaultColor);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const isEditMode = editingCategory !== null;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategorys = async () => {
      try {
        const res = await categoryApi.getAllBoardCategories();
        setBoardCategories(res.categories ?? []);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    fetchCategorys();
  }, []);

  // 새 카테고리 추가
  const handleAddField = async () => {
    if (!newCategoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    if (
      boardCategories.some(
        (field) => field?.name?.toLowerCase() === newCategoryName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 카테고리입니다.');
      return;
    }

    try {
      await adminCategoryApi.createBoardCategory({
        boardCategoryReqeust: {
          name: newCategoryName.trim(),
          color: newCategoryColor,
        },
      });

      toast.success('카테고리가 성공적으로 추가되었습니다.');

      const res = await categoryApi.getAllBoardCategories(); // 최신 목록 반영
      setBoardCategories(res.categories ?? []);
      setNewCategoryName('');
      setNewCategoryColor(defaultColor);
    } catch (error) {
      console.log(error);
    }
  };

  // 카테고리 수정
  const handleEditField = async () => {
    if (!editCategoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    if (
      boardCategories.some(
        (field) =>
          field.boardCategoryId !== editingCategory?.boardCategoryId &&
          field?.name?.toLowerCase() === editCategoryName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 카테고리입니다.');
      return;
    }

    try {
      await adminCategoryApi.updateBoardCategory({
        categoryId: editingCategory?.boardCategoryId || -1,
        boardCategoryReqeust: {
          name: editCategoryName.trim(),
          color: editCategoryColor,
        },
      });

      toast.success('카테고리가 성공적으로 수정되었습니다.');

      const res = await categoryApi.getAllBoardCategories();
      setBoardCategories(res.categories ?? []);
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryColor(defaultColor);
    } catch (error) {
      console.log(error);
    }
  };

  // 카테고리 삭제
  const handleDeleteField = async () => {
    try {
      await adminCategoryApi.deleteBoardCategory({
        categoryId: deleteCategory?.boardCategoryId || -1,
      });

      toast.success('카테고리가 성공적으로 삭제되었습니다.');

      const res = await categoryApi.getAllBoardCategories();
      setBoardCategories(res.categories ?? []);
      setDeleteCategory(null);

      // 삭제 후 폼 초기화
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryColor(defaultColor);
      setNewCategoryName('');
      setNewCategoryColor(defaultColor);
    } catch (error) {
      console.log(error);
    }
  };

  // 수정 모드 시작
  const startEdit = (field: BoardCategorySummary) => {
    setEditingCategory(field);
    setEditCategoryName(field.name || '');
    setEditCategoryColor(field.color || defaultColor);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryColor(defaultColor);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);

          if (!isOpen) {
            setEditingCategory(null);
            setEditCategoryName('');
            setEditCategoryColor(defaultColor);
            setNewCategoryName('');
            setNewCategoryColor(defaultColor);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Tag className="mr-2 h-4 w-4" />
            카테고리 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] !max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              카테고리 관리
            </DialogTitle>
          </DialogHeader>

          {/* 새 카테고리 추가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {isEditMode ? (
                  <>
                    <Edit className="h-5 w-5" />
                    카테고리 수정
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />새 카테고리 추가
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="newField" className="sr-only">
                    카테고리 명
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <Input
                        id="newField"
                        placeholder="카테고리 명을 입력하세요 (예: 교육 자료)"
                        value={isEditMode ? editCategoryName : newCategoryName}
                        onChange={(e) =>
                          isEditMode
                            ? setEditCategoryName(e.target.value)
                            : setNewCategoryName(e.target.value)
                        }
                        onKeyPress={(e) =>
                          e.key === 'Enter' &&
                          (isEditMode ? handleEditField() : handleAddField())
                        }
                        className="pr-12 text-base"
                        maxLength={30}
                      />

                      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500">
                        {
                          (isEditMode ? editCategoryName : newCategoryName)
                            .length
                        }
                        /30
                      </span>
                    </div>
                    <div className="relative w-fit" ref={colorPickerRef}>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                      <div
                        className="h-8 w-8 cursor-pointer rounded border"
                        style={{
                          backgroundColor: isEditMode
                            ? editCategoryColor
                            : newCategoryColor,
                        }}
                        onClick={() => setShowColorPicker((prev) => !prev)}
                      />

                      {showColorPicker && (
                        <div className="absolute z-10 mt-2 w-[100px]">
                          <HexColorPicker
                            color={
                              isEditMode ? editCategoryColor : newCategoryColor
                            }
                            onChange={
                              isEditMode
                                ? setEditCategoryColor
                                : setNewCategoryColor
                            }
                            className="!h-[160px] !w-[160px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isEditMode ? (
                  <>
                    <Button
                      onClick={handleEditField}
                      disabled={!editCategoryName.trim()}
                    >
                      <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="mr-2 h-4 w-4" /> 취소
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAddField}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" /> 추가
                  </Button>
                )}
              </div>
              {/* 새 카테고리 미리보기 - 이름이 있을 때만 표시 */}
              {(isEditMode ? editCategoryName : newCategoryName).trim() && (
                <div className="mt-3 flex items-center gap-2 rounded bg-gray-50 px-2 py-2 text-sm text-gray-600">
                  <span>미리보기:</span>
                  <div
                    className="rounded px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: hexToRgbaWithOpacity(
                        isEditMode ? editCategoryColor : newCategoryColor,
                        0.1,
                      ),
                      color: isEditMode ? editCategoryColor : newCategoryColor,
                    }}
                  >
                    {isEditMode ? editCategoryName : newCategoryName}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 카테고리 목록 */}
          <div className="mt-3 overflow-x-auto">
            <Card className="min-w-[539px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">카테고리 목록</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    총 {boardCategories.length}개
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {boardCategories.length === 0 ? (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">등록된 카테고리가 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">카테고리 명</TableHead>
                        <TableHead className="w-[100px] text-center">
                          액션
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boardCategories.map((field) => (
                        <TableRow key={field.boardCategoryId}>
                          <TableCell>
                            <div className="flex items-center gap-2 pl-4">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: field.color || defaultColor,
                                }}
                              />
                              <div className="font-medium">{field.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(field)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteCategory(field)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              카테고리 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <strong>{deleteCategory?.name}</strong> 카테고리를 정말
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteField}
              className="bg-destructive hover:bg-destructive/90 text-white shadow-xs"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
