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
import type { Book } from '@/lib/types';
import { UserTagInputString } from '@/components/portal/researches/achievement/multi-user-tag-input';
import { DatePicker } from '@/components/common/date-picker';

interface BookFormProps {
  initialData?: Book;
  onSave: (data: Omit<Book, 'id'>) => void;
  onCancel: () => void;
}

export function BookForm({ initialData, onSave, onCancel }: BookFormProps) {
  const [names, setNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '저서',
    publishDate: initialData?.publishDate || '',
    publisher: initialData?.publisher || '',
    publishingHouse: initialData?.publishingHouse || '',
    publicationName: initialData?.publicationName || '',
    title: initialData?.title || '',
    isbn: initialData?.isbn || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Book, 'id'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          이름 <span className="text-destructive">*</span>
        </Label>
        <UserTagInputString
          value={names}
          onChange={setNames}
          placeholder="이름을 입력하거나 검색하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          구분 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value: '기고' | '저서') =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger className="w-1/2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="기고">기고</SelectItem>
            <SelectItem value="저서">저서</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          출판일 <span className="text-destructive">*</span>
        </Label>

        <DatePicker
          value={formData.publishDate}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, publishDate: date }))
          }
          placeholder="출판일 선택"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publisher">
          발행처 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="publisher"
          value={formData.publisher}
          onChange={(e) =>
            setFormData({ ...formData, publisher: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publishingHouse">
          출판사 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="publishingHouse"
          value={formData.publishingHouse}
          onChange={(e) =>
            setFormData({ ...formData, publishingHouse: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicationName">
          출판물명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="publicationName"
          value={formData.publicationName}
          onChange={(e) =>
            setFormData({ ...formData, publicationName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="isbn">
          ISBN <span className="text-destructive">*</span>
        </Label>
        <Input
          id="isbn"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
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
