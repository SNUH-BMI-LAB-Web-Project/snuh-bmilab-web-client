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
} from 'lucide-react';

interface User {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileImageUrl: string;
  organization: string;
  department: string;
  affiliation: string;
  education: string[];
  seatNumber: string;
  categories: string[];
  annualLeaveCount: number;
  usedLeaveCount: number;
  comment: string;
  joinedAt: string;
}

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
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
                    <Avatar className="mx-auto mb-6 h-28 w-28 border-2 border-gray-200">
                      <AvatarImage
                        src={user.profileImageUrl || '/placeholder.svg'}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gray-100 text-3xl font-medium text-gray-700">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <h1 className="mb-4 text-4xl font-light tracking-tight text-gray-900">
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
                        {user.categories.map((category) => (
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
                  {user.education.map((edu, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col items-center pt-2">
                          <div className="h-3 w-3 rounded-full border-2 border-white bg-gray-400 shadow-sm" />
                          {index < user.education.length - 1 && (
                            <div className="mt-2 h-8 w-px bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100/50">
                            <p className="leading-relaxed font-medium text-gray-900">
                              {edu}
                            </p>
                            {index === user.education.length - 1 && (
                              <div className="mt-3 border-t border-gray-200 pt-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-gray-200 text-xs text-gray-700"
                                >
                                  최종학력
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
