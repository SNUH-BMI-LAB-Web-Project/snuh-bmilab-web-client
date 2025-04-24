export type Role = 'USER' | 'ADMIN';

export interface User {
  userId: string;
  email: string;
  name: string;
  department: string;
  role: Role;
  createdAt: string;
  profileImageUrl?: string;
}
