'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { ProjectSummary } from '@/generated-api/models/ProjectSummary';
import { getApiConfig } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

const projectApi = new ProjectApi(getApiConfig());

interface SingleProjectSelectInputProps {
  value: string;
  onValueChange: (v: string) => void;
  onProjectSelected?: (p: ProjectSummary | null) => void;
  placeholder?: string;
  required?: boolean;
}

export function SingleProjectSelectInput({
                                           value,
                                           onValueChange,
                                           onProjectSelected,
                                           placeholder = '프로젝트 검색',
                                           required,
                                         }: SingleProjectSelectInputProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ProjectSummary[]>([]);

  const accessToken = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  /* 외부 value 동기화 */
  useEffect(() => {
    setInput(value);
  }, [value]);

  /* 프로젝트 검색 */
  useEffect(() => {
    if (!open || !accessToken) return;

    (async () => {
      try {
        const res = await projectApi.getAllProjects({
          search: input.trim() || undefined,
          page: 0,
          size: 20,
        });
        setList(res.projects ?? []);
      } catch {
        setList([]);
      }
    })();
  }, [input, open, accessToken]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current?.contains(target) ||
        popRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectProject = (p: ProjectSummary) => {
    const title = p.title ?? '';
    setInput(title);
    onValueChange(title);
    onProjectSelected?.(p);
    setOpen(false); // 선택 후 닫기
  };

  const clear = () => {
    setInput('');
    onValueChange('');
    onProjectSelected?.(null);
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={input}
        required={required}
        placeholder={placeholder}
        className="pr-8"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          onValueChange(e.target.value);
          setOpen(true);
        }}
      />

      {value && (
        <button
          type="button"
          onClick={clear}
          className="hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          ref={popRef}
          className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow"
        >
          {list.length > 0 ? (
            list.map((p) => (
              <button
                key={p.projectId}
                type="button"
                onClick={() => selectProject(p)}
                className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-sm"
              >
                <span className="truncate">{p.title}</span>
                {value === p.title && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </button>
            ))
          ) : (
            <div className="text-muted-foreground px-3 py-2 text-sm">
              검색 결과 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}
