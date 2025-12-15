# ATSBoost-AI

AI that customizes your resume for every job — and gets you shortlisted.

## Features

- **Email/Password Authentication** - Secure signup, login, and password reset
- **Protected Routes** - Middleware-protected dashboard and settings
- **Profile Management** - Update profile information and email
- **Session Management** - Persistent sessions with automatic refresh
- **Stripe Billing** - Free and Pro subscription plans with checkout and customer portal
- **Quota Enforcement** - Free tier (2 analyses/month), Pro (unlimited) with enforcement before AI processing
- **Billing Dashboard** - View plans, current usage, upgrade/downgrade options
- **Webhook Processing** - Automatic subscription state sync with Stripe
- **Usage Tracking** - Monitor account activity and limits
- **Responsive Design** - Mobile-first UI with modern components

## Tech Stack

- **Next.js 14** - App Router with Server Actions
- **Supabase** - Authentication and PostgreSQL database
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling with validation
- **Sonner** - Toast notifications
- **Stripe** - Payment processing and subscription management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file with your Supabase and Stripe credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Go to Developers → API Keys and copy your Secret Key and Publishable Key
3. Create a product called "Pro Plan" with a monthly price of $29
4. Copy the Price ID (starts with `price_`)
5. Go to Developers → Webhooks and create a new endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook` (update with your domain)
   - Events: Select `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
   - Copy the Webhook Secret
6. Add these values to your `.env.local` file

**For Vercel Deployment:**
1. Add the same environment variables to your Vercel project settings
2. Update the webhook URL to your production domain
3. Enable the webhook in Stripe dashboard

### 4. Database Setup

1. Create a new Supabase project
2. Run ALL SQL migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_resume_analysis.sql`
   - `supabase/migrations/003_subscriptions.sql`
3. Enable Row Level Security (RLS) policies as configured in the migrations

### 5. Authentication Configuration

In your Supabase dashboard:
1. Go to Authentication → Settings
2. Configure Site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs for email confirmation
4. Configure SMTP settings for email templates

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/
│   ├── auth/
│   │   ├── signup/         # User registration
│   │   ├── login/          # User authentication  
│   │   ├── reset-password/ # Password recovery
│   │   └── confirm/        # Email confirmation
│   ├── dashboard/          # Protected dashboard
│   ├── settings/           # Profile management
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── auth-provider.tsx  # Authentication context
│   ├── user-provider.tsx  # User data context
│   └── dashboard-nav.tsx  # Navigation component
├── lib/
│   └── supabase/          # Supabase client/server setup
└── supabase/
    └── migrations/        # Database schema
```

## Database Schema

The application uses the following main tables with RLS policies:

- **profiles** - User profile information
- **plans** - User's current plan (legacy, see subscriptions table)
- **usage_tracking** - Track user activity and limits
- **subscriptions** - Stripe subscription data and plan status
- **resumes** - Uploaded resume files with extracted text
- **analyses** - Analysis results with ATS scores and optimizations

## Key Features Implemented

✅ **User Registration** - Email/password signup with validation
✅ **Email Confirmation** - Supabase handles confirmation emails
✅ **User Authentication** - Secure login with session management
✅ **Password Reset** - Email-based password recovery
✅ **Protected Routes** - Middleware guards dashboard/settings
✅ **Session Persistence** - Automatic session refresh
✅ **Profile Management** - Update user information
✅ **Stripe Integration** - Checkout sessions and customer portal
✅ **Subscription Management** - Create/update/cancel subscriptions
✅ **Webhook Processing** - Automatic sync with Stripe events
✅ **Quota Enforcement** - Free tier (2/month), Pro (unlimited) with checks
✅ **Billing Dashboard** - Plans, usage, upgrade/downgrade options
✅ **Resume Analysis** - AI-powered resume optimization
✅ **History Tracking** - Full analysis history with filters and details
✅ **Usage Tracking** - Monitor account activity and limits
✅ **Responsive UI** - Mobile-first design
✅ **Error Handling** - Comprehensive error states and toasts
✅ **Loading States** - Proper loading indicators
✅ **Redirects** - Automatic redirects after auth actions

## Authentication Flow

1. **Signup**: User registers → Email confirmation → Dashboard access
2. **Login**: User logs in → Session created → Redirect to dashboard  
3. **Password Reset**: Request reset → Email link → Update password → Login
4. **Session**: Automatic refresh → Protected route access

## Billing & Subscription Flow

1. **Free Plan**: User signs up → Default free plan (2 analyses/month)
2. **Upgrade**: User clicks "Upgrade" → Stripe checkout → Subscription created
3. **Webhook**: Stripe sends event → Webhook processes → Subscription synced to Supabase
4. **Active Pro**: User has unlimited analyses
5. **Downgrade**: User clicks manage → Customer portal → Cancels subscription
6. **Subscription Canceled**: Stripe sends event → Webhook processes → Plan reset to free

## Quota System

- **Free Plan**: 2 analyses per rolling 30-day window
- **Pro Plan**: Unlimited analyses
- **Enforcement**: Checked before AI processing (returns 429 if exceeded)
- **Rolling Window**: Counts completed analyses from past 30 days
- **Error Message**: User-friendly message with upgrade prompt

## Development

The application is ready for development with full TypeScript support, ESLint configuration, and hot reload. 
