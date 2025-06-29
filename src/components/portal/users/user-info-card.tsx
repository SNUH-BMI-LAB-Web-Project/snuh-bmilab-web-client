'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserItem } from '@/generated-api';
import { Badge } from '@/components/ui/badge';

export default function UserInfoCard({ user }: { user: UserItem }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/portal/users/${user.userId}`);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      onClick={handleClick}
      className="text-foreground hover:bg-muted/50 flex w-full max-w-2xl cursor-pointer items-start gap-6 rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      {/* 좌측 프로필 이미지 */}
      <div className="relative aspect-square h-full shrink-0">
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

      {/* 우측 정보 영역 */}
      <div className="flex flex-1 flex-col gap-2">
        {/* 이름 + 자리번호 */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-black">{user.name}</h2>
          <Badge variant="outline" className="shrink-0">
            {user.seatNumber}
          </Badge>
        </div>

        {/* 이메일 */}
        <p className="text-muted-foreground text-sm break-all">{user.email}</p>

        {/* 소속/학과/소속기관 + 학력 */}
        <div className="text-muted-foreground flex flex-wrap gap-x-1 gap-y-0.5 text-xs">
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
        <p className="text-muted-foreground text-xs">{user.education}</p>

        {/* 연구 분야 (카테고리) */}
        {Array.isArray(user.categories) && (
          <div className="mt-1 flex flex-wrap gap-2">
            {user.categories.map((category) => (
              <Badge key={category.categoryId} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
