import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryList } from '@/components/history-list'
import { HistoryListSkeleton } from '@/components/history-skeleton'
import { HistoryEmptyState } from '@/components/empty-states'
import { getAnalysisHistory } from '@/lib/dashboard'

interface HistoryPageProps {
  searchParams: { page?: string }
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const currentPage = parseInt(searchParams.page || '1', 10)
  const pageSize = 10

  try {
    const { analyses, pagination } = await getAnalysisHistory(user.id, currentPage, pageSize)

    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your resume optimization history
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<HistoryListSkeleton />}>
          {analyses.length === 0 ? (
            <HistoryEmptyState />
          ) : (
            <HistoryList 
              analyses={analyses}
              pagination={pagination}
              currentPage={currentPage}
            />
          )}
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('History page error:', error)
    
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-gray-600">Unable to load history</p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">There was an error loading your analysis history.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
}