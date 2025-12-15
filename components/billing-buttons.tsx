'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PlanButton({ plan, currentPlan }: { plan: 'free' | 'pro'; currentPlan: string }) {
  if (plan === currentPlan) {
    return (
      <Button disabled className="w-full">
        Current Plan
      </Button>
    )
  }

  if (plan === 'pro') {
    return <CheckoutButton />
  }

  return <DowngradeButton />
}

function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Checkout failed')
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? 'Loading...' : 'Upgrade to Pro'}
    </Button>
  )
}

function DowngradeButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Portal redirect failed')
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Portal redirect failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManage}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}

export function CustomerPortalButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenPortal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Portal redirect failed')
        return
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Portal redirect failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleOpenPortal}
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? 'Loading...' : 'Open Billing Portal'}
    </Button>
  )
}
