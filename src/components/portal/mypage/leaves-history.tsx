'use client';

import React, { useEffect, useState } from 'react';
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
import {
  Calendar,
  AlertCircle,
  Clock,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import { formatDateTimeVer2, formatDateTimeVer5 } from '@/lib/utils';
import {
  LeaveApi,
  type LeaveDetail,
  LeaveDetailTypeEnum,
  UserLeaveResponse,
} from '@/generated-api';
import {
  leaveStatusColorMap,
  leaveStatusLabelMap,
  leaveTyoeLabelMap,
} from '@/constants/leave-enum';
import { getApiConfig } from '@/lib/config';
import { LeaveOverview } from '@/components/portal/mypage/leave-overview';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const leaveApi = new LeaveApi(getApiConfig());

function calculateDuration(
  startDate: Date,
  endDate?: Date,
  type?: LeaveDetailTypeEnum,
): string {
  if (type?.includes('HALF')) {
    return '0.5일';
  }

  if (!endDate || startDate.getTime() === endDate.getTime()) {
    return '1일';
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
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
  request: LeaveDetail | null;
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
                  {leaveTyoeLabelMap[request.type!]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">휴가 기간:</span>
                <span>
                  {!request.endDate || request.startDate === request.endDate
                    ? formatDateTimeVer2(request.startDate!)
                    : `${formatDateTimeVer2(request.startDate!)} ~ ${formatDateTimeVer2(request.endDate!)}`}
                </span>

                <span className="text-primary font-medium">
                  (
                  {calculateDuration(
                    request.startDate!,
                    request.endDate,
                    request.type,
                  )}
                  )
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">상태:</span>
                <Badge className={leaveStatusColorMap[request.status!]}>
                  {leaveStatusLabelMap[request.status!]}
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
                <span>{formatDateTimeVer5(request.applicatedAt!)}</span>
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
interface LeavesTableProps {
  data: LeaveDetail[];
  onRowClick: (request: LeaveDetail) => void;
  showPagination?: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

function LeavesTable({
  data,
  onRowClick,
  showPagination = true,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
}: LeavesTableProps) {
  const paginatedData = data;

  const changePage = (page: number) => {
    const clampedPage = Math.min(Math.max(1, page), totalPages);
    onPageChange(clampedPage);
  };

  return (
    <div>
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
            {paginatedData.length === 0 ? (
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
              paginatedData.map((request) => (
                <TableRow
                  key={request.leaveId}
                  className="hover:bg-muted/30 h-16 cursor-pointer transition-colors"
                  onClick={() => onRowClick(request)}
                >
                  <TableCell className="min-w-[80px] py-4 text-center">
                    <Badge
                      className={`${leaveStatusColorMap[request.status!]} font-medium`}
                    >
                      {leaveStatusLabelMap[request.status!]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] py-4 text-center">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {leaveTyoeLabelMap[request.type!]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate py-4 text-center">
                    {!request.endDate ||
                    request.startDate!.getTime() === request.endDate.getTime()
                      ? formatDateTimeVer2(request.startDate!)
                      : `${formatDateTimeVer2(request.startDate!)} ~ ${formatDateTimeVer2(request.endDate)}`}
                  </TableCell>
                  <TableCell className="min-w-[80px] py-4 text-center">
                    <span className="text-primary font-medium">
                      {calculateDuration(
                        request.startDate!,
                        request.endDate,
                        request.type,
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate py-4 text-center">
                    {request.reason}
                  </TableCell>
                  <TableCell className="min-w-[140px] truncate py-4 text-center">
                    {formatDateTimeVer5(request.applicatedAt!)}
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
      {showPagination && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                onItemsPerPageChange(Number(value));
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                {DEFAULT_ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}개
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeavesHistory() {
  const [requests, setRequests] = useState<LeaveDetail[]>([]);
  const [annualLeaveCount, setAnnualLeaveCount] = useState<number>(0);
  const [usedLeaveCount, setUsedLeaveCount] = useState<number>(0);
  const [selectedRequest, setSelectedRequest] = useState<LeaveDetail | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res: UserLeaveResponse = await leaveApi.getLeavesByUser({
          page: currentPage - 1,
          size: itemsPerPage,
        });

        setRequests(res.leaves ?? []);
        setAnnualLeaveCount(res.annualLeaveCount ?? 0);
        setUsedLeaveCount(res.usedLeaveCount ?? 0);

        setTotalPages(res.totalPage ?? 1);
      } catch (error) {
        console.error('휴가 조회 실패:', error);
      }
    };

    fetchLeaves();
  }, [currentPage, itemsPerPage]);

  const handleRowClick = (request: LeaveDetail) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="mb-10 flex flex-col gap-14">
      {/* 연차 현황 */}
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">휴가 현황</h1>
          <p className="text-muted-foreground">
            연차 사용 및 잔여 일수를 한눈에 확인할 수 있습니다.
          </p>
        </div>
        <LeaveOverview
          annualLeaveCount={annualLeaveCount}
          usedLeaveCount={usedLeaveCount}
        />
      </div>

      {/* 휴가 신청 내역 */}
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">휴가 신청 내역</h1>
          <p className="text-muted-foreground">
            지금까지 신청한 휴가 기록을 확인할 수 있습니다.
          </p>
        </div>

        <LeavesTable
          data={requests}
          onRowClick={handleRowClick}
          showPagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(count) => {
            setItemsPerPage(count);
            setCurrentPage(1);
          }}
        />

        <LeavesDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          request={selectedRequest}
        />
      </div>
    </div>
  );
}
