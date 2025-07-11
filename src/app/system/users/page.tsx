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
  Mail,
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import UserDeleteModal from '@/components/system/users/user-delete-modal';
import UserAddModal from '@/components/system/users/user-add-modal';
import { affiliationLabelMap } from '@/constants/affiliation-enum';
import PasswordResetModal from '@/components/system/users/password-reset-modal';

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

const getUserColumns = (
  currentPage: number,
  itemsPerPage: number,
  router: ReturnType<typeof useRouter>,
  onDeleteClick: (id: number) => void,
  onEditClick: (userId: number) => void,
  onPasswordResetClick: (userId: number) => void,
) => [
  {
    label: '',
    className: 'text-center w-[60px]',
    cell: (row: UserItem) => (
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={row.profileImageUrl || '/default-profile-image.svg'}
          alt={row.name}
          className="object-cover"
        />
      </Avatar>
    ),
  },
  {
    label: '이름',
    className: 'text-left truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: UserItem) => (
      <Link href={`/system/users/${row.userId}`} className="hover:underline">
        <div className="font-medium">{row.name}</div>
        <div className="w-[220px] truncate overflow-hidden text-sm whitespace-nowrap text-gray-500">
          {row.email}
        </div>
      </Link>
    ),
  },
  {
    label: '기관',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[250px]',
    cell: (row: UserItem) => row.organization || '-',
  },
  {
    label: '부서',
    className:
      'text-center truncate overflow-hidden whitespace-nowrap w-[150px]',
    cell: (row: UserItem) => row.department || '-',
  },
  {
    label: '구분',
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
    cell: (row: UserItem) => {
      const categories = row.categories ?? [];
      if (categories.length === 0) return '-';

      const first = categories[0];
      const othersCount = categories.length - 1;

      return (
        <div className="flex max-w-[150px] items-center gap-1 text-sm">
          <Badge
            variant="secondary"
            className="max-w-[80px]"
            title={first.name}
          >
            <div className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {first.name}
            </div>
          </Badge>

          {othersCount > 0 && (
            <span className="text-xs text-gray-500">외 {othersCount}개</span>
          )}
        </div>
      );
    },
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
        <Badge
          variant="outline"
          title={row.seatNumber}
          className="mx-auto flex max-w-[100px] items-center justify-center border-gray-300 font-mono"
        >
          <div className="max-w-full truncate overflow-hidden whitespace-nowrap">
            {row.seatNumber}
          </div>
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
            <DropdownMenuItem asChild className="pr-4">
              <Link
                href={`/system/users/${row.userId}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                상세보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPasswordResetClick(row.userId!)}
              className="pr-4"
            >
              <Mail className="mr-2 h-4 w-4" /> 비밀번호 재발급
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditClick(row.userId!)}
              className="pr-4"
            >
              <Pencil className="mr-2 h-4 w-4" /> 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive pr-4"
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

  // 실시간 입력값
  const [searchTerm, setSearchTerm] = useState('');
  // api 전송을 위한 값
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');

  const [stringSortOption, setStringSortOption] = useState('all');
  const [sortOption, setSortOption] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // 리렌더를 위한 상태
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (committedSearchTerm.trim() === '') {
        const res = await userApi.getAllUsers({
          filterBy: stringSortOption,
          filterValue: committedSearchTerm,
          pageNo: currentPage - 1, // 0-based index
          size: itemsPerPage,
          criteria: sortOption,
        });
        setUsers(res.users ?? []);
        setTotalPage(res.totalPage ?? 1);
      } else {
        const res = await userApi.searchUsers({
          keyword: committedSearchTerm,
        });
        setUsers(res.users ?? []);
        setTotalPage(1); // 검색 결과는 페이지네이션 없음 또는 단일 페이지
      }
    } catch (error) {
      toast.error(
        '사용자 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    itemsPerPage,
    sortOption,
    committedSearchTerm,
    shouldRefetch,
  ]);

  // 유저 정보 수정시, 상세 정보 불러오기
  const fetchUserDetail = async (userId: number) => {
    try {
      const res = await adminApi.getUserById({ userId });
      return res;
    } catch (e) {
      toast.error(
        '상세 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      );
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
  const handleUserAdd = () => {
    setShouldRefetch((prev) => !prev); // 트리거로 리렌더 유도
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
    if (targetUserId === null) return;

    try {
      await adminApi.deleteUserById({ userId: targetUserId });
      setUsers((prev) => prev.filter((user) => user.userId !== targetUserId));
      toast.success('사용자가 삭제되었습니다.');
    } catch (error) {
      toast.error('사용자 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setShowDeleteDialog(false);
      setTargetUserId(null);
    }
  };

  const handleOpenPasswordResetDialog = async (userId: number) => {
    const detail = await fetchUserDetail(userId);
    if (detail) {
      setSelectedUser(detail);
      setTargetUserId(userId);
      setShowPasswordResetDialog(true);
    }
  };

  const handlePasswordReset = async () => {
    if (selectedUser === null) return;

    try {
      await userApi.sendFindPasswordEmail({
        findPasswordEmailRequest: { email: selectedUser.email },
      });
      toast.success('비밀번호가 재발급 되었습니다.');
    } catch (error) {
      toast.error(
        '비밀번호 재발급 중 오류가 발생했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setShowPasswordResetDialog(false);
      setTargetUserId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCommittedSearchTerm('');
    setSortOption('asc');
    setStringSortOption('all');
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">구성원</h1>
        <div className="flex gap-2">
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            사용자 추가
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-row gap-2">
          {/* 검색 필터 선택 */}
          <Select value={stringSortOption} onValueChange={setStringSortOption}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="name">이름</SelectItem>
              <SelectItem value="email">이메일</SelectItem>
              <SelectItem value="organization">기관</SelectItem>
              <SelectItem value="department">부서</SelectItem>
              <SelectItem value="affiliation">구분</SelectItem>
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
              <SelectItem value="asc">이름 오름차순</SelectItem>
              <SelectItem value="desc">이름 내림차순</SelectItem>
            </SelectContent>
          </Select>

          {/* 필터링 초기화 버튼 */}
          {committedSearchTerm && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              초기화
            </Button>
          )}
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
              setTargetUserId(id);
              setShowDeleteDialog(true);
            },
            handleUserEdit,
            handleOpenPasswordResetDialog,
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

        <PasswordResetModal
          open={showPasswordResetDialog}
          onOpenChange={setShowPasswordResetDialog}
          onConfirm={handlePasswordReset}
        />
      </div>
    </div>
  );
}
