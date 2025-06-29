'use client';

import { useEffect, useState } from 'react';
import UserInfoCard from '@/components/portal/users/user-info-card';
import { UserItem, UserApi, UserFindAllResponse } from '@/generated-api';
import { Configuration } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

const userApi = new UserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res: UserFindAllResponse = await userApi.getAllUsers({
          page: 0,
          criteria: 'createdAt',
        });
        setUsers(res.users ?? []);
      } catch (error) {
        toast.error('연명부 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">연명부</h1>

      <div className="grid w-full grid-cols-2 gap-6">
        {users.map((user) => (
          <UserInfoCard key={user.userId} user={user} />
        ))}
      </div>
    </div>
  );
}
