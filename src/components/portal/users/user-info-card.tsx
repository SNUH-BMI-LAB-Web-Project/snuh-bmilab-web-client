'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserItem } from '@/generated-api';
import { Badge } from '@/components/ui/badge';
import { affiliationLabelMap } from '@/constants/affiliation-enum';

export default function UserInfoCard({ user }: { user: UserItem }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/portal/users/${user.userId}`);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      onClick={handleClick}
      className="text-foreground hover:bg-muted/50 flex min-h-[180px] w-full max-w-2xl cursor-pointer items-start gap-6 rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      {/* 좌측 프로필 이미지 */}
      <div className="relative aspect-square h-16 w-16 shrink-0">
        <Image
          src={
            user.profileImageUrl && user.profileImageUrl.trim() !== ''
              ? user.profileImageUrl
              : '/default-profile-image.svg'
          }
          alt={`${user.name} 프로필`}
          fill
          className="rounded-full object-cover"
        />
      </div>

      {/* 우측 정보 영역 */}
      <div className="flex flex-1 flex-col gap-2">
        {/* 이름 + 자리번호 */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
            {user.name}
            {user.affiliation && (
              <span className="text-muted-foreground text-sm font-normal">
                {affiliationLabelMap[user.affiliation]}
              </span>
            )}
          </h2>
          <Badge variant="outline" className="shrink-0">
            {user.seatNumber}
          </Badge>
        </div>

        {/* 이메일 */}
        <p className="text-muted-foreground -mt-2 mb-2 text-sm break-all">
          {user.email}
        </p>

        {(user.organization || user.department) && (
          <div className="text-muted-foreground flex flex-wrap gap-x-1 gap-y-0.5 text-xs">
            {user.organization && <p>{user.organization}</p>}
            {user.organization && user.department && <p>·</p>}
            {user.department && <p>{user.department}</p>}
          </div>
        )}

        <p className="text-muted-foreground text-xs">{user.education}</p>

        {/* 연구 분야 (카테고리) */}
        {Array.isArray(user.categories) && user.categories.length > 0 && (
          <div className="mt-2flex flex-wrap gap-2 text-xs">
            {user.categories.slice(0, 3).map((category) => (
              <Badge key={category.categoryId} variant="secondary">
                {category.name}
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
