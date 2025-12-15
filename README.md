# ATSBoost-AI

AI that customizes your resume for every job — and gets you shortlisted.

## Features

- 🤖 AI-powered resume optimization
- 📊 ATS compatibility analysis
- 🎯 Job-specific customization
- 💾 Cloud storage for resumes
- 🔒 Secure authentication with Supabase
- 💳 Stripe payment integration (coming soon)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI API (coming soon)
- **Payments:** Stripe (coming soon)
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account (free tier available)
- OpenAI API key (for AI features)
- Stripe account (for payment features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atsboost-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:
- Get Supabase credentials from your [Supabase dashboard](https://app.supabase.com)
- Get OpenAI API key from [OpenAI platform](https://platform.openai.com)
- Get Stripe keys from your [Stripe dashboard](https://dashboard.stripe.com)

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── resume/       # Resume analysis & optimization
│   │   ├── storage/      # File upload/download
│   │   └── billing/      # Stripe payment endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected dashboard pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client utilities
├── types/                 # TypeScript type definitions
└── middleware.ts         # Next.js middleware (auth)
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## API Routes

### Authentication
- `POST /api/auth/callback` - OAuth callback handler

### Resume Management
- `POST /api/resume/analyze` - Analyze resume ATS compatibility
- `POST /api/resume/optimize` - Optimize resume for job description

### Storage
- `POST /api/storage/upload` - Upload resume files

### Billing
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/webhook` - Handle Stripe webhooks

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

## Development Guidelines

### Code Style
- This project uses ESLint and Prettier for code quality
- Run `pnpm format` before committing
- TypeScript strict mode is enabled

### Component Structure
- UI components are in `src/components/ui`
- Page components are in `src/app`
- Follow the existing patterns for consistency

### Authentication
- Protected routes use middleware-based authentication
- Dashboard pages require authentication
- Auth pages redirect authenticated users

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Railway
- Render

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.
