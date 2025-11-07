"use client"
import { Badge } from "@/components/ui/badge"

export default function ConferencesTab({ conferences }: { conferences?: any[] }) {
  const data =
    conferences ||
    [
      {
        id: 1,
        title: "AI-Powered Diagnostic System for Early Disease Detection",
        conferenceName: "International Conference on Medical AI 2024",
        date: "2024-05-15",
        presenters: ["Kim, J.", "Park, M."],
        notes: "Best Paper Award",
      },
    ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">학회 발표</h3>
      <div className="space-y-4">
        {data.map((conf) => (
          <div key={conf.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-900 mb-2">{conf.title}</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">학회명:</span> {conf.conferenceName}
              </div>
              <div>
                <span className="font-medium">발표일:</span> {conf.date}
              </div>
              <div>
                <span className="font-medium">발표자:</span> {conf.presenters.join(", ")}
              </div>
              {conf.notes && (
                <div className="mt-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{conf.notes}</Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
