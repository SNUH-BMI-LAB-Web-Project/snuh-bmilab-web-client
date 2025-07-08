'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { UserCheck, Plus, Edit, Trash2, Save, Building } from 'lucide-react';
import {
  AdminExternalProfessorApi,
  Configuration,
  ExternalProfessorItem,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function ExternalProfessorPage() {
  const [professors, setProfessors] = useState<ExternalProfessorItem[]>([]);
  const [editingProfessor, setEditingProfessor] =
    useState<ExternalProfessorItem | null>(null);
  const [deleteProfessor, setDeleteProfessor] =
    useState<ExternalProfessorItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
  });

  const api = new AdminExternalProfessorApi(
    new Configuration({
      accessToken: async () => useAuthStore.getState().accessToken ?? '',
    }),
  );

  const fetchProfessors = async () => {
    try {
      const res = await api.getAllExternalProfessors();
      setProfessors(res.externalProfessors ?? []);
    } catch (e) {
      console.error('외부 인사 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      department: '',
    });
  };

  // 새 교수 추가
  const handleAddProfessor = async () => {
    try {
      await api.createExternalProfessor({
        externalProfessorRequest: {
          name: formData.name,
          organization: formData.organization,
          department: formData.department,
        },
      });
      resetForm();

      toast.success('외부 인사가 성공적으로 추가되었습니다.');

      await fetchProfessors();
    } catch (e) {
      toast.error('외부 인사 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  // 교수 정보 수정
  const handleEditProfessor = async () => {
    try {
      await api.updateExternalProfessor({
        professorId: Number(editingProfessor?.professorId),
        externalProfessorRequest: {
          name: formData.name,
          organization: formData.organization,
          department: formData.department,
        },
      });
      resetForm();
      setEditingProfessor(null);

      toast.success('외부 인사 정보가 성공적으로 수정되었습니다.');

      await fetchProfessors();
    } catch (e) {
      toast.error(
        '외부 인사 정보 수정 중 오류가 발생했습니다. 다시 시도해 주세요.',
      );
    }
  };

  // 교수 삭제
  const handleDeleteProfessor = async () => {
    try {
      await api.deleteExternalProfessor({
        professorId: Number(deleteProfessor?.professorId),
      });

      if (
        editingProfessor &&
        editingProfessor.professorId === deleteProfessor?.professorId
      ) {
        setEditingProfessor(null);
        resetForm();
      }

      setDeleteProfessor(null);

      toast.success('외부 인사가 성공적으로 삭제되었습니다.');

      await fetchProfessors();
    } catch (e) {
      toast.error('외부 인사 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  // 수정 모드 시작
  const startEdit = (professor: ExternalProfessorItem) => {
    setEditingProfessor(professor);
    setFormData({
      name: professor.name || '',
      organization: professor.organization || '',
      department: professor.department || '',
    });
  };

  // 수정/추가 취소
  const cancelForm = () => {
    setEditingProfessor(null);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">외부 인사</h1>

      {/* 추가/수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {editingProfessor ? (
              <>
                <Edit className="h-5 w-5 text-blue-600" />
                정보 수정
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-green-600" />새 외부 인사 추가
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={10}
                placeholder="홍길동"
              />
              {formData.name.length >= 10 && (
                <p className="mt-1 text-sm text-red-500">
                  이름은 최대 10자까지 입력 가능합니다.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">기관 *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) =>
                  handleInputChange('organization', e.target.value)
                }
                maxLength={50}
                placeholder="서울대학교"
              />
              {formData.organization.length >= 50 && (
                <p className="mt-1 text-sm text-red-500">
                  기관명은 최대 50자까지 입력 가능합니다.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange('department', e.target.value)
                }
                maxLength={20}
                placeholder="컴퓨터공학부"
              />
              {formData.department.length >= 20 && (
                <p className="mt-1 text-sm text-red-500">
                  부서명은 최대 20자까지 입력 가능합니다.
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={cancelForm}>
              취소
            </Button>
            <Button
              onClick={
                editingProfessor ? handleEditProfessor : handleAddProfessor
              }
              disabled={!formData.name.trim() || !formData.organization.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingProfessor ? '수정' : '추가'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 overflow-x-auto">
        {/* 교수 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">외부 인사 목록</CardTitle>
              <Badge variant="secondary" className="text-sm">
                총 {professors.length}명
              </Badge>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <CardContent className="min-w-[768px] p-0">
              {professors.length === 0 ? (
                <div className="py-8 text-center">
                  <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">등록된 외부 인사가 없습니다.</p>
                </div>
              ) : (
                <Table className="min-w-[768px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">이름</TableHead>
                      <TableHead>소속 기관</TableHead>
                      <TableHead>학과/부서</TableHead>
                      <TableHead className="w-[100px] text-center">
                        액션
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professors.map((professor) => (
                      <TableRow
                        key={`${professor.name}-${professor.organization}`}
                      >
                        <TableCell>
                          <div className="pl-4 font-medium">
                            {professor.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400" />
                            <span>{professor.organization}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">
                            {professor.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(professor)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteProfessor(professor)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
          </div>
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteProfessor}
        onOpenChange={() => setDeleteProfessor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              외부 인사 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <strong>{deleteProfessor?.name}</strong> 인사 정보를 정말
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfessor}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
