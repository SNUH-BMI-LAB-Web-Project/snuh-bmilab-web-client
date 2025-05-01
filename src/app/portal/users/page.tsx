'use client';

import { users } from '@/data/users';
import UserInfoCard from '@/components/portal/users/user-info-card';

export default function UsersPage() {
  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">연명부</h1>

      {/* 유저 카드 리스트 */}
      <div className="grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {users.map((user) => (
          <UserInfoCard key={user.userId} user={user} />
        ))}
      </div>
    </div>
  );
}
