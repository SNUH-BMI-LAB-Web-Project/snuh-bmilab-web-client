'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react';
import { UserApi } from '@/generated-api/apis/UserApi';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { getApiConfig } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

const userApi = new UserApi(getApiConfig());

interface SingleUserSelectInputProps {
  value: string; // 현재 인풋 값 (예: formData.practicalManager)
  onValueChange: (v: string) => void; // 인풋 값 갱신
  onUserSelected?: (user: UserSummary | null) => void; // 선택/해제 콜백(ID 필요시 사용)
  placeholder?: string;
  required?: boolean;
  disabledUserIds?: number[];
}

export default function SingleUserSelectInput({
  value,
  onValueChange,
  onUserSelected,
  placeholder = '이름/부서/이메일로 검색',
  required,
  disabledUserIds,
}: SingleUserSelectInputProps) {
  const [input, setInput] = useState(value);
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<UserSummary[]>([]);
  const [hi, setHi] = useState(-1);

  const accessToken = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 외부 value 반영
  useEffect(() => setInput(value), [value]);

  // 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  // 검색
  useEffect(() => {
    if (!open) return;
    (async () => {
      if (!accessToken) return;
      try {
        const res = await userApi.searchUsers({
          keyword: debounced.trim() || undefined,
        });
        setList(res.users || []);
        setHi(-1);
      } catch (e) {
        console.error('사용자 검색 실패:', e);
        setList([]);
      }
    })();
  }, [debounced, open, accessToken]);

  // 하이라이트 스크롤
  useEffect(() => {
    if (hi >= 0) itemRefs.current[hi]?.scrollIntoView({ block: 'nearest' });
  }, [hi]);

  // 외부 클릭 닫기
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

  const selectUser = (u: UserSummary) => {
    const name = u.name ?? '';
    onValueChange(name);
    onUserSelected?.(u);
    setInput(name);
    setOpen(false);
  };

  const clear = () => {
    onValueChange('');
    onUserSelected?.(null);
    setInput('');
    setList([]);
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((p) => (p < list.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((p) => (p > 0 ? p - 1 : list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hi >= 0) {
        const u = list[hi];
        const isDisabled = disabledUserIds?.includes(u.userId ?? -1);
        if (!isDisabled) selectUser(u);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          onValueChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          if (list.length === 0) setDebounced(input); // 첫 포커스 시 초기 검색
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className="pr-8"
      />

      {/* 지우기 버튼 */}
      {value && (
        <button
          type="button"
          onClick={clear}
          className="hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
          aria-label="지우기"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          ref={popRef}
          className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
        >
          {list.length > 0 ? (
            list.map((u, idx) => {
              const isHl = hi === idx;
              const isSelected = value && value === u.name;
              const isDisabled = disabledUserIds?.includes(u.userId ?? -1);

              let cls =
                'flex w-full flex-col items-start px-3 py-1.5 text-left text-sm transition ';

              if (isDisabled) {
                cls += 'opacity-50 cursor-not-allowed';
              } else if (isHl) {
                cls += 'bg-muted';
              } else if (isSelected) {
                cls += 'bg-muted/50';
              } else {
                cls += 'hover:bg-muted';
              }

              return (
                <button
                  key={u.userId}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  disabled={isDisabled}
                  className={cls}
                  onClick={() => {
                    if (isDisabled) return;
                    selectUser(u);
                  }}
                >
                  <div className="flex w-full flex-row items-center justify-between py-2">
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {u.department} · {u.email}
                      </span>
                    </div>
                    {isSelected && <Check className="text-primary h-4 w-4" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-muted-foreground px-4 py-3 text-sm">
              일치하는 사용자가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
