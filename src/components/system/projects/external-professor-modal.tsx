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
import { UserCheck, Plus, Edit, Trash2, Save, Building } from 'lucide-react';
import {
  AdminProjectControllerApi,
  Configuration,
  ExternalProfessorItem,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function ExternalProfessorModal() {
  const [open, setOpen] = useState(false);
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

  const api = new AdminProjectControllerApi(
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
      toast.error('추가에 실패했습니다.');
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
      toast.error('수정에 실패했습니다.');
    }
  };

  // 교수 삭제
  const handleDeleteProfessor = async () => {
    try {
      await api.deleteExternalProfessor({
        professorId: Number(deleteProfessor?.professorId),
      });
      setDeleteProfessor(null);

      toast.success('외부 인사가 성공적으로 삭제되었습니다.');

      await fetchProfessors();
    } catch (e) {
      toast.error('삭제에 실패했습니다.');
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserCheck className="mr-2 h-4 w-4" />
            외부 인사 관리
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              외부 인사 관리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
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
                      <Plus className="h-5 w-5 text-green-600" />새 외부 인사
                      추가
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
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">소속 기관 *</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) =>
                        handleInputChange('organization', e.target.value)
                      }
                      placeholder="서울대학교"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">학과/부서</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange('department', e.target.value)
                      }
                      placeholder="컴퓨터공학부"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={cancelForm}>
                    취소
                  </Button>
                  <Button
                    onClick={
                      editingProfessor
                        ? handleEditProfessor
                        : handleAddProfessor
                    }
                    disabled={
                      !formData.name.trim() || !formData.organization.trim()
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingProfessor ? '수정' : '추가'}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
              <CardContent className="p-0">
                {professors.length === 0 ? (
                  <div className="py-8 text-center">
                    <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">
                      등록된 외부 인사가 없습니다.
                    </p>
                  </div>
                ) : (
                  <Table>
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
            </Card>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
