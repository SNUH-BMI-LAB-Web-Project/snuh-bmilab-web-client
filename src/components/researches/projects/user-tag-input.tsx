'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { UserSummary } from '@/generated-api/models/UserSummary';
import { UserApi } from '@/generated-api/apis/UserApi';
import { Configuration } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';

interface UserTagInputProps {
  selectedUsers: number[];
  onChange: (users: number[]) => void;
  placeholder: string;
}

export function UserTagInput({
  selectedUsers,
  onChange,
  placeholder,
}: UserTagInputProps) {
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // TODO: 에러 토스트 처리
  useEffect(() => {
    async function fetchUsers() {
      if (!accessToken) return;
      try {
        const api = new UserApi(
          new Configuration({
            basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
            accessToken: async () => accessToken,
          }),
        );
        const response = await api.getAllUsers({ page: 0 });
        setUsers(response.users || []);
      } catch (error) {
        console.error('사용자 목록 불러오기 실패:', error);
      }
    }
    fetchUsers();
  }, [accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInput(value);
    setIsDropdownOpen(true);

    const trimmed = value.trim();

    if (trimmed === '@') {
      setSearchResults(users);
      setHighlightedIndex(-1);
      return;
    }

    const query = trimmed.replace(/^@/, '');

    if (query === '') {
      setSearchResults(users);
      setHighlightedIndex(-1);
      return;
    }

    const filtered = users.filter((user) =>
      `${user.name ?? ''}${user.department ?? ''}${user.email ?? ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    setSearchResults(filtered);
    setHighlightedIndex(-1);
  };

  const addUser = (userId: number) => {
    if (!selectedUsers.includes(userId)) {
      onChange([...selectedUsers, userId]);
    }
    setInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const removeUser = (userId: number) => {
    onChange(selectedUsers.filter((id) => id !== userId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedUser = searchResults[highlightedIndex];
      if (selectedUser && selectedUser.userId !== undefined) {
        addUser(selectedUser.userId);
      }
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

  const openDropdown = () => {
    setSearchResults(users);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 선택된 사용자 뱃지 */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((userId) => {
          const user = users.find((u) => u.userId === userId);
          return (
            <Badge
              key={userId}
              variant="secondary"
              className="bg-border flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-xs"
            >
              {user?.name ?? 'Unknown'}
              <button
                type="button"
                onClick={() => removeUser(userId)}
                className="rounded-full p-0.5 transition hover:cursor-pointer hover:bg-black/5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">제거</span>
              </button>
            </Badge>
          );
        })}
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
                const isSelected = selectedUsers.includes(user.userId ?? -1);
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
                        addUser(user.userId);
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
