'use client';

interface BasicInfo {
  ministry: string;
  specializedAgency: string;
  announcementNumber: string;
  announcementStartDate: string;
  announcementEndDate: string;
  threeFiveRule: boolean;
  [key: string]: unknown;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-medium text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InputRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-xs text-gray-600">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="rounded border px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface BasicSectionProps {
  isEditMode: boolean;
  editData: BasicInfo;
  setEditData: (data: BasicInfo) => void;
  taskInfo: BasicInfo | null;
}

export default function BasicSection({
  isEditMode,
  editData,
  setEditData,
  taskInfo,
}: BasicSectionProps) {
  const info = taskInfo || {
    ministry: '',
    specializedAgency: '',
    announcementNumber: '',
    announcementStartDate: '',
    announcementEndDate: '',
    threeFiveRule: false,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">기본 정보</h3>

      {!isEditMode ? (
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-gray-800">
          <InfoRow label="소관부처" value={info.ministry || '-'} />
          <InfoRow label="전문기관" value={info.specializedAgency || '-'} />
          <InfoRow label="공고번호" value={info.announcementNumber || '-'} />
          <InfoRow
            label="공고기간"
            value={`${info.announcementStartDate || '-'} ~ ${
              info.announcementEndDate || '-'
            }`}
          />
          <InfoRow
            label="3책5공"
            value={info.threeFiveRule ? '포함' : '미포함'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-gray-800">
          <InputRow
            id="ministry"
            label="소관부처"
            value={editData.ministry || ''}
            onChange={(v) => setEditData({ ...editData, ministry: v })}
          />
          <InputRow
            id="specializedAgency"
            label="전문기관"
            value={editData.specializedAgency || ''}
            onChange={(v) => setEditData({ ...editData, specializedAgency: v })}
          />
          <InputRow
            id="announcementNumber"
            label="공고번호"
            value={editData.announcementNumber || ''}
            onChange={(v) =>
              setEditData({ ...editData, announcementNumber: v })
            }
          />

          <div className="col-span-2 flex flex-col">
            <label
              htmlFor="announcementStartDate"
              className="mb-1 text-xs text-gray-600"
            >
              공고기간
            </label>
            <div className="flex gap-2">
              <input
                id="announcementStartDate"
                type="date"
                className="w-full rounded border px-2 py-1 text-sm"
                value={editData.announcementStartDate || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    announcementStartDate: e.target.value,
                  })
                }
              />
              <input
                id="announcementEndDate"
                type="date"
                className="w-full rounded border px-2 py-1 text-sm"
                value={editData.announcementEndDate || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    announcementEndDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="threeFiveRule"
              className="mb-1 text-xs text-gray-600"
            >
              3책5공
            </label>
            <select
              id="threeFiveRule"
              className="rounded border px-2 py-1 text-sm"
              value={editData.threeFiveRule ? 'true' : 'false'}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  threeFiveRule: e.target.value === 'true',
                })
              }
            >
              <option value="true">포함</option>
              <option value="false">미포함</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
