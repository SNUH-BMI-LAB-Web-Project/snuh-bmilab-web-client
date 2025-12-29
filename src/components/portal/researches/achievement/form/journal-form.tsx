'use client';

import type React from 'react';
import { useState } from 'react';

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

export function JournalForm({ onCancel }: { onCancel: () => void }) {
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.journalName ||
      !formData.category ||
      !formData.publisher ||
      !formData.publishCountry
    ) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('[JournalForm] token 없음');
      return;
    }

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
    };

    console.log('[JournalForm] request payload', payload);

    const response = await fetch(
      `${API_BASE}/research/journals`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    console.log('[JournalForm] response status', response.status);
    console.log('[JournalForm] response body', result);

    if (!response.ok) {
      throw new Error(
        `저널 생성 실패 (${response.status})`,
      );
    }

    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>저널명 *</Label>
        <Input
          value={formData.journalName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              journalName: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>구분 *</Label>
        <Select
          value={formData.category}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, category: v }))
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
            setFormData((prev) => ({
              ...prev,
              publisher: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>발행 국가 *</Label>
        <Input
          value={formData.publishCountry}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              publishCountry: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>ISBN</Label>
        <Input
          value={formData.isbn}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isbn: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>ISSN</Label>
        <Input
          value={formData.issn}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              issn: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>E-ISSN</Label>
        <Input
          value={formData.eissn}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              eissn: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>JIF</Label>
        <Input
          value={formData.jif}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              jif: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>JCR Rank</Label>
        <Input
          value={formData.jcrRank}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              jcrRank: e.target.value,
            }))
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
