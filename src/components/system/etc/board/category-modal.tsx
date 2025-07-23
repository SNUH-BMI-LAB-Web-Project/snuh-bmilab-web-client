'use client';

import { useEffect, useState } from 'react';
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
  AdminProjectCategoryApi,
  ProjectCategoryApi,
  ProjectCategorySummary,
} from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';

const categoryApi = new ProjectCategoryApi(getApiConfig());

const adminCategoryApi = new AdminProjectCategoryApi(getApiConfig());

export default function CategoryModal() {
  const [open, setOpen] = useState(false);
  const [researchFields, setResearchFields] = useState<
    ProjectCategorySummary[]
  >([]);
  const [editingField, setEditingField] =
    useState<ProjectCategorySummary | null>(null);
  const [deleteField, setDeleteField] = useState<ProjectCategorySummary | null>(
    null,
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [editFieldName, setEditFieldName] = useState('');

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategorys = async () => {
      try {
        const res = await categoryApi.getAllProjectCategories();
        setResearchFields(res.categories ?? []);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    fetchCategorys();
  }, []);

  // 새 카테고리 추가
  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    if (
      researchFields.some(
        (field) => field?.name?.toLowerCase() === newFieldName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 카테고리입니다.');
      return;
    }

    try {
      await adminCategoryApi.createProjectCategory({
        projectCategoryRequest: { name: newFieldName.trim() },
      });

      toast.success('카테고리가 성공적으로 추가되었습니다.');

      const res = await categoryApi.getAllProjectCategories(); // 최신 목록 반영
      setResearchFields(res.categories ?? []);
      setNewFieldName('');
    } catch (error) {
      console.log(error);
    }
  };

  // 카테고리 수정
  const handleEditField = async () => {
    if (!editFieldName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    if (
      researchFields.some(
        (field) =>
          field.categoryId !== editingField?.categoryId &&
          field?.name?.toLowerCase() === editFieldName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 카테고리입니다.');
      return;
    }

    try {
      await adminCategoryApi.updateProjectCategory({
        categoryId: editingField?.categoryId || -1,
        projectCategoryRequest: { name: editFieldName.trim() },
      });

      toast.success('카테고리가 성공적으로 수정되었습니다.');

      const res = await categoryApi.getAllProjectCategories();
      setResearchFields(res.categories ?? []);
      setEditingField(null);
      setEditFieldName('');
    } catch (error) {
      console.log(error);
    }
  };

  // 카테고리 삭제
  const handleDeleteField = async () => {
    try {
      await adminCategoryApi.deleteById({
        categoryId: deleteField?.categoryId || -1,
      });

      toast.success('카테고리가 성공적으로 삭제되었습니다.');

      const res = await categoryApi.getAllProjectCategories();
      setResearchFields(res.categories ?? []);
      setDeleteField(null);
    } catch (error) {
      console.log(error);
    }
  };

  // 수정 모드 시작
  const startEdit = (field: ProjectCategorySummary) => {
    setEditingField(field);
    setEditFieldName(field.name || '');
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingField(null);
    setEditFieldName('');
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);

          if (!isOpen) {
            setEditingField(null);
            setEditFieldName('');
            setNewFieldName('');
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Tag className="mr-2 h-4 w-4" />
            카테고리 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] !max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              카테고리 관리
            </DialogTitle>
          </DialogHeader>

          {/* 새 카테고리 추가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />새 카테고리 추가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="newField" className="sr-only">
                    카테고리 명
                  </Label>
                  <Input
                    id="newField"
                    placeholder="카테고리 명을 입력하세요 (예: 교육 자료)"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                    className="text-base"
                    maxLength={30}
                  />
                  {newFieldName.length >= 30 && (
                    <p className="text-destructive mt-1 ml-1 text-sm">
                      최대 30자까지 입력할 수 있습니다.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleAddField}
                  disabled={!newFieldName.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  추가
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 카테고리 목록 */}
          <div className="mt-3 overflow-x-auto">
            <Card className="min-w-[539px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">카테고리 목록</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    총 {researchFields.length}개
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {researchFields.length === 0 ? (
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
                      {researchFields.map((field) => (
                        <TableRow key={field.categoryId}>
                          <TableCell>
                            {editingField?.categoryId === field.categoryId ? (
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editFieldName}
                                    onChange={(e) =>
                                      setEditFieldName(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                      e.key === 'Enter' && handleEditField()
                                    }
                                    className="w-full"
                                    autoFocus
                                    maxLength={30}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={handleEditField}
                                    disabled={!editFieldName.trim()}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                {editFieldName.length >= 30 && (
                                  <p className="text-destructive mt-1 ml-1 text-xs">
                                    최대 30자까지 입력할 수 있습니다.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="pl-4 font-medium">
                                {field.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingField?.categoryId ===
                            field.categoryId ? null : (
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
                                  onClick={() => setDeleteField(field)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
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
        open={!!deleteField}
        onOpenChange={() => setDeleteField(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              카테고리 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <strong>{deleteField?.name}</strong> 카테고리를 정말
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
