import { createClient } from '@/lib/supabase/server'
import { STRIPE_PRICING } from '@/lib/stripe'

export interface QuotaInfo {
  planType: 'free' | 'pro'
  monthlyLimit: number
  used: number
  remaining: number
  isLimited: boolean
  canAnalyze: boolean
}

export async function checkUserQuota(userId: string): Promise<QuotaInfo> {
  const supabase = createClient()

  // Get user subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch subscription: ${subError.message}`)
  }

  const planType = (subscription?.plan || 'free') as 'free' | 'pro'
  const monthlyLimit =
    planType === 'free'
      ? STRIPE_PRICING.FREE.monthlyAnalyses
      : STRIPE_PRICING.PRO.monthlyAnalyses

  // Free tier has unlimited quota for Pro
  if (monthlyLimit === Infinity) {
    return {
      planType,
      monthlyLimit,
      used: 0,
      remaining: Infinity,
      isLimited: false,
      canAnalyze: true,
    }
  }

  // Count analyses in rolling month window
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: analyses, error: analysesError } = await supabase
    .from('analyses')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (analysesError) {
    throw new Error(`Failed to fetch analyses: ${analysesError.message}`)
  }

  const used = analyses?.length || 0
  const remaining = Math.max(0, monthlyLimit - used)

  return {
    planType,
    monthlyLimit,
    used,
    remaining,
    isLimited: monthlyLimit !== Infinity,
    canAnalyze: remaining > 0,
  }
}

export async function enforceQuota(userId: string): Promise<void> {
  const quota = await checkUserQuota(userId)

  if (!quota.canAnalyze) {
    throw new Error(
      `You have reached your monthly limit of ${quota.monthlyLimit} analyses. Please upgrade to Pro for unlimited analyses.`
    )
  }
}
