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
  onProjectSelected?: (project: ProjectSummary | null) => void;
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
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ProjectSummary[]>([]);
  const [hi, setHi] = useState(-1);

  const accessToken = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => setInput(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    if (!open || !accessToken) return;

    (async () => {
      try {
        const res = await projectApi.getAllProjects({
          search: debounced.trim() || undefined,
          page: 0,
          size: 20,
        });
        setList(res.projects ?? []);
        setHi(-1);
      } catch {
        setList([]);
      }
    })();
  }, [debounced, open, accessToken]);

  useEffect(() => {
    if (hi >= 0) itemRefs.current[hi]?.scrollIntoView({ block: 'nearest' });
  }, [hi]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(t) &&
        popRef.current &&
        !popRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectProject = (p: ProjectSummary) => {
    const title = p.title ?? '';
    onValueChange(title);
    onProjectSelected?.(p);
    setInput(title);
    setOpen(false);
  };

  const clear = () => {
    onValueChange('');
    onProjectSelected?.(null);
    setInput('');
    setList([]);
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
          if (!open) setOpen(true);
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
            list.map((p, idx) => (
              <button
                key={p.projectId}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => selectProject(p)}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm ${
                  hi === idx ? 'bg-muted' : 'hover:bg-muted'
                }`}
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
