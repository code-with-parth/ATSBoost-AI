'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuotaInfo {
  planType: 'free' | 'pro'
  monthlyLimit: number
  used: number
  remaining: number
  isLimited: boolean
  canAnalyze: boolean
}

export function QuotaDisplay() {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await fetch('/api/quota')
        if (!response.ok) {
          throw new Error('Failed to fetch quota')
        }
        const data = await response.json()
        setQuota(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error fetching quota'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuota()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Monthly Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (error || !quota) {
    return null
  }

  return (
    <Card
      className={`${
        !quota.canAnalyze && quota.isLimited
          ? 'border-orange-200 bg-orange-50'
          : 'bg-gray-50'
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {quota.planType === 'pro' ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <Zap className="h-5 w-5 text-blue-500" />
            )}
            <CardTitle>Monthly Usage</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={
              quota.planType === 'pro'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }
          >
            {quota.planType.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          Analyses in the current rolling 30-day window
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {quota.used} / {quota.monthlyLimit === Infinity ? '∞' : quota.monthlyLimit}
            </span>
            <span className="text-sm text-gray-600">
              {quota.isLimited ? `${quota.remaining} remaining` : 'Unlimited'}
            </span>
          </div>
          {quota.isLimited && (
            <Progress
              value={(quota.used / quota.monthlyLimit) * 100}
              className="h-2"
            />
          )}
          {!quota.isLimited && (
            <div className="h-2 bg-green-100 rounded-full" />
          )}
        </div>

        {!quota.canAnalyze && quota.isLimited && (
          <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                You've reached your monthly limit
              </p>
              <p className="text-sm text-orange-800 mt-1">
                Upgrade to Pro for unlimited analyses
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2 bg-orange-600 hover:bg-orange-700"
              >
                <Link href="/dashboard/billing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
