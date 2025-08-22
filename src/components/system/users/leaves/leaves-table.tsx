'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Check, X, User, Building, Users } from 'lucide-react';
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
import { PaginatedTable } from '@/components/common/paginated-table';
import {
  AdminLeaveApi,
  GetLeaves1StatusEnum,
  LeaveDetail,
  UserDetail,
} from '@/generated-api';
import { getApiConfig } from '@/lib/config';
import {
  leaveStatusColorMap,
  leaveStatusLabelMap,
  leaveTyoeLabelMap,
} from '@/constants/leave-enum';
import { toast } from 'sonner';
import { positionLabelMap } from '@/constants/position-enum';

// 자주 사용하는 반려사유 템플릿 추가
const rejectReasonTemplates = [
  '휴가 일정이 업무 일정과 겹칩니다.',
  '해당 기간에 이미 다른 직원이 휴가를 사용 중입니다.',
  '프로젝트 마감일과 겹쳐 휴가 승인이 어렵습니다.',
  '사전 협의가 필요한 사항입니다.',
  '휴가 신청 기간이 너무 짧습니다.',
];

const leaveApi = new AdminLeaveApi(getApiConfig());

function UserProfilePopover({ employee }: { employee: UserDetail }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <div className="flex cursor-pointer items-center gap-3">
            <Avatar
              className={cn('aspect-square h-9 w-9 rounded-full border-1')}
            >
              <AvatarImage
                src={employee.profileImageUrl || '/default-profile-image.svg'}
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
                src={employee.profileImageUrl || '/default-profile-image.svg'}
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
              <span>{employee.organization ? employee.organization : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">부서:</span>
              <span>{employee.department ? employee.department : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">구분:</span>
              <span>
                {employee.position ? positionLabelMap[employee.position] : ''}
              </span>
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
  selectedRequest: LeaveDetail | null;
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
                    src={
                      selectedRequest.user?.profileImageUrl ||
                      '/default-profile-image.svg'
                    }
                    alt={selectedRequest.user?.name}
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <h4 className="text-foreground text-lg font-semibold">
                    {selectedRequest.user?.name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedRequest.user?.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">기관:</span>
                  <span>
                    {selectedRequest.user?.organization
                      ? selectedRequest.user?.organization
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">부서:</span>
                  <span>
                    {selectedRequest.user?.department
                      ? selectedRequest.user?.department
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">구분:</span>
                  <span>
                    {selectedRequest.user?.position
                      ? positionLabelMap[selectedRequest.user?.position]
                      : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h5 className="text-md mb-2 font-semibold">휴가 신청 내용</h5>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span>휴가 종류:</span>
                  <span className="ml-2">
                    {leaveTyoeLabelMap[selectedRequest.type || 'ANNUAL']}
                  </span>
                </div>
                <div>
                  <span>휴가 기간:</span>
                  <span className="ml-2">
                    {(() => {
                      const { startDate, endDate } = selectedRequest;

                      if (!startDate && !endDate) return '-';
                      // if (!startDate) return formatDateTimeVer2(endDate!);
                      if (!endDate) return formatDateTimeVer2(startDate!);
                      if (startDate === endDate)
                        return formatDateTimeVer2(startDate!);

                      return `${formatDateTimeVer2(startDate!)} ~ ${formatDateTimeVer2(endDate!)}`;
                    })()}
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

const getLeaveColumns = ({
  onApprove,
  onReject,
}: {
  onApprove: (leaveId: number) => void;
  onReject: (row: LeaveDetail) => void;
}) => [
  {
    label: '신청자',
    className: 'w-[200px]',
    cell: (row: LeaveDetail) =>
      row.user ? (
        <UserProfilePopover employee={row.user} />
      ) : (
        <span className="text-muted-foreground">알 수 없음</span>
      ),
  },
  {
    label: '휴가 종류',
    className: 'text-center w-[140px]',
    cell: (row: LeaveDetail) => (
      <Badge variant="outline">{leaveTyoeLabelMap[row.type || 'ANNUAL']}</Badge>
    ),
  },
  {
    label: '기간',
    className: 'text-center w-[250px]',
    cell: (row: LeaveDetail) => {
      const { startDate, endDate } = row;

      if (!startDate && !endDate) return '-';

      const start = startDate ? formatDateTimeVer2(startDate) : '';
      const end = endDate ? formatDateTimeVer2(endDate) : '';

      if (start && end) {
        return `${start} ~ ${end}`;
      }

      return start || end;
    },
  },
  {
    label: '사유',
    className: 'w-[350px] text-center',
    cell: (row: LeaveDetail) => <ReasonDisplay reason={row.reason} />,
  },
  {
    label: '상태',
    className: 'w-[80px] text-center',
    cell: (row: LeaveDetail) => {
      const status = row.status ?? 'PENDING';

      return row.status === 'REJECTED' && row.rejectReason ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              <Badge
                className={`${leaveStatusColorMap[status]} cursor-pointer font-medium transition-opacity hover:opacity-80`}
              >
                {leaveStatusLabelMap[status]}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="center">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-800">반려 사유</h4>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-red-800">
                  {row.rejectReason}
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Badge className={`${leaveStatusColorMap[status]} font-medium`}>
          {leaveStatusLabelMap[status]}
        </Badge>
      );
    },
  },
  {
    label: '신청일',
    className: 'text-center w-[180px]',
    cell: (row: LeaveDetail) =>
      row.applicatedAt ? formatDateTimeVer5(row.applicatedAt) : '-',
  },
  {
    label: '',
    className: 'text-center w-[200px]',
    cell: (row: LeaveDetail) =>
      row.status === 'PENDING' ? (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            onClick={() => row.leaveId && onApprove(row.leaveId)}
          >
            <Check className="mr-1 h-3 w-3" />
            승인
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onReject(row)}>
            <X className="mr-1 h-3 w-3" />
            반려
          </Button>
        </div>
      ) : (
        <div className="text-muted-foreground space-y-1 text-xs">
          {row.processedAt && (
            <div className="flex items-center gap-1 truncate">
              처리일시: {formatDateTimeVer5(row.processedAt)}
            </div>
          )}
          {row.processor?.name && (
            <div className="flex items-center gap-1 truncate">
              처리자: {row.processor.name}
            </div>
          )}
        </div>
      ),
  },
];

export default function LeavesAdmin() {
  const [status, setStatus] = useState<GetLeaves1StatusEnum | undefined>(
    undefined,
  );
  const [requests, setRequests] = useState<LeaveDetail[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveDetail | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getLeaves1({
        status,
        page: currentPage - 1,
        size: itemsPerPage,
      });
      setRequests(res.leaves || []);
      setTotalPage(res.totalPage ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [status, currentPage, itemsPerPage]);

  const handleApprove = async (leaveId: number) => {
    try {
      await leaveApi.approveLeave({ leaveId });
      await fetchLeaves();

      toast.success('휴가 신청이 성공적으로 승인되었습니다.');
    } catch (e) {
      console.error('휴가 승인 실패:', e);
    }
  };

  const handleReject = (request: LeaveDetail) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;

    try {
      await leaveApi.rejectLeave({
        leaveId: selectedRequest.leaveId!,
        rejectLeaveRequest: {
          rejectReason: rejectReason.trim(),
        },
      });

      await fetchLeaves();

      toast.success('휴가 신청이 성공적으로 반려되었습니다.');
    } catch (e) {
      console.error('휴가 반려 실패:', e);
    }

    setIsRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectReason('');
    setSelectedTemplate('');
  };

  return (
    <div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="all"
            onClick={() => {
              setStatus(undefined);
              setCurrentPage(1);
            }}
            className="group flex items-center gap-2"
          >
            전체
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            onClick={() => {
              setStatus(GetLeaves1StatusEnum.Pending);
              setCurrentPage(1);
            }}
            className="group flex items-center gap-2"
          >
            대기
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => {
              setStatus(GetLeaves1StatusEnum.Approved);
              setCurrentPage(1);
            }}
            className="group flex items-center gap-2"
          >
            승인
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            onClick={() => {
              setStatus(GetLeaves1StatusEnum.Rejected);
              setCurrentPage(1);
            }}
            className="group flex items-center gap-2"
          >
            반려
          </TabsTrigger>
        </TabsList>

        {['all', 'pending', 'approved', 'rejected'].map((value) => (
          <TabsContent
            key={value}
            value={value}
            className="space-y-4 [&_th:first-child]:pl-14"
          >
            <PaginatedTable
              data={requests}
              rowKey={(row) => String(row.leaveId)}
              columns={getLeaveColumns({
                onApprove: handleApprove,
                onReject: handleReject,
              })}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPage={totalPage}
              loading={loading}
            />
          </TabsContent>
        ))}
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
