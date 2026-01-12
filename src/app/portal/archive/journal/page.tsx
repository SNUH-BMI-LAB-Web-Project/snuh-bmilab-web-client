'use client';

import React, { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Plus, Edit, Trash2, Save, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

import {
  ResearchApi,
  type JournalSummaryResponse,
  CreateJournalRequestCategoryEnum,
  UpdateJournalRequestCategoryEnum,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';

const api = new ResearchApi(getApiConfig());

type JournalForm = {
  journalName: string;
  category: CreateJournalRequestCategoryEnum | ''; // 선택 전 ''
  publisher: string;
  publishCountry: string;
  isbn: string;
  issn: string;
  eissn: string;
  jif: string;
  jcrRank: string;
  issue: string;
};

const CATEGORY_OPTIONS: Array<{
  value: CreateJournalRequestCategoryEnum;
  label: string;
}> = [
  { value: CreateJournalRequestCategoryEnum.Sci, label: 'SCI' },
  { value: CreateJournalRequestCategoryEnum.Scie, label: 'SCIE' },
  { value: CreateJournalRequestCategoryEnum.Scopus, label: 'SCOPUS' },
  { value: CreateJournalRequestCategoryEnum.Esci, label: 'ESCI' },
];

export default function JournalPage() {
  const [journals, setJournals] = useState<JournalSummaryResponse[]>([]);
  const [editingJournal, setEditingJournal] =
    useState<JournalSummaryResponse | null>(null);
  const [deleteJournal, setDeleteJournal] =
    useState<JournalSummaryResponse | null>(null);

  const [formData, setFormData] = useState<JournalForm>({
    journalName: '',
    category: '',
    publisher: '',
    publishCountry: '',
    isbn: '',
    issn: '',
    eissn: '',
    jif: '',
    jcrRank: '',
    issue: '',
  });

  const fetchJournals = async () => {
    try {
      const res = await api.getJournals({});
      setJournals(res.journals ?? []);
    } catch (e) {
      console.error('저널 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const resetForm = () => {
    setFormData({
      journalName: '',
      category: '',
      publisher: '',
      publishCountry: '',
      isbn: '',
      issn: '',
      eissn: '',
      jif: '',
      jcrRank: '',
      issue: '',
    });
  };

  const startEdit = (journal: JournalSummaryResponse) => {
    setEditingJournal(journal);
    setFormData({
      journalName: journal.journalName ?? '',
      category: (journal.category as CreateJournalRequestCategoryEnum) ?? '',
      publisher: journal.publisher ?? '',
      publishCountry: journal.publishCountry ?? '',
      isbn: journal.isbn ?? '',
      issn: journal.issn ?? '',
      eissn: journal.eissn ?? '',
      jif: journal.jif ?? '',
      jcrRank: journal.jcrRank ?? '',
      issue: journal.issue ?? '',
    });
  };

  const cancelForm = () => {
    setEditingJournal(null);
    resetForm();
  };

  const handleInputChange = (field: keyof JournalForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isAllRequiredValid =
    !!formData.journalName.trim() &&
    !!formData.category &&
    !!formData.publisher.trim() &&
    !!formData.publishCountry.trim() &&
    !!formData.isbn.trim() &&
    !!formData.issn.trim() &&
    !!formData.eissn.trim() &&
    !!formData.jif.trim() &&
    !!formData.jcrRank.trim() &&
    !!formData.issue.trim();

  const handleAddJournal = async () => {
    if (!isAllRequiredValid) return;

    try {
      await api.createJournal({
        createJournalRequest: {
          journalName: formData.journalName.trim(),
          category: formData.category as CreateJournalRequestCategoryEnum,
          publisher: formData.publisher.trim(),
          publishCountry: formData.publishCountry.trim(),
          isbn: formData.isbn.trim(),
          issn: formData.issn.trim(),
          eissn: formData.eissn.trim(),
          jif: formData.jif.trim(),
          jcrRank: formData.jcrRank.trim(),
          issue: formData.issue.trim(),
        },
      });

      toast.success('저널이 성공적으로 추가되었습니다.');
      resetForm();
      await fetchJournals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditJournal = async () => {
    if (!isAllRequiredValid) return;
    if (!editingJournal?.id) return;

    try {
      await api.updateJournal({
        journalId: Number(editingJournal.id),
        updateJournalRequest: {
          journalName: formData.journalName.trim(),
          category:
            formData.category as unknown as UpdateJournalRequestCategoryEnum,
          publisher: formData.publisher.trim(),
          publishCountry: formData.publishCountry.trim(),
          isbn: formData.isbn.trim(),
          issn: formData.issn.trim(),
          eissn: formData.eissn.trim(),
          jif: formData.jif.trim(),
          jcrRank: formData.jcrRank.trim(),
          issue: formData.issue.trim(),
        },
      });

      toast.success('저널 정보가 성공적으로 수정되었습니다.');
      setEditingJournal(null);
      resetForm();
      await fetchJournals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJournal = async () => {
    try {
      if (!deleteJournal?.id) return;

      await api.deleteJournal({
        journalId: Number(deleteJournal.id),
      });

      if (editingJournal?.id === deleteJournal.id) {
        setEditingJournal(null);
        resetForm();
      }

      setDeleteJournal(null);
      toast.success('저널이 성공적으로 삭제되었습니다.');
      await fetchJournals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">저널</h1>

      {/* 추가/수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {editingJournal ? (
              <>
                <Edit className="h-5 w-5" />
                정보 수정
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />새 저널 추가
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="journalName">
                저널명 <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="journalName"
                value={formData.journalName}
                onChange={(e) =>
                  handleInputChange('journalName', e.target.value)
                }
                placeholder="Nature / IEEE Transactions on ..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                저널 분류 <span className="text-destructive text-xs">*</span>
              </Label>

              <Select
                value={formData.category}
                onValueChange={(v) => handleInputChange('category', v)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">
                출판사 <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
                placeholder="Springer / Elsevier / IEEE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishCountry">
                출판 국가 <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="publishCountry"
                value={formData.publishCountry}
                onChange={(e) =>
                  handleInputChange('publishCountry', e.target.value)
                }
                placeholder="Korea / USA / UK"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">
                ISBN <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleInputChange('isbn', e.target.value)}
                placeholder="978-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issn">
                ISSN <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="issn"
                value={formData.issn}
                onChange={(e) => handleInputChange('issn', e.target.value)}
                placeholder="1234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eissn">
                eISSN <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="eissn"
                value={formData.eissn}
                onChange={(e) => handleInputChange('eissn', e.target.value)}
                placeholder="1234-567X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jif">
                JIF <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="jif"
                value={formData.jif}
                onChange={(e) => handleInputChange('jif', e.target.value)}
                placeholder="ex) 12.3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jcrRank">
                JCR Rank <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="jcrRank"
                value={formData.jcrRank}
                onChange={(e) => handleInputChange('jcrRank', e.target.value)}
                placeholder="ex) Q1 / 10/200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">
                Issue <span className="text-destructive text-xs">*</span>
              </Label>
              <Input
                id="issue"
                value={formData.issue}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                placeholder="ex) Vol.12 No.3"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={cancelForm}>
              취소
            </Button>
            <Button
              onClick={editingJournal ? handleEditJournal : handleAddJournal}
              disabled={!isAllRequiredValid}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingJournal ? '수정' : '추가'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              저널 목록
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              총 {journals.length}개
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {journals.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">등록된 저널이 없습니다.</p>
            </div>
          ) : (
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">저널명</TableHead>
                  <TableHead>분류</TableHead>
                  <TableHead>출판사</TableHead>
                  <TableHead>국가</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>ISSN</TableHead>
                  <TableHead>eISSN</TableHead>
                  <TableHead>JIF</TableHead>
                  <TableHead>JCR Rank</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="w-[100px] text-center">액션</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {journals.map((j) => (
                  <TableRow key={String(j.id ?? `${j.journalName}-${j.issn}`)}>
                    <TableCell>
                      <div className="pl-4 font-medium">{j.journalName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{j.category}</Badge>
                    </TableCell>
                    <TableCell>{j.publisher}</TableCell>
                    <TableCell>{j.publishCountry}</TableCell>
                    <TableCell>{j.isbn}</TableCell>
                    <TableCell>{j.issn}</TableCell>
                    <TableCell>{j.eissn}</TableCell>
                    <TableCell>{j.jif}</TableCell>
                    <TableCell>{j.jcrRank}</TableCell>
                    <TableCell>{j.issue}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(j)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteJournal(j)}
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteJournal}
        onOpenChange={() => setDeleteJournal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              저널 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <strong>{deleteJournal?.journalName}</strong> 저널을 정말
              삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJournal}
              className="bg-destructive hover:bg-destructive/90 text-white shadow-xs"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
