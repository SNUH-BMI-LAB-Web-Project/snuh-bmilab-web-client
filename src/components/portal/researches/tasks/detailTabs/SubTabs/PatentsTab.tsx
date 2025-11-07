"use client"
import { Badge } from "@/components/ui/badge"

export default function PatentsTab({ patents }: { patents?: any[] }) {
  const data =
    patents ||
    [
      {
        id: 1,
        name: "의료영상 분석을 위한 인공지능 시스템",
        applicationNumber: "10-2024-0001234",
        applicationDate: "2024-01-15",
        inventors: ["김철수", "이영희", "박민수"],
        notes: "출원 중",
      },
    ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">특허</h3>
      <div className="space-y-4">
        {data.map((patent) => (
          <div key={patent.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-900 mb-2">{patent.name}</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">출원번호:</span> {patent.applicationNumber}
              </div>
              <div>
                <span className="font-medium">출원일:</span> {patent.applicationDate}
              </div>
              <div>
                <span className="font-medium">발명자:</span> {patent.inventors.join(", ")}
              </div>
              {patent.notes && (
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{patent.notes}</Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
