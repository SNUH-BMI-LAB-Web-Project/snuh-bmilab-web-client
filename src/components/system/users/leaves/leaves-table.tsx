'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Calendar, User, Building, Users } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDateTimeVer5, formatDateTimeVer2 } from '@/lib/utils';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

type VacationTypeKey =
  | 'ANNUAL'
  | 'HALF_AM'
  | 'HALF_PM'
  | 'SPECIAL_HALF_AM'
  | 'SPECIAL_HALF_PM'
  | 'SPECIAL_ANNUAL';

type VacationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  organization: string;
  position: string;
}

interface VacationRequest {
  id: string;
  employee: Employee;
  type: VacationTypeKey;
  startDate: string;
  endDate: string;
  reason?: string;
  status: VacationStatus;
  appliedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}

const vacationTypeLabels: Record<VacationTypeKey, string> = {
  ANNUAL: '일반 연차',
  HALF_AM: '일반 반차 (오전)',
  HALF_PM: '일반 반차 (오후)',
  SPECIAL_ANNUAL: '특별 연차',
  SPECIAL_HALF_AM: '특별 반차 (오전)',
  SPECIAL_HALF_PM: '특별 반차 (오후)',
};

const statusLabels: Record<VacationStatus, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const statusColors: Record<VacationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

// 자주 사용하는 반려사유 템플릿 추가
const rejectReasonTemplates = [
  '휴가 일정이 업무 일정과 겹칩니다.',
  '해당 기간에 이미 다른 직원이 휴가를 사용 중입니다.',
  '프로젝트 마감일과 겹쳐 휴가 승인이 어렵습니다.',
  '사전 협의가 필요한 사항입니다.',
  '휴가 신청 기간이 너무 짧습니다.',
];

// 샘플 데이터
const sampleRequests: VacationRequest[] = [
  {
    id: '1',
    employee: {
      id: 'emp1',
      name: '김철수',
      email: 'kim.cs@company.com',
      department: '개발팀',
      organization: '기술본부',
      position: '선임개발자',
    },
    type: 'ANNUAL',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    status: 'PENDING',
    appliedAt: '2024-02-01T09:00:00Z',
  },
  {
    id: '2',
    employee: {
      id: 'emp2',
      name: '이영희',
      email: 'lee.yh@company.com',
      department: '마케팅팀',
      organization: '영업본부',
      position: '마케팅매니저',
    },
    type: 'SPECIAL_ANNUAL',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    reason:
      '가족 경조사로 인한 특별휴가 신청입니다. 할머니 장례식에 참석해야 하며, 지방에 있어 이동시간을 고려하여 하루 종일 휴가가 필요합니다.',
    status: 'PENDING',
    appliedAt: '2024-02-02T14:30:00Z',
  },
  {
    id: '3',
    employee: {
      id: 'emp3',
      name: '박민수',
      email: 'park.ms@company.com',
      department: '영업팀',
      organization: '영업본부',
      position: '영업대리',
    },
    type: 'HALF_AM',
    startDate: '2024-02-10',
    endDate: '2024-02-10',
    status: 'APPROVED',
    appliedAt: '2024-01-28T11:15:00Z',
    processedAt: '2024-01-29T09:00:00Z',
    processedBy: '관리자',
  },
  {
    id: '4',
    employee: {
      id: 'emp4',
      name: '정수진',
      email: 'jung.sj@company.com',
      department: '인사팀',
      organization: '경영지원본부',
      position: '인사담당자',
    },
    type: 'SPECIAL_HALF_PM',
    startDate: '2024-02-08',
    endDate: '2024-02-08',
    reason: '정기 건강검진 및 병원 진료',
    status: 'REJECTED',
    appliedAt: '2024-01-25T16:45:00Z',
    processedAt: '2024-01-26T10:30:00Z',
    processedBy: '관리자',
    rejectReason:
      '해당 날짜에 중요한 회의가 예정되어 있어 오후 반차 승인이 어렵습니다. 다른 날짜로 변경 후 재신청 부탁드립니다.',
  },
  {
    id: '5',
    employee: {
      id: 'emp5',
      name: '최동욱',
      email: 'choi.dw@company.com',
      department: '개발팀',
      organization: '기술본부',
      position: '주임개발자',
    },
    type: 'ANNUAL',
    startDate: '2024-02-12',
    endDate: '2024-02-14',
    status: 'APPROVED',
    appliedAt: '2024-01-30T13:20:00Z',
    processedAt: '2024-01-31T08:45:00Z',
    processedBy: '관리자',
  },
];

