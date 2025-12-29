'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserItem } from '@/generated-api';
import { Badge } from '@/components/ui/badge';
import { positionLabelMap } from '@/constants/position-enum';
import { formatSeatNumber } from '@/utils/user-utils';

const statusLabelMap: Record<string, string> = {
  ON_LEAVE: '휴직자',
  RESIGNED: '퇴직자',
};

export default function UserInfoCard({ user }: { user: UserItem }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/portal/users/members/${user.userId}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className="text-foreground hover:bg-muted/50 flex min-h-[180px] w-full max-w-3xl cursor-pointer items-start gap-6 rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      {/* 프로필 이미지 */}
      <div className="relative flex shrink-0 flex-col items-center gap-1">
        <div className="relative aspect-square h-16 w-16 shrink-0 rounded-full border-1 shadow-sm">
          <Image
            src={
              user.profileImageUrl?.trim()
                ? user.profileImageUrl
                : '/default-profile-image.svg'
            }
            alt={`${user.name} 프로필`}
            fill
            className="rounded-full object-cover"
          />
        </div>

        {/* 휴직 / 퇴직 상태 표시 */}
        {(user.status === 'ON_LEAVE' || user.status === 'RESIGNED') && (
          <span
            className={`text-xs font-medium ${
              user.status === 'ON_LEAVE' ? 'text-amber-600' : 'text-red-600'
            }`}
          >
            {statusLabelMap[user.status]}
          </span>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* 이름 + 소속 + 자리번호 */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex max-w-[75%] items-center gap-2 truncate text-lg font-semibold text-black">
            <span className="block truncate">{user.name}</span>
            {user.position && (
              <span className="text-muted-foreground text-sm font-normal">
                {positionLabelMap[user.position]}
              </span>
            )}
          </h2>
          {user.seatNumber && (
            <Badge
              variant="outline"
              className="max-w-[70px] shrink-0 truncate text-left"
            >
              <span className="block truncate">
                {formatSeatNumber(user.seatNumber)}
              </span>
            </Badge>
          )}
        </div>

        {/* 이메일 */}
        <p className="text-muted-foreground -mt-2 mb-2 max-w-full truncate text-sm break-all">
          {user.email}
        </p>

        {/* 기관 · 부서 */}
        {(user.organization || user.department) && (
          <div className="text-muted-foreground flex max-w-full flex-wrap gap-x-1 gap-y-0.5 text-xs">
            {user.organization && (
              <p className="max-w-[250px] truncate">{user.organization}</p>
            )}
            {user.organization && user.department && <p>·</p>}
            {user.department && (
              <p className="max-w-[200px] truncate">{user.department}</p>
            )}
          </div>
        )}

        {/* 학력 */}
        {user.education && (
          <p className="text-muted-foreground max-w-full truncate text-xs">
            {user.education}
          </p>
        )}

        {/* 연구 분야 */}
        {Array.isArray(user.categories) && user.categories.length > 0 && (
          <div className="mt-1 flex max-w-full flex-wrap items-center gap-2 text-xs">
            {user.categories.slice(0, 3).map((category) => (
              <Badge
                key={category.categoryId}
                variant="secondary"
                className="max-w-[140px] truncate text-left"
              >
                <span className="block truncate">{category.name}</span>
              </Badge>
            ))}
            {user.categories.length > 3 && (
              <span className="text-muted-foreground">
                외 {user.categories.length - 3}개
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
