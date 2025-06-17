'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration, ResponseError } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';

interface UserTagInputProps {
  selectedUsers: UserSummary[];
  onChange: (users: UserSummary[]) => void;
  placeholder: string;
}

export function UserTagInput({
  selectedUsers,
  onChange,
  placeholder,
}: UserTagInputProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInput(value);
    setIsDropdownOpen(true);
  };

  const addUser = (user: UserSummary) => {
    if (!selectedUsers.some((u) => u.userId === user.userId)) {
      onChange([...selectedUsers, user]);
    }

    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const removeUser = (userId: number) => {
    onChange(selectedUsers.filter((u) => u.userId !== userId));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const trimmed = input.trim().replace(/^@/, '');
      if (!accessToken || !trimmed) {
        setSearchResults([]);
        return;
      }

      try {
        const api = new UserApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => accessToken,
          }),
        );

        const result = await api.searchUsers({ keyword: trimmed });
        setSearchResults(result.users || []);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err instanceof ResponseError) {
          const text = await err.response.text();
          console.error('API 응답 오류:', err.response.status, text);
        } else {
          console.error('검색 실패:', err);
        }
        setSearchResults([]);
      }

      return;
    }

    // 드롭다운 탐색
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownItemRefs.current[highlightedIndex]) {
      dropdownItemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // TODO: 인풋 포커스 시 모든 유저 뜨고 캐시, 수민 수정 요청
  const openDropdown = () => {
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 선택된 사용자 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <Badge
            key={user.userId}
            variant="secondary"
            className="bg-border flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-xs"
          >
            {user.name ?? 'Unknown'}
            <button
              type="button"
              onClick={() => removeUser(user.userId!)}
              className="rounded-full p-0.5 transition hover:cursor-pointer hover:bg-black/5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">제거</span>
            </button>
          </Badge>
        ))}
      </div>

      {/* 입력창 */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={input}
          onFocus={openDropdown}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-white text-sm"
        />

        {/* 커스텀 드롭다운 */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
          >
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => {
                const isSelected = selectedUsers.some(
                  (u) => u.userId === user.userId,
                );
                const isHighlighted = index === highlightedIndex;

                let buttonClass =
                  'flex w-full flex-col items-start px-3 py-1.5 text-left text-sm transition ';

                if (isHighlighted) {
                  buttonClass += 'bg-muted';
                } else if (isSelected) {
                  buttonClass += 'bg-muted/50 cursor-not-allowed';
                } else {
                  buttonClass += 'hover:bg-muted';
                }

                return (
                  <button
                    key={user.userId}
                    ref={(el) => {
                      dropdownItemRefs.current[index] = el;
                    }}
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      if (!isSelected && user.userId !== undefined) {
                        addUser(user);
                      }
                    }}
                    className={buttonClass}
                  >
                    <div className="flex w-full flex-row items-center justify-between py-2">
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {user.department} · {user.email}
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
    </div>
  );
}
