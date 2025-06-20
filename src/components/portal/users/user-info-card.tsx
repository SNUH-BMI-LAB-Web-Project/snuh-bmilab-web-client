'use client';

import Image from 'next/image';
import { UserItem } from '@/generated-api';
import { Badge } from '@/components/ui/badge';
import { getCategoryLabel } from '@/utils/project-utils';

export default function UserInfoCard({ user }: { user: UserItem }) {
  return (
    <div className="text-foreground flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm transition">
      {/* 프로필 이미지 */}
      <div className="relative mb-6 aspect-square w-full">
        <Image
          src={
            user.profileImageUrl && user.profileImageUrl.trim() !== ''
              ? user.profileImageUrl
              : '/default-profile-image.svg'
          }
          alt={`${user.name} 프로필`}
          fill
          className="rounded-md object-cover"
        />
      </div>

      <div className="text-muted-foreground flex w-full flex-col">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">{user.name}</h2>
            <p className="text-xs">{user.email}</p>
          </div>
          <Badge variant="outline">{user.seatNumber}</Badge>
        </div>
        <div className="my-1.5 border-t" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-row gap-1 text-xs">
            <p>{user.organization}</p>
            <p>·</p>
            <p>{user.department}</p>
            {user.affiliation && (
              <>
                <p>·</p>
                <p>{user.affiliation}</p>
              </>
            )}
          </div>
          <p className="text-xs">{user.education}</p>
          {Array.isArray(user.categories) && (
            <div className="mt-1 flex flex-wrap gap-2">
              {user.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {getCategoryLabel(category)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
