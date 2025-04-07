import type { User } from '@/types/project';

export const currentUser: User = {
  userId: '1',
  email: 'kimcs@example.com',
  name: '김철수',
  department: '정보기술팀',
  role: 'USER',
  createdAt: '2023-01-15',
  profileImageUrl: '/profile.jpg',
};

// 사용자 ID로 책임자 여부 확인
export const isProjectLeader = (
  projectLeaders: string[],
  userId: string,
): boolean => {
  return projectLeaders.includes(userId);
};

// 수정 권한 확인
export const canEditProject = (
  projectLeaders: string[],
  userId: string,
): boolean => {
  return isProjectLeader(projectLeaders, userId);
};

// 삭제 권한 확인
export const canDeleteProject = (
  projectLeaders: string[],
  authorId: string,
  currentUserId: string,
  role: 'USER' | 'ADMIN',
): boolean => {
  return (
    projectLeaders.includes(currentUserId) ||
    authorId === currentUserId ||
    role === 'ADMIN'
  );
};
