'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
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

import {
  Plus,
  Edit,
  Trash2,
  Save,
  BookOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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
  year: string; // 연도 (필수, 년도별 분류)
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

type SortKey = 'year' | 'journalName';

function JournalSortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: SortKey;
  sortBy: SortKey | null;
  sortOrder: 'asc' | 'desc';
}) {
  if (sortBy !== column)
    return <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />;
  return sortOrder === 'asc' ? (
    <ArrowUp className="ml-1 inline h-4 w-4" />
  ) : (
    <ArrowDown className="ml-1 inline h-4 w-4" />
  );
}

export default function JournalPage() {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'ADMIN';

  const [journals, setJournals] = useState<JournalSummaryResponse[]>([]);
  const [editingJournal, setEditingJournal] =
    useState<JournalSummaryResponse | null>(null);
  const [deleteJournal, setDeleteJournal] =
    useState<JournalSummaryResponse | null>(null);

  const [formData, setFormData] = useState<JournalForm>({
    journalName: '',
    year: '',
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

  const [sortBy, setSortBy] = useState<SortKey | null>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedJournals = useMemo(() => {
    if (!sortBy) return [...journals];
    return [...journals].sort((a, b) => {
      const aVal = sortBy === 'year' ? (a.year ?? 0) : (a.journalName ?? '');
      const bVal = sortBy === 'year' ? (b.year ?? 0) : (b.journalName ?? '');
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [journals, sortBy, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder(key === 'year' ? 'desc' : 'asc');
    }
  };

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
      year: '',
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
      year: journal.year != null ? String(journal.year) : '',
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

  const yearNum = formData.year.trim()
    ? parseInt(formData.year.trim(), 10)
    : NaN;
  const isYearValid =
    !Number.isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2100;

  const isAllRequiredValid =
    !!formData.journalName.trim() &&
    isYearValid &&
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
          year: yearNum,
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
    } catch (e: unknown) {
      const status =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response: Response }).response?.status
          : undefined;
      if (status === 403) toast.error('등록 권한이 없습니다.');
      else console.error(e);
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
          year: yearNum,
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
    } catch (e: unknown) {
      const status =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response: Response }).response?.status
          : undefined;
      if (status === 403) toast.error('수정 권한이 없습니다.');
      else console.error(e);
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
    } catch (e: unknown) {
      const status =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response: Response }).response?.status
          : undefined;
      if (status === 403) toast.error('삭제 권한이 없습니다.');
      else if (status === 500 || status === 400) {
        toast.error(
          '삭제에 실패했습니다. 이 저널에 연결된 논문이 있으면 삭제할 수 없습니다. 논문에서 저널 연결을 해제한 뒤 다시 시도해 주세요.',
        );
      } else {
        console.error(e);
      }
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">저널</h1>

      {/* 추가/수정 폼 - 어드민만 */}
      {isAdmin && (
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
                <Label htmlFor="year">
                  연도 <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  min={1900}
                  max={2100}
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="예: 2025"
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
                  onChange={(e) =>
                    handleInputChange('publisher', e.target.value)
                  }
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
      )}

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
                  <TableHead className="pl-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-8 font-semibold"
                      onClick={() => toggleSort('journalName')}
                    >
                      저널명
                      <JournalSortIcon
                        column="journalName"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-8 font-semibold"
                      onClick={() => toggleSort('year')}
                    >
                      연도 (시간순)
                      <JournalSortIcon
                        column="year"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </Button>
                  </TableHead>
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
                {sortedJournals.map((j) => (
                  <TableRow
                    key={String(j.id ?? `${j.journalName}-${j.year}-${j.issn}`)}
                  >
                    <TableCell>
                      <div className="pl-4 font-medium">{j.journalName}</div>
                    </TableCell>
                    <TableCell>{j.year ?? '-'}</TableCell>
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
                      {isAdmin && (
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
                      )}
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
