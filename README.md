# ATSBoost-AI

AI that customizes your resume for every job — and gets you shortlisted.

## Features

- **Email/Password Authentication** - Secure signup, login, and password reset
- **Protected Routes** - Middleware-protected dashboard and settings
- **Profile Management** - Update profile information and email
- **Session Management** - Persistent sessions with automatic refresh
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

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies as configured in the migration

### 4. Authentication Configuration

In your Supabase dashboard:
1. Go to Authentication → Settings
2. Configure Site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs for email confirmation
4. Configure SMTP settings for email templates

### 5. Run Development Server

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

The application uses three main tables with RLS policies:

- **profiles** - User profile information
- **plans** - Subscription plans (free/pro/enterprise)  
- **usage_tracking** - Track user activity and limits

## Key Features Implemented

✅ **User Registration** - Email/password signup with validation
✅ **Email Confirmation** - Supabase handles confirmation emails
✅ **User Authentication** - Secure login with session management
✅ **Password Reset** - Email-based password recovery
✅ **Protected Routes** - Middleware guards dashboard/settings
✅ **Session Persistence** - Automatic session refresh
✅ **Profile Management** - Update user information
✅ **Usage Tracking** - Monitor account activity
✅ **Responsive UI** - Mobile-first design
✅ **Error Handling** - Comprehensive error states and toasts
✅ **Loading States** - Proper loading indicators
✅ **Redirects** - Automatic redirects after auth actions

## Authentication Flow

1. **Signup**: User registers → Email confirmation → Dashboard access
2. **Login**: User logs in → Session created → Redirect to dashboard  
3. **Password Reset**: Request reset → Email link → Update password → Login
4. **Session**: Automatic refresh → Protected route access

## Development

The application is ready for development with full TypeScript support, ESLint configuration, and hot reload. 
