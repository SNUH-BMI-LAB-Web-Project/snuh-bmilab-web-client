'use client';

import { useEffect, useState } from 'react';
import UserInfoCard from '@/components/portal/users/user-info-card';
import { UserItem, UserApi, UserFindAllResponse } from '@/generated-api';
import { Configuration } from '@/generated-api/runtime';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const itemsPerPageOptions = [5, 10, 20, 50];

  const fetchUsers = async (page: number, size: number) => {
    try {
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const api = new UserApi(
        new Configuration({
          accessToken: async () => token,
        }),
      );

      const res: UserFindAllResponse = await api.getAllUsers({
        pageNo: page - 1,
        size,
        criteria: 'createdAt',
      });

      setUsers(res.users ?? []);
      setTotalPages(res.totalPage ?? 1);
    } catch (error) {
      toast.error(
        '구성원 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      );
    }
  };

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    fetchUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, accessToken]);

  return (
    <div className="mb-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">구성원</h1>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {users.map((user) => (
          <UserInfoCard key={user.userId} user={user} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentPage} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
