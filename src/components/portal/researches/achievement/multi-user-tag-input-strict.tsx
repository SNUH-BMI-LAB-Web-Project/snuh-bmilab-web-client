'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { UserApi } from '@/generated-api/apis/UserApi';
import { useAuthStore } from '@/store/auth-store';
import { getApiConfig } from '@/lib/config';
import { cn } from '@/lib/utils';

const userApi = new UserApi(getApiConfig());

interface UserTagInputStrictProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

// 기존 유저만 추가할 수 있는 컴포넌트
export function UserTagInputStrict({
  value,
  onChange,
  placeholder,
}: UserTagInputStrictProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================
   * 유저 검색 (드롭다운 열렸을 때만)
   * ========================= */
  useEffect(() => {
    if (!isDropdownOpen) return;

    const fetch = async () => {
      if (!accessToken) return;

      try {
        const res = await userApi.searchUsers({
          keyword: input.trim() || undefined,
        });

        setSearchResults(res.users ?? []);
        setHighlightedIndex(-1);
      } catch {
        setSearchResults([]);
      }
    };

    const t = setTimeout(fetch, 300);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(t);
  }, [input, accessToken, isDropdownOpen]);

  /* =========================
   * 추가 / 제거
   * ========================= */
  const reset = () => {
    setInput('');
    setSearchResults([]);
    setHighlightedIndex(-1);
    setIsDropdownOpen(false);
  };

  const addUser = (name: string) => {
    if (!name || value.includes(name)) {
      reset();
      return;
    }

    onChange([...value, name]);
    reset();
  };

  const removeUser = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  /* =========================
   * 키보드 처리
   * ========================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      // ❗ 검색 결과에서 선택된 경우만 추가
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        addUser(searchResults[highlightedIndex].name ?? '');
      }
    }
  };

  /* =========================
   * 외부 클릭 시 닫기
   * ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* =========================
   * 렌더
   * ========================= */
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            setInput(e.currentTarget.value);
          }}
        />

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow"
          >
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => addUser(user.name ?? '')}
                  className={cn(
                    'flex w-full flex-col px-3 py-2 text-left text-sm',
                    index === highlightedIndex && 'bg-muted',
                  )}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {user.department} · {user.email}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-muted-foreground px-3 py-2 text-sm">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        )}
      </div>

      {/* 선택된 유저 */}
      <div className="flex flex-wrap gap-2">
        {value.map((name, index) => (
          <Badge
            /* eslint-disable-next-line react/no-array-index-key */
            key={`${name}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
          >
            {name}
            <button
              type="button"
              onClick={() => removeUser(index)}
              className="rounded-full p-0.5 hover:bg-black/5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
