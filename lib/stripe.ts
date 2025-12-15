import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const STRIPE_PRICING = {
  FREE: {
    name: 'Free',
    monthlyAnalyses: 2,
    price: 0,
  },
  PRO: {
    name: 'Pro',
    monthlyAnalyses: Infinity,
    price: 29,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: 'auto',
  })

  return session
}

export async function createOrRetrieveCustomer(customerId?: string, email?: string) {
  if (customerId) {
    return stripe.customers.retrieve(customerId)
  }

  if (!email) {
    throw new Error('Either customerId or email must be provided')
  }

  const customers = await stripe.customers.list({ email, limit: 1 })
  if (customers.data.length > 0) {
    return customers.data[0]
  }

  return stripe.customers.create({ email })
}

export async function getCustomerPortalUrl(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}
