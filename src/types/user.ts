export type Role = 'USER' | 'ADMIN';

export type User = {
  userId: string;
  email: string;
  name: string;
  department: string;
  role: Role;
  annualLeaveCount: number;
  usedLeaveCount: number;
  categories: string[];
  seatNumber: string;
  phoneNumber: string;
  comment: string;
  joinedAt: string;
  profileImageUrl?: string;
};
