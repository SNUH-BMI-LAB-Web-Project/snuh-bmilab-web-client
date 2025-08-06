import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LeaveStatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  colorScheme: 'blue' | 'red' | 'green';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    textMain: 'text-blue-900',
    textSub: 'text-blue-600',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    textMain: 'text-red-900',
    textSub: 'text-red-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
    textMain: 'text-green-900',
    textSub: 'text-green-600',
  },
};

export function LeaveStatCard({
  icon,
  value,
  label,
  colorScheme,
}: LeaveStatCardProps) {
  const colors = colorMap[colorScheme];

  return (
    <div
      className={cn(
        'rounded-xl p-6 text-center',
        colors.bg,
        colors.border,
        'border',
      )}
    >
      <div
        className={cn(
          'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full',
          colors.iconBg,
        )}
      >
        {icon}
      </div>
      <p className={cn('text-2xl font-bold', colors.textMain)}>{value}</p>
      <p className={cn('text-sm font-medium', colors.textSub)}>{label}</p>
    </div>
  );
}
