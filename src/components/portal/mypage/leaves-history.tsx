'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, AlertCircle, Clock, Plane, Coffee } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { formatDateTimeVer2, formatDateTimeVer5 } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LeaveStatCard } from '@/components/common/leaves-stat-card';

type VacationTypeKey =
  | 'ANNUAL'
  | 'HALF_AM'
  | 'HALF_PM'
  | 'SPECIAL_HALF_AM'
  | 'SPECIAL_HALF_PM'
  | 'SPECIAL_ANNUAL';

type VacationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface VacationRequest {
  id: string;
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

// 샘플 데이터
const sampleRequests: VacationRequest[] = [
  {
    id: '1',
    type: 'ANNUAL',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    status: 'APPROVED',
    appliedAt: '2024-02-01T09:00:00Z',
    processedAt: '2024-02-02T10:30:00Z',
    processedBy: '김팀장',
  },
  {
    id: '2',
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
    type: 'HALF_AM',
    startDate: '2024-02-10',
    endDate: '2024-02-10',
    status: 'APPROVED',
    appliedAt: '2024-01-28T11:15:00Z',
    processedAt: '2024-01-29T09:00:00Z',
    processedBy: '이부장',
  },
  {
    id: '4',
    type: 'SPECIAL_HALF_PM',
    startDate: '2024-02-08',
    endDate: '2024-02-08',
    reason: '정기 건강검진 및 병원 진료',
    status: 'REJECTED',
    appliedAt: '2024-01-25T16:45:00Z',
    processedAt: '2024-01-26T10:30:00Z',
    processedBy: '박과장',
    rejectReason:
      '해당 날짜에 중요한 회의가 예정되어 있어 오후 반차 승인이 어렵습니다. 다른 날짜로 변경 후 재신청 부탁드립니다.',
  },
  {
    id: '5',
    type: 'ANNUAL',
    startDate: '2024-02-12',
    endDate: '2024-02-14',
    status: 'APPROVED',
    appliedAt: '2024-01-30T13:20:00Z',
    processedAt: '2024-01-31T08:45:00Z',
    processedBy: '최차장',
  },
  {
    id: '6',
    type: 'HALF_PM',
    startDate: '2024-01-30',
    endDate: '2024-01-30',
    status: 'REJECTED',
    appliedAt: '2024-01-28T09:00:00Z',
    processedAt: '2024-01-29T14:20:00Z',
    processedBy: '김팀장',
    rejectReason: '업무 일정상 해당 날짜 휴가 불가합니다.',
  },
];

function calculateDuration(
  startDate: string,
  endDate: string,
  type: VacationTypeKey,
) {
  if (type.includes('HALF')) {
    return '0.5일';
  }

  if (startDate === endDate) {
    return '1일';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return `${diffDays}일`;
}

function LeavesDetailDialog({
  isOpen,
  onClose,
  request,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: VacationRequest | null;
}) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            휴가 신청 상세 정보
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            휴가 신청의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h5 className="text-md mb-3 font-semibold">휴가 신청 내용</h5>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">휴가 종류:</span>
                <Badge variant="outline" className="bg-white">
                  {vacationTypeLabels[request.type]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">휴가 기간:</span>
                <span>
                  {request.startDate === request.endDate
                    ? formatDateTimeVer2(request.startDate)
                    : `${formatDateTimeVer2(request.startDate)} ~ ${formatDateTimeVer2(request.endDate)}`}
                </span>
                <span className="text-primary font-medium">
                  (
                  {calculateDuration(
                    request.startDate,
                    request.endDate,
                    request.type,
                  )}
                  )
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">상태:</span>
                <Badge className={statusColors[request.status]}>
                  {statusLabels[request.status]}
                </Badge>
              </div>
              {request.reason && (
                <div className="flex items-center gap-2 font-medium">
                  신청 사유: {request.reason}
                </div>
              )}
              <div className="my-1 border-b" />
              <div className="flex items-center gap-2">
                <span className="font-medium">신청일:</span>
                <span>{formatDateTimeVer5(request.appliedAt)}</span>
              </div>
              {request.processedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">처리일:</span>
                  <span>{formatDateTimeVer5(request.processedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {request.status === 'REJECTED' && request.rejectReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-destructive mt-0.5 h-4 w-4" />
                <div className="flex-1">
                  <h5 className="text-destructive mb-2 text-sm font-semibold">
                    반려 사유
                  </h5>
                  <p className="text-destructive text-sm leading-relaxed whitespace-pre-wrap">
                    {request.rejectReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LeavesTable({
  data,
  onRowClick,
}: {
  data: VacationRequest[];
  onRowClick: (request: VacationRequest) => void;
}) {
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[80px] text-center">상태</TableHead>
              <TableHead className="min-w-[140px] text-center">
                휴가 종류
              </TableHead>
              <TableHead className="min-w-[140px] text-center">기간</TableHead>
              <TableHead className="min-w-[80px] text-center">일수</TableHead>
              <TableHead className="min-w-[280px] text-center">사유</TableHead>
              <TableHead className="min-w-[140px] text-center">
                신청일
              </TableHead>
              <TableHead className="min-w-[140px] text-center">
                처리일
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
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
                  className="hover:bg-muted/30 h-16 cursor-pointer transition-colors"
                  onClick={() => onRowClick(request)}
                >
                  <TableCell className="min-w-[80px] py-4 text-center">
                    <Badge
                      className={`${statusColors[request.status]} font-medium`}
                    >
                      {statusLabels[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] py-4 text-center">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {vacationTypeLabels[request.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate py-4 text-center">
                    {request.startDate === request.endDate
                      ? formatDateTimeVer2(request.startDate)
                      : `${formatDateTimeVer2(request.startDate)} ~ ${formatDateTimeVer2(request.endDate)}`}
                  </TableCell>
                  <TableCell className="min-w-[80px] py-4 text-center">
                    <span className="text-primary font-medium">
                      {calculateDuration(
                        request.startDate,
                        request.endDate,
                        request.type,
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate py-4 text-center">
                    {request.reason}
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate py-4 text-center">
                    {formatDateTimeVer5(request.appliedAt)}
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate py-4 text-center">
                    {request.processedAt ? (
                      <div className="text-sm">
                        {formatDateTimeVer5(request.processedAt)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
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

function LeaveOverview() {
  const annualLeave = 10;
  const usedLeave = 5;
  const remainingLeave = annualLeave - usedLeave;
  const usedRate = Math.round((usedLeave / annualLeave) * 100);

  return (
    <Card className="border bg-white shadow-none">
      <CardContent className="p-8">
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <LeaveStatCard
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            value={annualLeave}
            label="연간 연차"
            colorScheme="blue"
          />
          <LeaveStatCard
            icon={<Plane className="h-6 w-6 text-red-600" />}
            value={usedLeave}
            label="사용한 연차"
            colorScheme="red"
          />
          <LeaveStatCard
            icon={<Coffee className="h-6 w-6 text-green-600" />}
            value={remainingLeave}
            label="남은 연차"
            colorScheme="green"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              연차 사용률
            </span>
            <span className="text-sm text-gray-600">{usedRate}%</span>
          </div>
          <Progress value={usedRate} className="h-3" />
          <p className="text-sm text-gray-500">
            {remainingLeave}일의 연차가 남아있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeavesHistory() {
  const [requests] = useState<VacationRequest[]>(sampleRequests);
  const [selectedRequest, setSelectedRequest] =
    useState<VacationRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleRowClick = (request: VacationRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="mb-10 flex flex-col gap-14">
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">휴가 현황</h1>
          <p className="text-muted-foreground">
            연차 사용 및 잔여 일수를 한눈에 확인할 수 있습니다.
          </p>
        </div>
        <LeaveOverview />
      </div>
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">휴가 신청 내역</h1>
          <p className="text-muted-foreground">
            지금까지 신청한 휴가 기록을 확인할 수 있습니다.
          </p>
        </div>

        <LeavesTable data={requests} onRowClick={handleRowClick} />

        <LeavesDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          request={selectedRequest}
        />
      </div>
    </div>
  );
}
