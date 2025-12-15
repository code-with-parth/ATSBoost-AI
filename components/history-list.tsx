import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Pagination, PaginationInfo } from './pagination'
import { 
  FileText, 
  Download, 
  Eye, 
  Copy, 
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react'
import { AnalysisHistory } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

interface HistoryListProps {
  analyses: AnalysisHistory[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  currentPage: number
}

export function HistoryList({ analyses, pagination, currentPage }: HistoryListProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'status'>('date')

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'all') return true
    return analysis.status === filter
  })

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'score':
        return (b.atsScore || 0) - (a.atsScore || 0)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (analysisId: string, type: 'resume' | 'cover') => {
    // TODO: Implement download functionality
    console.log(`Download ${type} for analysis ${analysisId}`)
  }

  const handleDuplicate = async (jobDescription: string) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate job description:', jobDescription)
    // Copy to clipboard or navigate to analyze page with pre-filled data
    try {
      await navigator.clipboard.writeText(jobDescription)
      // Show toast notification
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({pagination.total})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('failed')}
              >
                Failed
              </Button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'status')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      <div className="space-y-4">
        {sortedAnalyses.map((analysis) => (
          <Card key={analysis.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">
                    Resume Analysis - {analysis.resume?.originalFilename}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(analysis.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {analysis.resume?.originalFilename}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("flex items-center gap-1", getStatusColor(analysis.status))}>
                    {getStatusIcon(analysis.status)}
                    {analysis.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Job Description Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Job Description</h4>
                <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {analysis.jobDescription}
                  </p>
                </div>
              </div>

              {/* ATS Score */}
              {analysis.atsScore && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">ATS Score:</span>
                  <Badge variant="outline" className="font-mono">
                    {analysis.atsScore}%
                  </Badge>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={`/dashboard/history/${analysis.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Link>

                {analysis.status === 'completed' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(analysis.id, 'resume')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                    {analysis.coverLetter && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(analysis.id, 'cover')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Cover Letter
                      </Button>
                    )}
                  </>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDuplicate(analysis.jobDescription)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="space-y-4">
          <PaginationInfo
            currentPage={pagination.page}
            pageSize={pagination.limit}
            totalItems={pagination.total}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              const params = new URLSearchParams()
              params.set('page', page.toString())
              window.location.href = `/dashboard/history?${params.toString()}`
            }}
          />
        </div>
      )}
    </div>
  )
}