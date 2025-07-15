'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { UserCheck, Plus, Save, Building } from 'lucide-react';
import {
  AdminExternalProfessorApi,
  ExternalProfessorItem,
} from '@/generated-api';
import { toast } from 'sonner';
import { getApiConfig } from '@/lib/config';

const api = new AdminExternalProfessorApi(getApiConfig());

interface ExternalProfessorSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (prof: ExternalProfessorItem) => void;
  selectedProfessorKeys?: string[];
}

export default function ExternalProfessorSelectModal({
  open,
  onClose,
  onSelect,
  selectedProfessorKeys = [],
}: ExternalProfessorSelectModalProps) {
  const [professors, setProfessors] = useState<ExternalProfessorItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    position: '',
  });

  const getProfessorKey = (p: ExternalProfessorItem) =>
    `${p.name}-${p.organization}-${p.department}-${p.position}`;

  const fetchProfessors = async () => {
    try {
      const res = await api.getAllExternalProfessors();
      setProfessors(res.externalProfessors ?? []);
    } catch (e) {
      console.error('외부 인사 조회 실패:', e);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfessors();
    }
  }, [open]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      department: '',
      position: '',
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
          position: formData.position,
        },
      });
      resetForm();

      toast.success('외부 인사가 성공적으로 추가되었습니다.');

      await fetchProfessors();
    } catch (e) {
      console.log(e);
    }
  };

  // 수정/추가 취소
  const cancelForm = () => {
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full !max-w-4xl overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            외부 인사 관리
          </DialogTitle>
        </DialogHeader>

        {/* 추가/수정 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />새 외부 인사 추가
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={10}
                  placeholder="홍길동"
                />
                {formData.name.length >= 10 && (
                  <p className="text-destructive mt-1 text-sm">
                    이름은 최대 10자까지 입력 가능합니다.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">
                  기관 <span className="text-destructive text-xs">*</span>
                </Label>
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
                  <p className="text-destructive mt-1 text-sm">
                    기관명은 최대 50자까지 입력 가능합니다.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">
                  부서 <span className="text-destructive text-xs">*</span>
                </Label>
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
                  <p className="text-destructive mt-1 text-sm">
                    부서명은 최대 20자까지 입력 가능합니다.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">
                  직책 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange('position', e.target.value)
                  }
                  maxLength={20}
                  placeholder="직책 예시"
                />
                {formData.position.length >= 20 && (
                  <p className="text-destructive mt-1 text-sm">
                    직책명은 최대 20자까지 입력 가능합니다.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={cancelForm}>
                취소
              </Button>
              <Button
                onClick={handleAddProfessor}
                disabled={
                  !formData.name.trim() ||
                  !formData.organization.trim() ||
                  !formData.department.trim() ||
                  !formData.position.trim()
                }
              >
                <Save className="mr-2 h-4 w-4" />
                추가
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

            <CardContent className="p-0">
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
                      <TableHead>기관</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>직책</TableHead>
                      <TableHead className="w-[100px] text-center" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professors.map((professor) => {
                      const key = getProfessorKey(professor);
                      const isSelected = selectedProfessorKeys?.includes(key);

                      return (
                        <TableRow key={key}>
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
                          <TableCell className="min-w-[120px]">
                            <span>{professor.department}</span>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <span>{professor.position}</span>
                          </TableCell>
                          <TableCell className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="px-3"
                              onClick={() => onSelect(professor)}
                              disabled={isSelected}
                            >
                              {isSelected ? '선택됨' : '선택'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
