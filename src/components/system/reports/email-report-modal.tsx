'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Send, CheckCircle } from 'lucide-react';
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

interface EmailReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailReportModal({
  open,
  onOpenChange,
}: EmailReportModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = async () => {
    if (!email || !dateRange?.from || !dateRange?.to) {
      alert('날짜와 이메일을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 실제 구현에서는 이메일 발송 API 호출
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      setEmailSent(true);

      // 2초 후 모달 자동 닫기
      setTimeout(() => {
        onOpenChange(false);
        setEmailSent(false);
        setIsLoading(false);
        setEmail('');
      }, 2000);
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      setIsLoading(false);
      alert('이메일 발송에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setEmailSent(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!emailSent ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">
                보고서 이메일 전송
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* 날짜 범위 선택 */}
              <div className="space-y-2">
                <Label htmlFor="dateRange" className="text-sm font-medium">
                  보고서 기간
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
                              {format(dateRange.to, 'yyyy.MM.dd', {
                                locale: ko,
                              })}
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 이메일 주소 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  받는 사람 이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* 버튼들 */}
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
                onClick={handleSendEmail}
                disabled={
                  isLoading || !email || !dateRange?.from || !dateRange?.to
                }
                className="flex-1"
              >
                {isLoading ? (
                  '전송 중...'
                ) : (
                  <>
                    전송
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // 전송 완료 단계
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                전송 완료
              </h3>
              <p className="text-sm text-gray-600">
                {email}로 보고서가 전송되었습니다.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
