'use client';

import * as React from 'react';
import { format, isAfter, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowRightLeft } from 'lucide-react';

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });
  const [open, setOpen] = React.useState(false);
  const [isPickingEndDate, setIsPickingEndDate] = React.useState(false);

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;

    if (!isPickingEndDate) {
      setDate({ from: selected, to: undefined });
      setIsPickingEndDate(true);
    } else {
      const isValid = date.from && isAfter(selected, date.from);
      setDate({
        from: date.from,
        to: isValid ? selected : date.from, // 역전 방지
      });
      setOpen(false);
      setIsPickingEndDate(false);
    }
  };

  let displayDate: React.ReactNode;

  if (date.from) {
    if (date.to) {
      displayDate = `${format(date.from, 'PPP', { locale: ko })} - ${format(date.to, 'PPP', { locale: ko })}`;
    } else {
      displayDate = format(date.from, 'PPP', { locale: ko });
    }
  } else {
    displayDate = '날짜 선택';
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal hover:bg-white',
              'h-10 min-w-[280px]',
              !date.from && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{displayDate}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-full max-w-[--radix-popover-trigger-width] p-1"
          sideOffset={4}
          align="center"
        >
          {' '}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-muted-foreground ml-1 py-2 text-sm">
              {isPickingEndDate ? '종료일 선택' : '시작일 선택'}
            </span>
            {date.from && date.to && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsPickingEndDate((prev) => !prev)}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Calendar
            mode="single"
            selected={isPickingEndDate ? date.to : date.from}
            onSelect={handleSelect}
            defaultMonth={isPickingEndDate ? (date.to ?? date.from) : date.from}
            locale={ko}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
