import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Separator } from './separator'
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Eye, 
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { AnalysisHistory } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

interface HistoryDetailViewProps {
  analysis: AnalysisHistory
}

export function HistoryDetailView({ analysis }: HistoryDetailViewProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const handleDownload = async (type: 'resume' | 'cover' | 'original') => {
    setDownloading(type)
    try {
      // TODO: Implement actual download functionality
      // This would make a request to an API endpoint to generate and download files
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      console.log(`Download ${type} for analysis ${analysis.id}`)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(null)
    }
  }

  const handleCopyJobDescription = async () => {
    try {
      await navigator.clipboard.writeText(analysis.jobDescription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDuplicateAnalysis = async () => {
    try {
      await navigator.clipboard.writeText(analysis.jobDescription)
      // Navigate to analyze page with job description pre-filled
      window.location.href = '/dashboard/analyze'
    } catch (err) {
      console.error('Failed to duplicate:', err)
    }
  }

  const getAtsScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAtsScoreBadgeColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/history">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Details</h1>
        <p className="mt-2 text-gray-600">
          Review your resume optimization results and download optimized files
        </p>
      </div>

      {/* Status and Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {analysis.resume?.originalFilename}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(analysis.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {analysis.resume?.originalFilename}
                </span>
              </CardDescription>
            </div>
            <Badge className={cn("flex items-center gap-2 text-sm px-3 py-1", getStatusColor(analysis.status))}>
              {getStatusIcon(analysis.status)}
              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyJobDescription}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {analysis.jobDescription}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Results (if completed) */}
          {analysis.status === 'completed' && analysis.result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Optimization Summary</h4>
                  <p className="text-sm text-blue-800">
                    Your resume has been optimized for this specific job description. 
                    Key improvements include better keyword alignment, improved ATS compatibility, 
                    and enhanced formatting.
                  </p>
                </div>
                
                {/* ATS Score Display */}
                {analysis.atsScore && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-600 mb-1">ATS Compatibility Score</div>
                    <div className={cn("text-4xl font-bold", getAtsScoreColor(analysis.atsScore))}>
                      {analysis.atsScore}%
                    </div>
                    <Badge className={cn("mt-2", getAtsScoreBadgeColor(analysis.atsScore))}>
                      {analysis.atsScore >= 80 ? 'Excellent' : 
                       analysis.atsScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                )}

                {/* Results breakdown could go here */}
                {analysis.result && typeof analysis.result === 'object' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Key Improvements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Enhanced keyword density for ATS parsing</li>
                      <li>• Improved section structure and formatting</li>
                      <li>• Better quantified achievements and impact</li>
                      <li>• Optimized for target job requirements</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Message (if failed) */}
          {analysis.status === 'failed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Analysis Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    The analysis could not be completed. This might be due to file format issues, 
                    corrupted content, or temporary service unavailability.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Message */}
          {analysis.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-5 w-5" />
                  Analysis in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Your resume is currently being analyzed. This usually takes 2-5 minutes.
                    We'll notify you when it's complete.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleDuplicateAnalysis}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Job Description
              </Button>
              
              <Link href="/dashboard/analyze" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
              
              <Link href="/dashboard/history" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View All History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle>Downloads</CardTitle>
              <CardDescription>
                Get your optimized files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.status === 'completed' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownload('resume')}
                    disabled={downloading === 'resume'}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading === 'resume' ? 'Preparing...' : 'Optimized Resume'}
                  </Button>
                  
                  {analysis.coverLetter && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleDownload('cover')}
                      disabled={downloading === 'cover'}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {downloading === 'cover' ? 'Preparing...' : 'Cover Letter'}
                    </Button>
                  )}
                </>
              )}
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleDownload('original')}
                disabled={downloading === 'original'}
              >
                <FileText className="h-4 w-4 mr-2" />
                {downloading === 'original' ? 'Preparing...' : 'Original Resume'}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Info */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {analysis.atsScore && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ATS Score:</span>
                  <span className={cn("font-medium", getAtsScoreColor(analysis.atsScore))}>
                    {analysis.atsScore}%
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(analysis.status)} variant="secondary">
                  {analysis.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}