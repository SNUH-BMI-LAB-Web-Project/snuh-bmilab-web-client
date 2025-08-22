import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Coffee, Plane } from 'lucide-react';
import { LeaveStatCard } from '@/components/common/leaves-stat-card';

interface LeaveOverviewProps {
  annualLeaveCount?: number;
  usedLeaveCount?: number;
}

export function LeaveOverview({
  annualLeaveCount = 0,
  usedLeaveCount = 0,
}: LeaveOverviewProps) {
  const remainingLeave = annualLeaveCount - usedLeaveCount;
  const usedRate =
    annualLeaveCount > 0
      ? Math.round((usedLeaveCount / annualLeaveCount) * 100)
      : 0;

  return (
    <Card className="border bg-white shadow-none">
      <CardContent className="p-8">
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <LeaveStatCard
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            value={annualLeaveCount}
            label="연간 연차"
            colorScheme="blue"
          />
          <LeaveStatCard
            icon={<Plane className="h-6 w-6 text-red-600" />}
            value={usedLeaveCount}
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
