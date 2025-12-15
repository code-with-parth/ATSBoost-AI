import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createOrRetrieveCustomer, STRIPE_PRICING } from '@/lib/stripe'

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

    // Get or create subscription record
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await createOrRetrieveCustomer(undefined, user.email)
      customerId = customer.id

      // Save customer ID to subscriptions table
      const { error: insertError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'active',
      })

      if (insertError) {
        return NextResponse.json(
          { error: `Failed to save customer ID: ${insertError.message}` },
          { status: 500 }
        )
      }
    }

    let planType = 'pro'

    try {
      const bodyData = await request.json()
      planType = bodyData.plan || 'pro'
    } catch {
      // If body parsing fails, default to 'pro'
    }

    if (planType !== 'pro') {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const priceId = STRIPE_PRICING.PRO.stripePriceId
    if (!priceId) {
      return NextResponse.json(
        { error: 'Pro plan not configured. Please set STRIPE_PRO_PRICE_ID.' },
        { status: 500 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/dashboard/billing`

    const session = await createCheckoutSession(customerId, priceId, successUrl, cancelUrl)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout session creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
