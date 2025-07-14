'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  AdminUserApi,
  ProjectApi,
  UserDetail as UserDetailType,
  UserProjectItem,
} from '@/generated-api';
import AdminUserDetail from '@/components/system/users/user-detail';
import UserEditModal from '@/components/system/users/user-edit-modal';
import { getApiConfig } from '@/lib/config';

const adminUserApi = new AdminUserApi(getApiConfig());

const projectApi = new ProjectApi(getApiConfig());

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetailType>();
  const [userProjects, setUserProjects] = useState<UserProjectItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await adminUserApi.getUserById({
          userId: Number(userId),
        });
        setUser(userData);
      } catch (err) {
        console.log(err);
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
              목록으로
            </Link>
          </Button>
        </div>

        {/* 정보 수정 버튼 */}
        <Button
          onClick={() => {
            setUser(user);
            setEditModalOpen(true);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          정보 수정
        </Button>
      </div>

      <AdminUserDetail user={user} projects={userProjects} />

      <UserEditModal
        user={user}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser); // 상세 정보 갱신
        }}
      />
    </div>
  );
}
