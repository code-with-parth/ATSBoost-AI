import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCustomerPortalUrl } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 404 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const returnUrl = `${origin}/dashboard/billing`

    const portalUrl = await getCustomerPortalUrl(subscription.stripe_customer_id, returnUrl)

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Portal URL creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
