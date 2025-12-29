'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { TaskApi, TaskSummaryResponse } from '@/generated-api';
import { getApiConfig } from '@/lib/config';

const taskApi = new TaskApi(getApiConfig());

interface SingleTaskSelectInputProps {
  value: string;
  onValueChange: (v: string) => void;
  onTaskSelected?: (task: TaskSummaryResponse | null) => void;
  onTaskIdChange?: (id: number | null) => void; // 추가
  placeholder?: string;
}

export function SingleTaskSelectInput({
                                        value,
                                        onValueChange,
                                        onTaskSelected,
                                        onTaskIdChange,
                                        placeholder = '과제 검색',
                                      }: SingleTaskSelectInputProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<TaskSummaryResponse[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => setInput(value), [value]);

  // 검색 로직: 원본 그대로
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await taskApi.getAllTasks({
          keyword: input.trim() || undefined,
          page: 0,
          size: 20,
        });
        setList(res.content ?? []);
      } catch {
        setList([]);
      }
    })();
  }, [input, open]);

  const selectTask = (t: TaskSummaryResponse) => {
    const title = t.title ?? '';
    onValueChange(title);
    onTaskSelected?.(t);
    onTaskIdChange?.(t.id ?? null); // ID 전달
    setInput(title);
    setOpen(false);
  };

  const clear = () => {
    onValueChange('');
    onTaskSelected?.(null);
    onTaskIdChange?.(null); // ID 초기화
    setInput('');
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={input}
        placeholder={placeholder}
        className="pr-8"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          onValueChange(e.target.value);
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
            list.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTask(t)}
                className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
              >
                {t.title}
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
