'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReportDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (range: { from: Date; to: Date }) => Promise<void>;
  title?: string;
}

export function ReportDownloadModal({
  open,
  onOpenChange,
  onDownload,
  title = '일일 업무 보고 파일 다운로드',
}: ReportDownloadModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('날짜 범위를 선택하세요.');
      return;
    }
    setIsLoading(true);
    try {
      await onDownload({ from: dateRange.from, to: dateRange.to });
      onOpenChange(false);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 날짜 범위 선택: 항상 표시 */}
            <div className="space-y-2">
              <Label htmlFor="dateRange" className="text-sm font-medium">
                보고 기간
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateRange"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange && 'text-muted-foreground',
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {(() => {
                      if (dateRange?.from && dateRange.to) {
                        return (
                          <>
                            {format(dateRange.from, 'yyyy.MM.dd', {
                              locale: ko,
                            })}{' '}
                            -{' '}
                            {format(dateRange.to, 'yyyy.MM.dd', { locale: ko })}
                          </>
                        );
                      }
                      if (dateRange?.from) {
                        return format(dateRange.from, 'yyyy.MM.dd', {
                          locale: ko,
                        });
                      }
                      return <span>날짜 범위를 선택하세요</span>;
                    })()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ko}
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading || !dateRange?.from || !dateRange?.to}
              className="flex-1"
            >
              {isLoading ? '다운로드 중...' : '다운로드'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
