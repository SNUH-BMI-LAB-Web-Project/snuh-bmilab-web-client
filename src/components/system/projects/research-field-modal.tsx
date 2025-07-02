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
  Configuration,
  ProjectCategoryApi,
  ProjectCategorySummary,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function ResearchFieldModal() {
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

  const categoryApi = new ProjectCategoryApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  const adminCategoryApi = new AdminProjectCategoryApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

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

  // 새 연구 분야 추가
  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error('연구 분야 이름을 입력해주세요.');
      return;
    }

    if (
      researchFields.some(
        (field) => field?.name?.toLowerCase() === newFieldName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 연구 분야입니다.');
      return;
    }

    try {
      await adminCategoryApi.createProjectCategory({
        projectCategoryRequest: { name: newFieldName.trim() },
      });

      toast.success('연구 분야가 성공적으로 추가되었습니다.');

      const res = await categoryApi.getAllProjectCategories(); // 최신 목록 반영
      setResearchFields(res.categories ?? []);
      setNewFieldName('');
    } catch (error) {
      console.error('연구 분야 추가 실패:', error);
      toast.error('추가에 실패했습니다.');
    }
  };

  // 연구 분야 수정
  const handleEditField = async () => {
    if (!editFieldName.trim()) {
      toast.error('연구 분야 이름을 입력해주세요.');
      return;
    }

    if (
      researchFields.some(
        (field) =>
          field.categoryId !== editingField?.categoryId &&
          field?.name?.toLowerCase() === editFieldName.toLowerCase(),
      )
    ) {
      toast.error('이미 존재하는 연구 분야입니다.');
      return;
    }

    try {
      await adminCategoryApi.updateProjectCategory({
        categoryId: editingField?.categoryId || -1,
        projectCategoryRequest: { name: editFieldName.trim() },
      });

      toast.success('연구 분야가 성공적으로 수정되었습니다.');

      const res = await categoryApi.getAllProjectCategories();
      setResearchFields(res.categories ?? []);
      setEditingField(null);
      setEditFieldName('');
    } catch (error) {
      console.error('연구 분야 수정 실패:', error);
      toast.error('수정에 실패했습니다.');
    }
  };

  // 연구 분야 삭제
  const handleDeleteField = async () => {
    try {
      await adminCategoryApi.deleteById({
        categoryId: deleteField?.categoryId || -1,
      });

      toast.success('연구 분야가 성공적으로 삭제되었습니다.');

      const res = await categoryApi.getAllProjectCategories();
      setResearchFields(res.categories ?? []);
      setDeleteField(null);
    } catch (error) {
      console.error('연구 분야 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Tag className="mr-2 h-4 w-4" />
            연구 분야 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] !max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              연구 분야 관리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 새 연구 분야 추가 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-green-600" />새 연구 분야 추가
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="newField" className="sr-only">
                      연구 분야 이름
                    </Label>
                    <Input
                      id="newField"
                      placeholder="연구 분야 이름을 입력하세요 (예: Artificial Intelligence)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                      className="text-base"
                    />
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

            {/* 연구 분야 목록 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">연구 분야 목록</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    총 {researchFields.length}개
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {researchFields.length === 0 ? (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">
                      등록된 연구 분야가 없습니다.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">연구 분야 이름</TableHead>
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
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editFieldName}
                                  onChange={(e) =>
                                    setEditFieldName(e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === 'Enter' && handleEditField()
                                  }
                                  className="flex-1"
                                  autoFocus
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
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
              <Trash2 className="h-5 w-5 text-red-600" />
              연구 분야 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <strong>{deleteField?.name}</strong> 연구 분야를 정말
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteField}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
