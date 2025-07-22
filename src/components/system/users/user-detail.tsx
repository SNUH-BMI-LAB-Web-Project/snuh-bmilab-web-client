'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
  Users,
  User,
  Edit,
  FolderOpen,
  Plane,
  CalendarDays,
  Coffee,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  GetAllProjectsStatusEnum,
  UserDetail as UserDetailType,
  UserEducationSummaryStatusEnum,
  UserProjectItem,
} from '@/generated-api';
import {
  statusColorMap,
  statusLabelMap,
  typeLabelMap,
} from '@/constants/education-enum';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PROJECT_STATUS_CLASSES_USER_DETAIL,
  PROJECT_STATUS_LABELS,
} from '@/constants/project-enum';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { positionLabelMap } from '@/constants/position-enum';
import { formatSeatNumber } from '@/utils/user-utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UserDetailProps {
  user: UserDetailType;
  projects: UserProjectItem[];
}

export default function AdminUserDetail({ user, projects }: UserDetailProps) {
  const [showSubAffiliations, setShowSubAffiliations] = useState(false);

  if (!user) return null;

  const getEducationStatusInfo = (
    status: string,
  ): { label: string; color: string } => {
    const label = statusLabelMap[status as UserEducationSummaryStatusEnum];
    const color = statusColorMap[status as UserEducationSummaryStatusEnum];

    return {
      label: label ?? status,
      color: color ?? 'bg-gray-100 text-gray-800',
    };
  };

  const getProjectStatusInfo = (
    status: string,
  ): { label: string; color: string } => {
    const label = PROJECT_STATUS_LABELS[status as GetAllProjectsStatusEnum];
    const color =
      PROJECT_STATUS_CLASSES_USER_DETAIL[status as GetAllProjectsStatusEnum];

    return {
      label: label ?? status,
      color: color ?? 'bg-gray-100 text-gray-800',
    };
  };

  const usedLeaveCount = user.usedLeaveCount ?? 0;
  const annualLeaveCount = user.annualLeaveCount ?? 0;

  // 연차 관련 연산
  const remainingLeave = annualLeaveCount - usedLeaveCount;
  const leaveUsagePercentage =
    annualLeaveCount > 0 ? (usedLeaveCount / annualLeaveCount) * 100 : 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* 메인 레이아웃 */}
        <div className="md grid gap-8 lg:grid-cols-1 xl:grid-cols-12">
          {/* 왼쪽 - 프로필 카드 */}
          <div className="lg:col-span-4">
            <Card className="sticky top-8 border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  {/* 프로필 이미지 및 이름 */}
                  <div>
                    <Avatar className="mx-auto mb-4 h-40 w-40 border-4 border-gray-100 shadow-lg">
                      <AvatarImage
                        src={
                          user.profileImageUrl || '/default-profile-image.svg'
                        }
                        alt={user.name}
                        className="object-cover"
                      />
                    </Avatar>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                  </div>

                  {/* 기본 정보 */}
                  <div className="space-y-4 text-left">
                    {/* 기관, 부서, 소속 */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <div className="border-b border-gray-200 bg-gray-100 px-4 py-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="h-4 w-4" />
                          BMI LAB 소속 정보
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        <div className="flex items-center px-4 py-3">
                          <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                            <Building className="h-3 w-3" />
                            기관
                          </div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            {user.organization}
                          </div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                            <Users className="h-3 w-3" />
                            부서
                          </div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            {user.department}
                          </div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                            <User className="h-3 w-3" />
                            구분
                          </div>
                          <div className="flex-1 text-sm font-semibold text-gray-900">
                            {user.position
                              ? positionLabelMap[user.position]
                              : ''}
                          </div>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                            <BookOpen className="h-3 w-3" />
                            연구분야
                          </div>
                          <div className="flex flex-1 flex-wrap items-center gap-1 text-sm font-semibold text-gray-900">
                            {user.categories?.map((field) => (
                              <Badge
                                key={field.categoryId}
                                variant="outline"
                                className="max-w-[120px] bg-white"
                                title={field.name}
                              >
                                <div className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                  {field.name}
                                </div>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.subAffiliations && user.subAffiliations.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowSubAffiliations((prev) => !prev)}
                      >
                        {showSubAffiliations ? <ChevronUp /> : <ChevronDown />}
                      </Button>

                      {showSubAffiliations &&
                        user.subAffiliations.map((aff, index) => (
                          <div
                            /* eslint-disable-next-line react/no-array-index-key */
                            key={index}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <div className="border-b border-gray-200 bg-gray-100 px-4 py-2">
                              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <User className="h-4 w-4" />
                                기타 소속 {index + 1}
                              </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                              <div className="flex items-center px-4 py-3">
                                <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                                  <Building className="h-3 w-3" />
                                  기관
                                </div>
                                <div className="flex-1 text-sm font-semibold text-gray-900">
                                  {aff.organization}
                                </div>
                              </div>
                              <div className="flex items-center px-4 py-3">
                                <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                                  <Users className="h-3 w-3" />
                                  부서
                                </div>
                                <div className="flex-1 text-sm font-semibold text-gray-900">
                                  {aff.department}
                                </div>
                              </div>
                              <div className="flex items-center px-4 py-3">
                                <div className="flex w-20 items-center gap-2 text-xs font-medium text-gray-600">
                                  <User className="h-3 w-3" />
                                  구분
                                </div>
                                <div className="flex-1 text-sm font-semibold text-gray-900">
                                  {aff.position}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* 좌석 번호 */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <MapPin className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-medium text-gray-700">
                        좌석 번호
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {user.seatNumber
                          ? formatSeatNumber(user.seatNumber)
                          : '좌석 정보 없음'}
                      </p>
                    </div>
                  </div>

                  {/* 코멘트 */}
                  {user.comment && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Edit className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700">
                          코멘트
                        </h3>
                      </div>
                      <div className="text-left text-sm leading-relaxed text-gray-700">
                        {user.comment}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 - 상세 정보 */}
          <div className="lg:col-span-4 xl:col-span-8">
            <Tabs defaultValue="profile">
              <TabsList className="grid h-12 w-full grid-cols-2 border border-gray-200 bg-white p-1">
                <TabsTrigger
                  value="profile"
                  className="text-sm font-medium data-[state=active]:bg-gray-100"
                >
                  프로필 정보
                </TabsTrigger>
                <TabsTrigger
                  value="vacation"
                  className="text-sm font-medium data-[state=active]:bg-gray-100"
                >
                  휴가 정보
                </TabsTrigger>
              </TabsList>

              {/* 프로필 정보 탭 */}
              <TabsContent value="profile" className="space-y-6">
                {/* 연락처 정보 */}
                <Card className="border border-gray-100 bg-white shadow-sm">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        연락처
                      </h2>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
                      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                            이메일
                          </p>
                          <p className="font-medium break-all text-gray-900">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                          <Phone className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                            전화번호
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 참여 프로젝트 */}
                <Card className="border border-gray-100 bg-white shadow-sm">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <FolderOpen className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        참여 프로젝트
                      </h2>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        총 {projects?.length || 0}개
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {projects?.map((project) => (
                        <div
                          key={project.projectId}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition-colors hover:bg-gray-100/50"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                {project.title}
                              </h3>
                              {project.category && (
                                <Badge
                                  variant="outline"
                                  className="border-gray-300 bg-white text-xs text-gray-600"
                                >
                                  {project.category?.name}
                                </Badge>
                              )}
                            </div>
                            <Badge
                              className={`${getProjectStatusInfo(project.status!).color} ml-4 px-3 py-1 text-xs font-medium`}
                            >
                              {getProjectStatusInfo(project.status!).label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              연구기간:
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {project.startDate
                                ? format(
                                    new Date(project.startDate),
                                    'yyyy-MM-dd',
                                  )
                                : ''}
                              {' ~ '}
                              {project.endDate
                                ? format(
                                    new Date(project.endDate),
                                    'yyyy-MM-dd',
                                  )
                                : ''}
                            </span>
                          </div>
                        </div>
                      ))}
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
                        const statusInfo = getEducationStatusInfo(
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
                                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                                    {education.title}{' '}
                                    {typeLabelMap[education.type!]}
                                  </h3>

                                  {/* 기간 및 상태 */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      <span className="text-xs font-medium">
                                        {education.startYearMonth} ~{' '}
                                        {education.endYearMonth}
                                      </span>
                                    </div>
                                    <Badge
                                      className={`${statusInfo.color} px-2 py-1 text-xs font-medium`}
                                    >
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 휴가 정보 탭 */}
              <TabsContent value="vacation" className="space-y-6">
                <Card className="border border-gray-100 bg-white shadow-sm">
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <CalendarDays className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        연차 현황
                      </h2>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {user.annualLeaveCount}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          연간 연차
                        </p>
                      </div>

                      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                          <Plane className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-red-900">
                          {user.usedLeaveCount}
                        </p>
                        <p className="text-sm font-medium text-red-600">
                          사용한 연차
                        </p>
                      </div>

                      <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <Coffee className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {remainingLeave}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          남은 연차
                        </p>
                      </div>
                    </div>

                    {/* 연차 사용률 프로그레스 바 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          연차 사용률
                        </span>
                        <span className="text-sm text-gray-600">
                          {leaveUsagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={leaveUsagePercentage} className="h-3" />
                      <p className="text-xs text-gray-500">
                        {remainingLeave > 0
                          ? `${remainingLeave}일의 연차가 남아있습니다.`
                          : '모든 연차를 사용했습니다.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {/* 휴가 사용 내역 */}
                {/* <Card className="border border-gray-100 bg-white shadow-sm"> */}
                {/*   <CardContent className="p-8"> */}
                {/*     <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4"> */}
                {/*       <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100"> */}
                {/*         <Clock className="h-4 w-4 text-gray-600" /> */}
                {/*       </div> */}
                {/*       <h2 className="text-xl font-semibold text-gray-900"> */}
                {/*         휴가 사용 내역 */}
                {/*       </h2> */}
                {/*       <Badge variant="secondary" className="ml-auto text-xs"> */}
                {/*         총 {user.leaveHistory.length}건 */}
                {/*       </Badge> */}
                {/*     </div> */}
                {/*     <div className="space-y-4"> */}
                {/*       {user.leaveHistory.map((leave) => ( */}
                {/*         <div */}
                {/*           key={leave.id} */}
                {/*           className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100/50" */}
                {/*         > */}
                {/*           <div className="flex items-center gap-4"> */}
                {/*             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"> */}
                {/*               {getLeaveTypeIcon(leave.type)} */}
                {/*             </div> */}
                {/*             <div> */}
                {/*               <div className="mb-1 flex items-center gap-2"> */}
                {/*                 <span className="font-medium text-gray-900"> */}
                {/*                   {leave.type} */}
                {/*                 </span> */}
                {/*                 <Badge variant="outline" className="text-xs"> */}
                {/*                   {leave.days}일 */}
                {/*                 </Badge> */}
                {/*               </div> */}
                {/*               <p className="text-sm text-gray-600"> */}
                {/*                 {formatDate(leave.startDate)} */}
                {/*                 {leave.startDate !== leave.endDate && */}
                {/*                   ` - ${formatDate(leave.endDate)}`} */}
                {/*               </p> */}
                {/*               <p className="text-xs text-gray-500"> */}
                {/*                 {leave.reason} */}
                {/*               </p> */}
                {/*             </div> */}
                {/*           </div> */}
                {/*           <Badge */}
                {/*             variant={ */}
                {/*               leave.status === '승인' ? 'default' : 'secondary' */}
                {/*             } */}
                {/*             className="text-xs" */}
                {/*           > */}
                {/*             {leave.status} */}
                {/*           </Badge> */}
                {/*         </div> */}
                {/*       ))} */}
                {/*     </div> */}
                {/*     {user.leaveHistory.length === 0 && ( */}
                {/*       <div className="py-8 text-center"> */}
                {/*         <CalendarDays className="mx-auto mb-4 h-12 w-12 text-gray-300" /> */}
                {/*         <p className="text-gray-500"> */}
                {/*           휴가 사용 내역이 없습니다. */}
                {/*         </p> */}
                {/*       </div> */}
                {/*     )} */}
                {/*   </CardContent> */}
                {/* </Card> */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
