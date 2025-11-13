'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Search } from 'lucide-react'

export default function ResearchProjectsTab() {
  const pathname = usePathname()
  const taskId = Number(pathname.split('/').filter(Boolean).pop())
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

  const [projects, setProjects] = useState<{ id: number; title: string; startDate?: string; endDate?: string }[]>([])
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<{ projectId: number; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const getAuthToken = () => {
    const authRaw = localStorage.getItem('auth-storage')
    return authRaw ? JSON.parse(authRaw)?.state?.accessToken : null
  }

  const fetchTaskProjects = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) return
      const res = await fetch(`${API_BASE}/tasks/${taskId}/projects?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return setProjects([])
      const text = await res.text()
      if (!text) return setProjects([])
      const data = JSON.parse(text)
      setProjects(data)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSearchProjects = async (keyword = '') => {
    try {
      setSearchLoading(true)
      const token = getAuthToken()
      if (!token) return
      const url = keyword
        ? `${API_BASE}/projects/search?all=true&keyword=${encodeURIComponent(keyword)}`
        : `${API_BASE}/projects/search?all=true`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return setSearchResults([])
      const text = await res.text()
      if (!text) return setSearchResults([])
      const data = JSON.parse(text)
      setSearchResults(data.projects || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddProject = async (projectId: number) => {
    try {
      const token = getAuthToken()
      if (!token) return
      const res = await fetch(`${API_BASE}/tasks/${taskId}/projects/${projectId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) return alert('연구 프로젝트 추가 실패')
      alert('연구 프로젝트가 추가되었습니다.')
      setIsResearchModalOpen(false)
      setSearchKeyword('')
      await fetchTaskProjects()
    } catch {
      alert('추가 실패')
    }
  }

  useEffect(() => {
    if (!isResearchModalOpen) return
    const t = setTimeout(() => fetchSearchProjects(searchKeyword), 400)
    return () => clearTimeout(t)
  }, [searchKeyword, isResearchModalOpen])

  useEffect(() => {
    if (isResearchModalOpen) fetchSearchProjects()
  }, [isResearchModalOpen])

  useEffect(() => {
    fetchTaskProjects()
  }, [taskId])

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">관련 연구 과제</h3>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setIsResearchModalOpen(true)}
          >
            프로젝트 추가
          </Button>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-6">연구 과제를 불러오는 중입니다...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500 text-center py-6">관련된 연구 과제가 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{p.title}</div>
                  {p.startDate && (
                    <div className="text-sm text-gray-500">
                      {p.startDate} ~ {p.endDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isResearchModalOpen && (
        <div className="fixed inset-0 bg-neutral-100/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md w-full max-w-2xl h-[80vh] flex flex-col border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">연구 프로젝트 추가</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsResearchModalOpen(false)
                    setSearchKeyword('')
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="연구과제명 또는 연구과제번호로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {searchLoading ? (
                  <div className="text-center py-8 text-gray-500">검색 중입니다...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <div
                      key={p.projectId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleAddProject(p.projectId)}
                    >
                      <div className="truncate max-w-[80%]">
                        <div className="font-medium text-gray-900 truncate">{p.title}</div>
                      </div>
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        추가
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">조회된 프로젝트가 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
