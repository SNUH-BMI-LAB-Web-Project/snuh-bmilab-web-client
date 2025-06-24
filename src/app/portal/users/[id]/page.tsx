'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import UserDetail from '@/components/portal/users/user-detail';

const mockUserDetail = {
  userId: '1',
  name: '홍길동',
  email: 'hong@example.com',
  phoneNumber: '010-1234-5678',
  role: 'USER',
  profileImageUrl: '/placeholder.svg?height=120&width=120',
  organization: '서울대학교',
  department: '컴퓨터공학과',
  affiliation: 'AI연구실',
  education: [
    '서울대학교 컴퓨터공학과 학사',
    '서울대학교 컴퓨터공학과 석사',
    '서울대학교 컴퓨터공학과 박사',
  ],
  seatNumber: 'A-101',
  categories: ['NLP', 'Bioinformatics'],
  annualLeaveCount: 15,
  usedLeaveCount: 3.5,
  comment: '딥러닝과 커피를 사랑하는 개발자',
  joinedAt: '2023-03-01',
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState(mockUserDetail);

  // TODO: 실제 구현에서는 userId로 API에서 사용자 정보 가져오기
  useEffect(() => {
    console.log('사용자 정보 로딩:', userId);
  }, [userId]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              연명부로 돌아가기
            </Link>
          </Button>
        </div>
      </div>

      <UserDetail user={user} />
    </div>
  );
}
