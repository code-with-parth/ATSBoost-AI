import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { checkUserQuota, type QuotaInfo } from '@/lib/quota'
import { STRIPE_PRICING } from '@/lib/stripe'
import { Crown, Zap, Check } from 'lucide-react'
import { PlanButton, CustomerPortalButton } from '@/components/billing-buttons'

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get subscription info
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch subscription: ${subError.message}`)
  }

  const currentPlan = subscription?.plan || 'free'
  const subscriptionStatus = subscription?.status || 'active'
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null

  // Get quota info
  const quota = await checkUserQuota(user.id)

  const plans = [
    {
      name: STRIPE_PRICING.FREE.name,
      type: 'free' as const,
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        `${STRIPE_PRICING.FREE.monthlyAnalyses} analyses per month`,
        'Basic resume optimization',
        'PDF download',
      ],
      cta: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
      highlighted: false,
    },
    {
      name: STRIPE_PRICING.PRO.name,
      type: 'pro' as const,
      price: `$${STRIPE_PRICING.PRO.price}`,
      period: '/month',
      description: 'For serious job seekers',
      features: [
        'Unlimited analyses',
        'Advanced resume optimization',
        'Priority support',
        'All Free features',
      ],
      cta: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade',
      highlighted: true,
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and view your usage
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your current plan and subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {currentPlan === 'pro' ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Zap className="h-5 w-5 text-blue-500" />
                )}
                <span className="font-semibold">Plan:</span>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentPlan.toUpperCase()}
              </Badge>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Status</div>
              <Badge
                variant="outline"
                className={
                  subscriptionStatus === 'active'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }
              >
                {subscriptionStatus.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>

            {currentPeriodEnd && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Renews On</div>
                <span className="text-lg font-semibold">
                  {currentPeriodEnd.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage</CardTitle>
          <CardDescription>Your resume analyses for the current month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Analyses Used: {quota.used} / {quota.monthlyLimit === Infinity ? '∞' : quota.monthlyLimit}
              </span>
              <span className="text-sm text-gray-600">
                {quota.monthlyLimit === Infinity
                  ? 'Unlimited'
                  : `${quota.remaining} remaining`}
              </span>
            </div>
            {quota.isLimited && (
              <Progress value={(quota.used / quota.monthlyLimit) * 100} className="h-2" />
            )}
            {!quota.isLimited && (
              <div className="h-2 bg-green-100 rounded-full" />
            )}
          </div>

          {!quota.canAnalyze && currentPlan === 'free' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                You've reached your monthly limit. Upgrade to Pro for unlimited analyses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.type}
              className={`relative ${plan.highlighted ? 'border-2 border-blue-500 shadow-lg' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-blue-500">RECOMMENDED</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.type === 'pro' ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-blue-500" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg text-gray-600 font-normal">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <PlanButton plan={plan.type} currentPlan={currentPlan} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Subscription</CardTitle>
          <CardDescription>
            Update payment methods, invoices, and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerPortalButton />
        </CardContent>
      </Card>
    </div>
  )
}
