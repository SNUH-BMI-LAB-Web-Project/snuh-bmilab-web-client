'use client';

import { Input } from '@/components/ui/input';

interface Props {
  isEditMode: boolean;
  // ✅ 이제 evaluation은 editData.presentation 그 자체가 들어옵니다.
  evaluation: {
    presenter?: string;
    attendees?: string;
    presentationLocation?: string;
    attendeeLimit?: number | string;
    presentationDate?: string; // ISO or 'YYYY-MM-DDTHH:mm:ss'
  };
  setEditData?: (updater: any) => void;
}

export default function PresentationEvaluationSection({
  isEditMode,
  evaluation,
  setEditData,
}: Props) {
  const readModeClass = !isEditMode
    ? 'text-gray-900 pointer-events-none bg-white'
    : '';

  // ✅ 날짜/시간 파생값 (표시용)
  const datePart = evaluation.presentationDate
    ? evaluation.presentationDate.split('T')[0]
    : '';
  const timePart = evaluation.presentationDate
    ? (evaluation.presentationDate.split('T')[1]?.slice(0, 5) ?? '')
    : '';

  const update = (key: string, value: any) => {
    setEditData?.((prev: any) => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        [key]: value,
      },
    }));
  };

  const updateDate = (newDate: string) => {
    const t = timePart || '00:00';
    update('presentationDate', newDate ? `${newDate}T${t}:00` : '');
  };

  const updateTime = (newTime: string) => {
    const d = datePart || '1970-01-01';
    update(
      'presentationDate',
      newTime ? `${d}T${newTime}:00` : datePart ? `${datePart}T00:00:00` : '',
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        발표 평가 관련 정보
      </h3>

      <div className="grid grid-cols-2 gap-x-16 gap-y-6">
        {/* 발표 평가 일자 */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            발표 평가 일자
          </div>
          <Input
            type="date"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={datePart}
            onChange={(e) => updateDate(e.target.value)}
          />
        </div>

        {/* 발표 평가 시간 */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            발표 평가 시간
          </div>
          <Input
            type="time"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={timePart}
            onChange={(e) => updateTime(e.target.value)}
          />
        </div>

        {/* 발표자 이름 */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            발표자 이름
          </div>
          <Input
            type="text"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={evaluation.presenter ?? ''}
            onChange={(e) => update('presenter', e.target.value)}
          />
        </div>

        {/* 배석 가능 인원 */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            배석 가능 인원
          </div>
          <Input
            type="number"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={String(evaluation.attendeeLimit ?? '')}
            onChange={(e) => update('attendeeLimit', e.target.value)}
          />
        </div>

        {/* 실제 배석자 명단 */}
        <div className="col-span-2">
          <div className="mb-2 text-sm font-medium text-blue-600">
            실제 배석자 명단
          </div>
          <textarea
            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${readModeClass}`}
            rows={3}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={evaluation.attendees ?? ''}
            onChange={(e) => update('attendees', e.target.value)}
          />
        </div>

        {/* 발표 평가장 위치 */}
        <div className="col-span-2">
          <div className="mb-2 text-sm font-medium text-blue-600">
            발표 평가장 위치
          </div>
          <Input
            type="text"
            className={readModeClass}
            readOnly={!isEditMode}
            tabIndex={!isEditMode ? -1 : 0}
            value={evaluation.presentationLocation ?? ''}
            onChange={(e) => update('presentationLocation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
