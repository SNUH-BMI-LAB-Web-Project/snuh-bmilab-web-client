'use client';

import * as React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowRightLeft } from 'lucide-react';

interface DateRangePickerProps {
  className?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  onChangeComplete?: (range: DateRange) => void;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  onChangeComplete,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const [open, setOpen] = React.useState(false);
  const [isPickingEndDate, setIsPickingEndDate] = React.useState(false);

  React.useEffect(() => {
    if (value?.from) {
      setRange(value);
    }
  }, [value]);

  const handleDayClick = (day: Date) => {
    if (!isPickingEndDate) {
      const newRange = { from: day, to: undefined };
      setRange(newRange);
      onChange?.(newRange);
      setIsPickingEndDate(true);
    } else {
      const isValidEnd =
        range.from && (day > range.from || isSameDay(day, range.from));
      const newRange = {
        from: range.from,
        to: isValidEnd ? day : range.from, // 역전 방지
      };
      setRange(newRange);
      onChange?.(newRange);
      onChangeComplete?.(newRange);
      setIsPickingEndDate(false);
      setOpen(false);
    }
  };

  const handleReset = () => {
    setRange({ from: undefined, to: undefined });
    setIsPickingEndDate(false);
    onChange?.({ from: undefined, to: undefined });
  };

  let displayDate = '날짜 선택';
  if (range.from && range.to) {
    displayDate = isSameDay(range.from, range.to)
      ? format(range.from, 'PPP', { locale: ko })
      : `${format(range.from, 'PPP', { locale: ko })} - ${format(range.to, 'PPP', { locale: ko })}`;
  } else if (range.from) {
    displayDate = format(range.from, 'PPP', { locale: ko });
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
              !range.from && 'text-muted-foreground',
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
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-muted-foreground ml-1 py-2 text-sm">
              {isPickingEndDate ? '종료일 선택' : '시작일 선택'}
            </span>
            {(range.from || range.to) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleReset}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Calendar
            mode="single"
            selected={undefined}
            onDayClick={handleDayClick}
            defaultMonth={range.from ?? new Date()}
            locale={ko}
            numberOfMonths={1}
            initialFocus
            modifiers={{
              ...(range.from && { range_start: range.from }),
              ...(range.to && { range_end: range.to }),
              ...(range.from &&
                range.to &&
                +range.from !== +range.to && {
                  range_middle: {
                    from: addDays(range.from, 1),
                    to: addDays(range.to, -1),
                  },
                }),
            }}
            modifiersClassNames={{
              range_start: 'bg-primary text-white',
              range_end: 'bg-primary text-white',
              range_middle: 'bg-muted text-foreground rounded-none',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
