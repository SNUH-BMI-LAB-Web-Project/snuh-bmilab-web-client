'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { positionOptions } from '@/constants/position-enum';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'position';

interface EditableCellProps {
  value: string;
  fieldKey: string;
  userId: number;
  type?: FieldType;
  placeholder?: string;
  className?: string;
  onSave: (userId: number, fieldKey: string, value: string) => Promise<void>;
  children?: React.ReactNode;
  maxLength?: number;
}

export function EditableCell({
  value,
  fieldKey,
  userId,
  type = 'text',
  placeholder = '',
  className,
  onSave,
  children,
  maxLength,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setEditValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (type === 'text') {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        selectRef.current?.click();
      }
    }
  }, [isEditing, type]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(value ?? '');
  };

  const submit = async () => {
    const trimmed = typeof editValue === 'string' ? editValue.trim() : editValue;
    if (trimmed === (value ?? '')) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(userId, fieldKey, trimmed);
      setIsEditing(false);
    } catch {
      // 에러는 onSave 쪽에서 toast 처리
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    if (!saving) submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') {
      setEditValue(value ?? '');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        onDoubleClick={handleDoubleClick}
        className={cn(
          'min-h-[2rem] cursor-cell rounded px-1 py-0.5 transition-colors hover:bg-muted/60',
          className,
        )}
        title="더블클릭하여 수정"
      >
        {children ?? (value || '-')}
      </div>
    );
  }

  if (type === 'position') {
    const handlePositionChange = async (v: string) => {
      const newVal = v === 'none' ? '' : v;
      setEditValue(newVal);
      setSaving(true);
      try {
        await onSave(userId, fieldKey, newVal);
        setIsEditing(false);
      } finally {
        setSaving(false);
      }
    };
    return (
      <Select
        value={editValue || 'none'}
        onValueChange={handlePositionChange}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setIsEditing(false);
          }
        }}
      >
        <SelectTrigger
          ref={selectRef as React.RefObject<HTMLButtonElement>}
          className="h-8 w-full"
          onKeyDown={handleKeyDown}
        >
          <SelectValue placeholder="구분 선택" />
        </SelectTrigger>
        <SelectContent>
          {positionOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="h-8"
      maxLength={maxLength}
      disabled={saving}
    />
  );
}
