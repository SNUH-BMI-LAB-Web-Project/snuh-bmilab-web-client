'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus } from 'lucide-react';
import SingleUserSelectInput from '@/components/portal/researches/assignment/single-user-select-input';
import type { UserSummary } from '@/generated-api';
import { Input } from '@/components/ui/input';

export type LabMemberRole = 'FIRST' | 'CO_FIRST' | 'CO_AUTHOR';

export interface LabMember {
  userId: number;
  name: string;
  role: LabMemberRole;
}

interface LabMemberSelectProps {
  value: LabMember[];
  onChange: (value: LabMember[]) => void;
}

export function LabMemberSelect({ value, onChange }: LabMemberSelectProps) {
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const handleUserSelected = (user: UserSummary | null) => {
    if (!user?.userId) return;

    // 이미 추가된 유저면 무시
    if (value.some((m) => m.userId === user.userId)) {
      setSelectedUser(null);
      return;
    }

    onChange([
      ...value,
      {
        userId: user.userId,
        name: user.name ?? '',
        role: 'CO_AUTHOR', // 기본값
      },
    ]);

    // 입력 초기화
    setSelectedUser(null);
  };

  const updateRole = (userId: number, role: LabMemberRole) => {
    onChange(value.map((m) => (m.userId === userId ? { ...m, role } : m)));
  };

  const removeMember = (userId: number) => {
    onChange(value.filter((m) => m.userId !== userId));
  };

  return (
    <div className="space-y-3">
      {/* 유저 검색 + 자동 추가 */}
      <SingleUserSelectInput
        value={selectedUser?.name ?? ''}
        onValueChange={() => {}}
        onUserSelected={(u) => {
          setSelectedUser(u);
          handleUserSelected(u);
        }}
        placeholder="연구실 인원 검색"
        disabledUserIds={value.map((m) => m.userId)}
      />

      {/* 선택된 인원 목록 */}
      {value.length > 0 && (
        <div className="bg-muted/50 mt-2 space-y-3 rounded-xl p-4">
          {value.map((member) => (
            <div key={member.userId} className="flex items-center gap-2">
              <Input disabled value={member.name} className="bg-white" />

              <Select
                value={member.role}
                onValueChange={(v: LabMemberRole) =>
                  updateRole(member.userId, v)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">제1저자</SelectItem>
                  <SelectItem value="CO_FIRST">공동1저자</SelectItem>
                  <SelectItem value="CO_AUTHOR">공동저자</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeMember(member.userId)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
