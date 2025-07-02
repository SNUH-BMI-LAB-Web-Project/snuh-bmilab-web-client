'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  AdminUserApi,
  Configuration,
  ProjectApi,
  UserDetail as UserDetailType,
  UserProjectItem,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import UserDetail from '@/components/portal/users/user-detail';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetailType>();
  const [userProjects, setUserProjects] = useState<UserProjectItem[]>([]);

  const adminUserApi = new AdminUserApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  const projectApi = new ProjectApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => useAuthStore.getState().accessToken || '',
    }),
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await adminUserApi.getUserById({
          userId: Number(userId),
        });
        setUser(userData);
      } catch (err) {
        toast.error('사용자 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await projectApi.getUserProjects({
          userId: Number(userId),
        });
        setUserProjects(res.projects ?? []);
      } catch (error) {
        console.error('유저 프로젝트 불러오기 실패:', error);
      }
    };

    if (userId) {
      fetchUser();
      fetchProjects();
    }
  }, [userId]);

  if (!user) return null;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/system/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              연명부로 돌아가기
            </Link>
          </Button>
        </div>
      </div>

      <UserDetail user={user} projects={userProjects} />
    </div>
  );
}
