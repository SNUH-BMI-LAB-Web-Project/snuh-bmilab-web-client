'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
  const raw = localStorage.getItem('auth-storage');
  return raw ? JSON.parse(raw)?.state?.accessToken : null;
};

interface JournalFormProps {
  initialData?: {
    id: number;
    journalName: string;
    category: string;
    publisher: string;
    publishCountry: string;
    isbn?: string;
    issn?: string;
    eissn?: string;
    jif?: string;
    jcrRank?: string;
    issue?: string;
  };
  onCancel: () => void;
  onSaved?: () => void;
}

export function JournalForm({
                              initialData,
                              onCancel,
                              onSaved,
                            }: JournalFormProps) {
  const [formData, setFormData] = useState({
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

  /* ===============================
     GET 결과 → 수정 폼 주입
     =============================== */
  useEffect(() => {
    if (!initialData) return;

    setFormData({
      journalName: initialData.journalName ?? '',
      category: initialData.category ?? '',
      publisher: initialData.publisher ?? '',
      publishCountry: initialData.publishCountry ?? '',
      isbn: initialData.isbn ?? '',
      issn: initialData.issn ?? '',
      eissn: initialData.eissn ?? '',
      jif: initialData.jif ?? '',
      jcrRank: initialData.jcrRank ?? '',
      issue: initialData.issue ?? '',
    });
  }, [initialData]);

  /* ===============================
     POST / PUT 분기 처리
     =============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) return;

    const payload = {
      journalName: formData.journalName,
      category: formData.category,
      publisher: formData.publisher,
      publishCountry: formData.publishCountry,
      isbn: formData.isbn,
      issn: formData.issn,
      eissn: formData.eissn,
      jif: formData.jif,
      jcrRank: formData.jcrRank,
      issue: formData.issue,
    };

    const isEdit = Boolean(initialData?.id);

    const url = isEdit
      ? `${API_BASE}/research/journals/${initialData!.id}`
      : `${API_BASE}/research/journals`;

    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(
        `저널 ${isEdit ? '수정' : '생성'} 실패 (${res.status})`,
      );
    }

    onSaved?.();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>저널명 *</Label>
        <Input
          value={formData.journalName}
          onChange={(e) =>
            setFormData((p) => ({ ...p, journalName: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>구분 *</Label>
        <Select
          value={formData.category}
          onValueChange={(v) =>
            setFormData((p) => ({ ...p, category: v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="구분 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCI">SCI</SelectItem>
            <SelectItem value="SCIE">SCIE</SelectItem>
            <SelectItem value="SSCI">SSCI</SelectItem>
            <SelectItem value="SCOPUS">SCOPUS</SelectItem>
            <SelectItem value="KCI">KCI</SelectItem>
            <SelectItem value="ETC">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>출판사 *</Label>
        <Input
          value={formData.publisher}
          onChange={(e) =>
            setFormData((p) => ({ ...p, publisher: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>발행 국가 *</Label>
        <Input
          value={formData.publishCountry}
          onChange={(e) =>
            setFormData((p) => ({ ...p, publishCountry: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>ISBN</Label>
        <Input
          value={formData.isbn}
          onChange={(e) =>
            setFormData((p) => ({ ...p, isbn: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>ISSN</Label>
        <Input
          value={formData.issn}
          onChange={(e) =>
            setFormData((p) => ({ ...p, issn: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>E-ISSN</Label>
        <Input
          value={formData.eissn}
          onChange={(e) =>
            setFormData((p) => ({ ...p, eissn: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>JIF</Label>
        <Input
          value={formData.jif}
          onChange={(e) =>
            setFormData((p) => ({ ...p, jif: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>JCR Rank</Label>
        <Input
          value={formData.jcrRank}
          onChange={(e) =>
            setFormData((p) => ({ ...p, jcrRank: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Issue</Label>
        <Input
          value={formData.issue}
          onChange={(e) =>
            setFormData((p) => ({ ...p, issue: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">
          {initialData ? '수정' : '저장'}
        </Button>
      </div>
    </form>
  );
}
