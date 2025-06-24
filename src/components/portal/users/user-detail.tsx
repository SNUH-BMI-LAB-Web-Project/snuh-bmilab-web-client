'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { UserDetail as UserDetailType } from '@/generated-api';

interface UserDetailProps {
  user: UserDetailType;
}

export default function UserDetail({ user }: UserDetailProps) {
  if (!user) return null;

  // 상태 매핑
  const getStatusInfo = (status: string) => {
    const statusMap = {
      ENROLLED: { label: '재학중', color: 'bg-blue-100 text-blue-800' },
      GRADUATED: { label: '졸업', color: 'bg-green-100 text-green-800' },
      DROPPED_OUT: { label: '중퇴', color: 'bg-gray-100 text-gray-800' },
      SUSPENDED: { label: '휴학', color: 'bg-yellow-100 text-yellow-800' },
      TRANSFERRED: { label: '편입', color: 'bg-purple-100 text-purple-800' },
    };
    return (
      statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    );
  };

  // 기간 포맷팅
  const formatPeriod = (
    startYearMonth: { year: number; monthValue: number } | undefined,
    endYearMonth: { year: number; monthValue: number } | undefined,
    status: string,
  ) => {
    if (!startYearMonth || !startYearMonth.year || !startYearMonth.monthValue) {
      return '기간 정보 없음';
    }

    const startYear = startYearMonth.year;
    const startMonth = startYearMonth.monthValue;
    let period = `${startYear}.${startMonth.toString().padStart(2, '0')}`;

    if (status === 'ENROLLED') {
      period += ' - 현재';
    } else if (endYearMonth?.year && endYearMonth?.monthValue) {
      const endYear = endYearMonth.year;
      const endMonth = endYearMonth.monthValue;
      period += ` - ${endYear}.${endMonth.toString().padStart(2, '0')}`;
    }

    return period;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl">
        {/* 메인 레이아웃 */}
        <div className="grid grid-cols-12 gap-8">
          {/* 왼쪽 - 프로필 카드 */}
          <div className="col-span-5">
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex h-full flex-col">
                  {/* 프로필 헤더 */}
                  <div className="mb-8 text-center">
                    <Avatar className="mx-auto mb-6 h-32 w-32 border-2 border-gray-200">
                      <AvatarImage
                        src={user.profileImageUrl || '/placeholder.svg'}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gray-100 text-3xl font-medium">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <h1 className="mb-4 text-4xl font-semibold tracking-tight">
                      {user.name}
                    </h1>

                    <div className="space-y-2">
                      <Badge className="bg-gray-100 px-4 py-1 text-base font-medium text-gray-800">
                        {user.organization}
                      </Badge>
                      <p className="text-lg text-gray-600">{user.department}</p>
                      <p className="text-base text-gray-500">
                        {user.affiliation}
                      </p>
                    </div>
                  </div>

                  {/* 연구분야 */}
                  <div className="mb-8 flex-1">
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-semibold tracking-wide uppercase">
                          연구분야
                        </h3>
                      </div>
                      <div className="space-x-2 leading-relaxed">
                        {user.categories?.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 - 상세 정보 */}
          <div className="col-span-7 space-y-8">
            {/* 연락처 정보 */}
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    연락처 정보
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      이메일
                    </p>
                    <p className="font-medium break-all text-gray-900">
                      {user.email}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      전화번호
                    </p>
                    <p className="font-medium text-gray-900">
                      {user.phoneNumber}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      좌석번호
                    </p>
                    <Badge
                      variant="outline"
                      className="border-gray-300 px-3 py-1 font-mono text-lg"
                    >
                      {user.seatNumber}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 소속 정보 */}
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <Building className="h-4 w-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    소속 정보
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      기관
                    </p>
                    <p className="font-semibold text-gray-900">
                      {user.organization}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      부서
                    </p>
                    <p className="font-semibold text-gray-900">
                      {user.department}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      소속
                    </p>
                    <p className="font-semibold text-gray-900">
                      {user.affiliation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 학력 정보 */}
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <GraduationCap className="h-4 w-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    학력 사항
                  </h2>
                </div>

                <div className="space-y-6">
                  {user.educations?.map((education, index) => {
                    const statusInfo = getStatusInfo(education.status || '');
                    const period = formatPeriod(
                      education.startYearMonth,
                      education.endYearMonth,
                      education.status || '',
                    );

                    return (
                      <div key={education.educationId} className="relative">
                        <div className="flex items-start gap-6">
                          <div className="flex flex-col items-center pt-2">
                            <div className="h-3 w-3 rounded-full border-2 border-white bg-gray-400 shadow-sm" />
                            {user.educations &&
                              index < user.educations.length - 1 && (
                                <div className="mt-2 h-16 w-px bg-gray-200" />
                              )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 transition-colors hover:bg-gray-100/50">
                              {/* 학력 제목 */}
                              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                {education.title}
                              </h3>

                              {/* 기간 및 상태 */}
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {period}
                                  </span>
                                </div>
                                <Badge
                                  className={`${statusInfo.color} px-2 py-1 text-xs font-medium`}
                                >
                                  {statusInfo.label}
                                </Badge>
                              </div>

                              {/* 추가 정보 (최신 학력 표시) */}
                              {/* {index === user.educations.length - 1 && ( */}
                              {/*   <div className="pt-3 border-t border-gray-200"> */}
                              {/*     <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700"> */}
                              {/*       최신 학력 */}
                              {/*     </Badge> */}
                              {/*   </div> */}
                              {/* )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
