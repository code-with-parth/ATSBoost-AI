import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalysisDetail } from '@/lib/dashboard'
import { HistoryDetailView } from '@/components/history-detail'
import { HistoryDetailSkeleton } from '@/components/history-detail-skeleton'

interface HistoryDetailPageProps {
  params: { id: string }
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  try {
    const analysis = await getAnalysisDetail(user.id, params.id)

    if (!analysis) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Not Found</h1>
            <p className="mt-2 text-gray-600">The requested analysis could not be found</p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">This analysis doesn't exist or you don't have permission to view it.</p>
            <a 
              href="/dashboard/history"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to History
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <HistoryDetailView analysis={analysis} />
      </div>
    )
  } catch (error) {
    console.error('History detail page error:', error)
    
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Loading Analysis</h1>
          <p className="mt-2 text-gray-600">Unable to load analysis details</p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">There was an error loading this analysis.</p>
          <a 
            href="/dashboard/history"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to History
          </a>
        </div>
      </div>
    )
  }
}