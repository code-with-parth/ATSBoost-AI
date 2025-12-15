import { createClient } from './supabase/server'
import { getCachedOrFetch, cacheKeys } from './cache'

export interface DashboardMetrics {
  totalResumes: number
  totalAnalyses: number
  thisMonthAnalyses: number
  profileViews: number
  averageAtsScore: number
  recentActivity: ActivityItem[]
  usageData: {
    thisMonthUsage: number
    monthlyLimit: number
    percentage: number
  }
  planInfo: {
    planType: string
    features: any
  }
}

export interface ActivityItem {
  id: string
  type: 'resume_boost' | 'profile_view' | 'analysis_completed'
  title: string
  description: string
  timestamp: string
  metadata?: any
}

export interface AnalysisHistory {
  id: string
  resumeId: string
  jobDescription: string
  status: 'pending' | 'completed' | 'failed'
  atsScore: number | null
  createdAt: string
  updatedAt: string
  result?: any
  optimizedResumeText?: string
  coverLetter?: string
  resume?: {
    originalFilename: string
    mimeType: string
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const cacheKey = cacheKeys.dashboardMetrics(userId)
  
  return getCachedOrFetch(cacheKey, async () => {
    const supabase = createClient()

    try {
      // Get basic counts and metrics
      const [resumesResult, analysesResult, usageResult, planResult] = await Promise.all([
        supabase
          .from('resumes')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase
          .from('analyses')
          .select('id, ats_score, created_at', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase
          .from('usage_tracking')
          .select('id, action_type, metadata, created_at', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase
          .from('plans')
          .select('plan_type, features')
          .eq('user_id', userId)
          .single()
      ])

      const totalResumes = resumesResult.count || 0
      const allAnalyses = analysesResult.data || []
      const totalAnalyses = allAnalyses.length
      
      // Calculate this month's analyses
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      
      const thisMonthAnalyses = allAnalyses.filter(
        analysis => new Date(analysis.created_at) >= currentMonth
      ).length

      // Calculate average ATS score
      const completedAnalyses = allAnalyses.filter(a => a.ats_score !== null)
      const averageAtsScore = completedAnalyses.length > 0 
        ? Math.round(completedAnalyses.reduce((sum, a) => sum + (a.ats_score || 0), 0) / completedAnalyses.length)
        : 0

      // Get profile views from usage tracking
      const profileViews = (usageResult.data || []).filter(
        item => item.action_type === 'profile_view'
      ).length

      // Process recent activity
      const recentActivity: ActivityItem[] = [
        ...(usageResult.data || [])
          .filter(item => item.action_type === 'profile_view')
          .slice(0, 3)
          .map(item => ({
            id: item.id,
            type: 'profile_view' as const,
            title: 'Profile viewed',
            description: `Profile viewed ${getRelativeTime(item.created_at)}`,
            timestamp: item.created_at,
            metadata: item.metadata
          })),
        ...allAnalyses
          .filter(analysis => analysis.status === 'completed')
          .slice(0, 3)
          .map(analysis => ({
            id: analysis.id,
            type: 'analysis_completed' as const,
            title: 'Resume analysis completed',
            description: `Analysis completed ${getRelativeTime(analysis.created_at)}`,
            timestamp: analysis.created_at,
            metadata: { ats_score: analysis.ats_score }
          }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

      // Get plan information
      const planInfo = {
        planType: planResult.data?.plan_type || 'free',
        features: planResult.data?.features || {}
      }

      // Calculate usage data
      const monthlyLimits = {
        free: 5,
        pro: 25,
        enterprise: 100
      }
      
      const monthlyLimit = monthlyLimits[planInfo.planType as keyof typeof monthlyLimits] || 5
      const usagePercentage = (thisMonthAnalyses / monthlyLimit) * 100

      return {
        totalResumes,
        totalAnalyses,
        thisMonthAnalyses,
        profileViews,
        averageAtsScore,
        recentActivity,
        usageData: {
          thisMonthUsage: thisMonthAnalyses,
          monthlyLimit,
          percentage: Math.min(usagePercentage, 100)
        },
        planInfo
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw new Error('Failed to load dashboard metrics')
    }
  }, 2 * 60 * 1000) // Cache for 2 minutes
}

export async function getAnalysisHistory(
  userId: string, 
  page = 1, 
  limit = 10
): Promise<{ analyses: AnalysisHistory[]; pagination: PaginationInfo }> {
  const cacheKey = cacheKeys.analysisHistory(userId, page)
  
  return getCachedOrFetch(cacheKey, async () => {
    const supabase = createClient()
    
    try {
      // Get total count
      const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get paginated analyses with resume info
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          resume_id,
          job_description,
          status,
          ats_score,
          created_at,
          updated_at,
          result,
          optimized_resume_text,
          cover_letter,
          resumes!inner (
            original_filename,
            mime_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      const analyses: AnalysisHistory[] = (data || []).map(item => ({
        id: item.id,
        resumeId: item.resume_id,
        jobDescription: item.job_description,
        status: item.status,
        atsScore: item.ats_score,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        result: item.result,
        optimizedResumeText: item.optimized_resume_text,
        coverLetter: item.cover_letter,
        resume: {
          originalFilename: item.resumes.original_filename,
          mimeType: item.resumes.mime_type
        }
      }))

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        analyses,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error)
      throw new Error('Failed to load analysis history')
    }
  }, 3 * 60 * 1000) // Cache for 3 minutes
}

export async function getAnalysisDetail(
  userId: string,
  analysisId: string
): Promise<AnalysisHistory | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        resume_id,
        job_description,
        status,
        ats_score,
        created_at,
        updated_at,
        result,
        optimized_resume_text,
        cover_letter,
        resumes!inner (
          id,
          original_filename,
          mime_type,
          storage_path
        )
      `)
      .eq('user_id', userId)
      .eq('id', analysisId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }

    return {
      id: data.id,
      resumeId: data.resume_id,
      jobDescription: data.job_description,
      status: data.status,
      atsScore: data.ats_score,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      result: data.result,
      optimizedResumeText: data.optimized_resume_text,
      coverLetter: data.cover_letter,
      resume: {
        originalFilename: data.resumes.original_filename,
        mimeType: data.resumes.mime_type
      }
    }
  } catch (error) {
    console.error('Error fetching analysis detail:', error)
    throw new Error('Failed to load analysis detail')
  }
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) return 'just now'
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
}