function UserProfilePopover({ employee }: { employee: Employee }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <div className="flex cursor-pointer items-center gap-3">
            <Avatar
              className={cn('aspect-square h-9 w-9 rounded-full border-1')}
            >
              <AvatarImage
                src="/default-profile-image.svg"
                alt="tmp"
                className="object-cover"
              />
            </Avatar>
            <span className="truncate transition-colors hover:underline">
              {employee.name}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              className={cn('aspect-square h-12 w-12 rounded-full border-1')}
            >
              <AvatarImage
                src="/default-profile-image.svg"
                alt="tmp"
                className="object-cover"
              />
            </Avatar>
            <div>
              <h4 className="text-lg font-semibold">{employee.name}</h4>
              <p className="text-muted-foreground text-sm">{employee.email} </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">기관:</span>
              <span>{employee.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">부서:</span>
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">구분:</span>
              <span>{employee.position}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RejectDialog({
  isOpen,
  onClose,
  selectedRequest,
  rejectReason,
  setRejectReason,
  selectedTemplate,
  setSelectedTemplate,
  rejectReasonTemplates: templates,
  confirmReject,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: VacationRequest | null;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  rejectReasonTemplates: string[];
  confirmReject: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            휴가 신청 반려
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            반려할 휴가 신청의 상세 정보를 확인하고 반려 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar
                  className={cn(
                    'aspect-square h-12 w-12 rounded-full border-1',
                  )}
                >
                  <AvatarImage
                    src="/default-profile-image.svg"
                    alt="tmp"
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <h4 className="text-foreground text-lg font-semibold">
                    {selectedRequest.employee.name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedRequest.employee.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">기관:</span>
                  <span>{selectedRequest.employee.organization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">부서:</span>
                  <span>{selectedRequest.employee.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">구분:</span>
                  <span>{selectedRequest.employee.position}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h5 className="text-md mb-2 font-semibold">휴가 신청 내용</h5>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span>휴가 종류:</span>
                  <span className="ml-2">
                    {vacationTypeLabels[selectedRequest.type]}
                  </span>
                </div>
                <div>
                  <span>휴가 기간:</span>
                  <span className="ml-2">
                    {selectedRequest.startDate === selectedRequest.endDate
                      ? formatDateTimeVer2(selectedRequest.startDate)
                      : `${formatDateTimeVer2(selectedRequest.startDate)} ~ ${formatDateTimeVer2(selectedRequest.endDate)}`}
                  </span>
                </div>
              </div>
              {selectedRequest.reason && (
                <div className="mt-3">
                  <span className="text-sm">신청 사유:</span>
                  <div className="mt-1 rounded border bg-white p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedRequest.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="template-select" className="text-sm font-medium">
              자주 사용하는 반려사유
            </Label>
            <Select
              value={selectedTemplate}
              onValueChange={(value) => {
                setSelectedTemplate(value);
                if (value) {
                  setRejectReason(value);
                }
              }}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="템플릿을 선택하세요..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              반려 사유 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="반려 사유를 상세히 입력해주세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="mt-2 ml-1 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                반려 사유는 연구원에게 전달됩니다.
              </span>
              <span className="text-muted-foreground text-xs">
                {rejectReason.length}/500
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setRejectReason('');
              setSelectedTemplate('');
            }}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={confirmReject}
            disabled={!rejectReason.trim()}
          >
            반려
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReasonDisplay({ reason }: { reason?: string }) {
  if (!reason) return <span className="text-muted-foreground text-sm">-</span>;

  const isLong = reason.length > 30;
  const displayText = isLong ? `${reason.substring(0, 30)}...` : reason;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 text-left hover:bg-transparent"
        >
          <span
            className="cursor-pointer text-sm hover:underline"
            title="클릭하여 전체 내용 보기"
          >
            {displayText}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">신청 사유</h4>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {reason}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LeavesTable({
  data,
  handleApprove,
  handleReject,
}: {
  data: VacationRequest[];
  handleApprove: (id: string) => void;
  handleReject: (request: VacationRequest) => void;
}) {
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[120px] pl-14">신청자</TableHead>
              <TableHead className="min-w-[140px] text-center">
                휴가 종류
              </TableHead>
              <TableHead className="min-w-[140px] text-center">기간</TableHead>
              <TableHead className="min-w-[150px] text-center">사유</TableHead>
              <TableHead className="min-w-[80px] text-center">상태</TableHead>
              <TableHead className="min-w-[140px] text-center">
                신청일
              </TableHead>
              <TableHead className="min-w-[160px] text-center"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="text-muted-foreground/50 h-8 w-8" />
                    <span>해당하는 휴가 신청이 없습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="min-w-[120px]">
                    <UserProfilePopover employee={request.employee} />
                  </TableCell>
                  <TableCell className="min-w-[140px] text-center">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {vacationTypeLabels[request.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate text-center">
                    {request.startDate === request.endDate
                      ? formatDateTimeVer2(request.startDate)
                      : `${formatDateTimeVer2(request.startDate)} ~ ${formatDateTimeVer2(request.endDate)}`}
                  </TableCell>
                  <TableCell className="min-w-[150px] text-center">
                    <ReasonDisplay reason={request.reason} />
                  </TableCell>
                  <TableCell className="min-w-[80px] text-center">
                    {request.status === 'REJECTED' && request.rejectReason ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 hover:bg-transparent"
                          >
                            <Badge
                              className={`${statusColors[request.status]} cursor-pointer font-medium transition-opacity hover:opacity-80`}
                            >
                              {statusLabels[request.status]}
                            </Badge>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="center">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-red-800">
                              반려 사유
                            </h4>
                            <div className="rounded-lg bg-red-50 p-3">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-red-800">
                                {request.rejectReason}
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Badge
                        className={`${statusColors[request.status]} font-medium`}
                      >
                        {statusLabels[request.status]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate text-center">
                    {formatDateTimeVer5(request.appliedAt)}
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <div className="flex items-center justify-center gap-2">
                      {request.status === 'PENDING' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request)}
                          >
                            <X className="mr-1 h-3 w-3" />
                            반려
                          </Button>
                        </>
                      ) : (
                        <div className="text-muted-foreground space-y-1 text-xs">
                          {request.processedAt && (
                            <div className="flex items-center gap-1 truncate">
                              처리일시:{' '}
                              {formatDateTimeVer5(request.processedAt)}
                            </div>
                          )}
                          {request.processedBy && (
                            <div className="text-muted-foreground text-xs">
                              처리자: {request.processedBy}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

export default function LeavesAdmin() {
  const [requests, setRequests] = useState<VacationRequest[]>(sampleRequests);
  const [selectedRequest, setSelectedRequest] =
    useState<VacationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const filterRequestsByStatus = (status?: VacationStatus) => {
    if (!status) return requests;
    return requests.filter((request) => request.status === status);
  };

  const handleApprove = (requestId: string) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'APPROVED' as VacationStatus,
              processedAt: new Date().toISOString(),
              processedBy: '관리자',
            }
          : request,
      ),
    );
  };

  const handleReject = (request: VacationRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!selectedRequest) return;

    setRequests((prev) =>
      prev.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: 'REJECTED' as VacationStatus,
              rejectReason: rejectReason.trim(),
              processedAt: new Date().toISOString(),
              processedBy: '관리자',
            }
          : request,
      ),
    );

    setIsRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectReason('');
    setSelectedTemplate('');
  };

  const allRequests = filterRequestsByStatus();
  const pendingRequests = filterRequestsByStatus('PENDING');
  const approvedRequests = filterRequestsByStatus('APPROVED');
  const rejectedRequests = filterRequestsByStatus('REJECTED');

  return (
    <div className="w-full py-6">
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="group flex items-center gap-2">
            전체
            <Badge
              variant="secondary"
              className="group-data-[state=inactive]:text-muted-foreground ml-1 group-data-[state=inactive]:bg-white"
            >
              {allRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="group flex items-center gap-2"
          >
            대기
            <Badge
              variant="secondary"
              className="group-data-[state=inactive]:text-muted-foreground ml-1 group-data-[state=inactive]:bg-white"
            >
              {pendingRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="group flex items-center gap-2"
          >
            승인
            <Badge
              variant="secondary"
              className="group-data-[state=inactive]:text-muted-foreground ml-1 group-data-[state=inactive]:bg-white"
            >
              {approvedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="group flex items-center gap-2"
          >
            반려
            <Badge
              variant="secondary"
              className="group-data-[state=inactive]:text-muted-foreground ml-1 group-data-[state=inactive]:bg-white"
            >
              {rejectedRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <LeavesTable
            data={allRequests}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <LeavesTable
            data={pendingRequests}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <LeavesTable
            data={approvedRequests}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <LeavesTable
            data={rejectedRequests}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        </TabsContent>
      </Tabs>

      <RejectDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        selectedRequest={selectedRequest}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        rejectReasonTemplates={rejectReasonTemplates}
        confirmReject={confirmReject}
      />
    </div>
  );
}
