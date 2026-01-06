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
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { DatePicker } from '@/components/common/date-picker';

interface BookFormProps {
  initialData?: {
    authors?: string;
    authorType?: 'BOOK' | 'CONTRIBUTION';
    publicationDate?: string;
    publisher?: string;
    publicationHouse?: string;
    publicationName?: string;
    title?: string;
    isbn?: string;
  } | null;
  onSave: (data: {
    authors: string;
    authorType: 'BOOK' | 'CONTRIBUTION';
    publicationDate: string;
    publisher: string;
    publicationHouse: string;
    publicationName: string;
    title: string;
    isbn: string;
  }) => void;
  onCancel: () => void;
}

export function BookForm({ initialData, onSave, onCancel }: BookFormProps) {
  const [names, setNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    category: '저서' as '저서' | '기고',
    publicationDate: '',
    publisher: '',
    publicationHouse: '',
    publicationName: '',
    title: '',
    isbn: '',
  });

  useEffect(() => {
    if (!initialData) return;

    setNames(
      initialData.authors
        ? initialData.authors.split(',').map((v) => v.trim())
        : [],
    );

    setFormData({
      category: initialData.authorType === 'CONTRIBUTION' ? '기고' : '저서',
      publicationDate: initialData.publicationDate ?? '',
      publisher: initialData.publisher ?? '',
      publicationHouse: initialData.publicationHouse ?? '',
      publicationName: initialData.publicationName ?? '',
      title: initialData.title ?? '',
      isbn: initialData.isbn ?? '',
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      authors: names.join(', '),
      authorType: formData.category === '저서' ? 'BOOK' : 'CONTRIBUTION',
      publicationDate: formData.publicationDate,
      publisher: formData.publisher,
      publicationHouse: formData.publicationHouse,
      publicationName: formData.publicationName,
      title: formData.title,
      isbn: formData.isbn,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          이름 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={names}
          onChange={setNames}
          placeholder="이름을 입력하거나 검색하세요"
        />
      </div>

      <div className="space-y-2">
        <Label>
          구분 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value: '저서' | '기고') =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger className="w-1/2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="저서">저서</SelectItem>
            <SelectItem value="기고">기고</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          출판일 <span className="text-destructive">*</span>
        </Label>
        <DatePicker
          value={formData.publicationDate}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, publicationDate: date }))
          }
          placeholder="출판일 선택"
        />
      </div>

      <div className="space-y-2">
        <Label>
          발행처 <span className="text-destructive">*</span>
        </Label>
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
        <Label>
          출판사 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.publicationHouse}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              publicationHouse: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          출판물명 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.publicationName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              publicationName: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          ISBN <span className="text-destructive">*</span>
        </Label>
        <Input
          value={formData.isbn}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isbn: e.target.value,
            }))
          }
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
