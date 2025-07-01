'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedTable } from '@/components/common/paginated-table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Phone,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AdminUserApi,
  Configuration,
  UserApi,
  UserDetail,
  UserItem,
} from '@/generated-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import UserEditModal from '@/components/system/users/user-edit-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserDeleteModal from '@/components/system/users/user-delete-modal';
import UserAddModal from '@/components/system/users/user-add-modal';
import { affiliationLabelMap } from '@/constants/affiliation-enum';

const userApi = new UserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

const adminApi = new AdminUserApi(
  new Configuration({
    accessToken: async () => useAuthStore.getState().accessToken ?? '',
  }),
);

const formatSortOption = (option: string) => {
  const [field, direction] = option.split('-');
  return `${field},${direction}`;
};

const getUserColumns = (
  currentPage: number,
  itemsPerPage: number,
  router: ReturnType<typeof useRouter>,
  onDeleteClick: (id: number) => void,
  onEditClick: (userId: number) => void,
) => [
  {
    label: '',
    className: 'text-center w-[60px]',
    cell: (row: UserItem) => (
      <Avatar className="h-10 w-10">
        <AvatarImage src={row.profileImageUrl} alt={row.name} />
        <AvatarFallback className="bg-blue-100 font-medium text-blue-700">
          {row.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    label: '이름',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: UserItem) => (
      <Link href={`/system/users/${row.userId}`} className="hover:underline">
        <div className="font-medium">{row.name}</div>
        <div className="w-[250px] truncate overflow-hidden text-sm whitespace-nowrap text-gray-500">
          {row.email}
        </div>
      </Link>
    ),
  },
  {
    label: '기관',
    className: 'truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: UserItem) => row.organization || '-',
  },
  {
    label: '부서',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) => row.department || '-',
  },
  {
    label: '소속',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) =>
      row.affiliation
        ? (affiliationLabelMap[row.affiliation] ?? row.affiliation)
        : '-',
  },
  {
    label: '연구 분야',
    className: 'text-center w-[150px]',
    cell: (row: UserItem) =>
      row.categories && row.categories.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {row.categories.map((category) => (
            <Badge key={category.categoryId} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
      ) : (
        '-'
      ),
  },
  {
    label: '연락처',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) =>
      row.phoneNumber?.trim() ? (
        <div className="flex items-center justify-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          <span>{row.phoneNumber}</span>
        </div>
      ) : (
        '-'
      ),
  },
  {
    label: '좌석',
    className: 'text-center w-[130px]',
    cell: (row: UserItem) =>
      row.seatNumber?.trim() ? (
        <Badge variant="outline" className="border-gray-300 font-mono">
          {row.seatNumber}
        </Badge>
      ) : (
        '-'
      ),
  },
  {
    label: ' ',
    className: 'text-center w-[50px]',
    cell: (row: UserItem) => (
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/system/users/${row.userId}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                상세보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditClick(row.userId!)}>
              <Pencil className="mr-2 h-4 w-4" /> 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                onDeleteClick(row.userId!);
              }}
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export default function SystemProjectPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');

  const [stringSortOption, setStringSortOption] = useState('name');
  const [sortOption, setSortOption] = useState('name-asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userApi.getAllUsers({
          page: currentPage - 1, // 0-based index
          size: itemsPerPage,
          criteria: formatSortOption(sortOption),
        });
        setUsers(res.users ?? []);
        setTotalPage(res.totalPage ?? 1);
      } catch (error) {
        toast.error('연명부 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, itemsPerPage, sortOption]);

  // 유저 정보 수정시, 상세 정보 불러오기
  const fetchUserDetail = async (userId: number) => {
    try {
      const res = await adminApi.getUserById({ userId });
      return res;
    } catch (e) {
      toast.error('상세 정보를 불러오지 못했습니다.');
      return null;
    }
  };

  const handleUserEdit = async (userId: number) => {
    const detail = await fetchUserDetail(userId);
    if (detail) {
      setSelectedUser(detail);
      setEditModalOpen(true);
    }
  };

  // 유저 생성시, 유저 리스트에 추가
  const handleUserAdd = (newUser: UserItem) => {
    setUsers((prev) => [newUser, ...prev]);
    toast.success('사용자가 추가되었습니다');
  };

  // 유저 정보 수정시, 정보 업데이트
  const handleUserUpdate = (updatedUser: UserItem) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.userId === updatedUser.userId ? updatedUser : user,
      ),
    );
  };

  const handleDelete = async () => {
    if (userIdToDelete === null) return;

    try {
      await adminApi.deleteUserById({ userId: userIdToDelete });
      setUsers((prev) => prev.filter((user) => user.userId !== userIdToDelete));
      toast.success('사용자가 삭제되었습니다.');
    } catch (error) {
      toast.error('사용자 삭제에 실패했습니다.');
    } finally {
      setShowDeleteDialog(false);
      setUserIdToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setSortOption('name-asc');
    setStringSortOption('name');
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">연명부</h1>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          사용자 추가
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-row gap-2">
          {/* 검색 필터 선택 */}
          <Select value={stringSortOption} onValueChange={setStringSortOption}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">이름</SelectItem>
              <SelectItem value="email">이메일</SelectItem>
              <SelectItem value="organization">기관</SelectItem>
              <SelectItem value="department">부서</SelectItem>
              <SelectItem value="affiliation">소속</SelectItem>
              <SelectItem value="categories">연구 분야</SelectItem>
              <SelectItem value="phoneNumber">연락처</SelectItem>
              <SelectItem value="seatNumber">좌석</SelectItem>
            </SelectContent>
          </Select>

          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCommittedSearchTerm(searchTerm);
                  setCurrentPage(1);
                }
              }}
              className="pl-8"
            />
          </div>

          {/* 이름으로 정렬 */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">이름 오름차순</SelectItem>
              <SelectItem value="name-desc">이름 내림차순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 페이지네이션 테이블 */}
        <PaginatedTable
          data={users}
          rowKey={(row) => String(row.userId)}
          columns={getUserColumns(
            currentPage,
            itemsPerPage,
            router,
            (id) => {
              setUserIdToDelete(id);
              setShowDeleteDialog(true);
            },
            handleUserEdit,
          )}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPage={totalPage}
          loading={loading}
        />

        <UserAddModal
          open={addModalOpen}
          setOpen={setAddModalOpen}
          onUserAdd={handleUserAdd}
        />

        <UserEditModal
          user={selectedUser}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUserUpdate={handleUserUpdate}
        />

        <UserDeleteModal
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
