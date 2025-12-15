import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const sig = request.headers.get('stripe-signature')
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const body = await request.text()
    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook signature verification failed'
      console.error('Webhook signature verification failed:', message)
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'
    console.error('Webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: any) {
  const supabase = createClient()
  const customerId = subscription.customer
  const subscriptionId = subscription.id

  // Get user by stripe customer ID
  const { data: subscriptions, error: queryError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (queryError) {
    console.error('Failed to find subscription:', queryError.message)
    return
  }

  const userId = subscriptions.user_id

  // Determine plan from subscription items
  const plan = subscription.items.data.length > 0 ? 'pro' : 'free'

  // Update subscription record
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscriptionId,
      plan,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update subscription:', updateError.message)
  } else {
    console.log(`Subscription updated for user ${userId}`)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const supabase = createClient()
  const customerId = subscription.customer

  // Get user by stripe customer ID
  const { data: subscriptions, error: queryError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (queryError) {
    console.error('Failed to find subscription:', queryError.message)
    return
  }

  const userId = subscriptions.user_id

  // Reset subscription to free
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update subscription:', updateError.message)
  } else {
    console.log(`Subscription canceled for user ${userId}`)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  // Payment succeeded - subscription is now active
  if (invoice.subscription) {
    const supabase = createClient()
    const customerId = invoice.customer

    const { data: subscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (queryError) {
      console.error('Failed to find subscription:', queryError.message)
      return
    }

    const userId = subscriptions.user_id

    // Update status to active
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update subscription status:', updateError.message)
    } else {
      console.log(`Payment succeeded for user ${userId}`)
    }
  }
}
