import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold">ATSBoost-AI</div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <section className="flex flex-1 items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            AI that customizes your resume
            <br />
            <span className="text-blue-600">for every job</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Get shortlisted with AI-powered resume optimization that beats ATS
            systems every time.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-gray-300 px-6 py-3 text-lg font-medium hover:bg-gray-50"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2024 ATSBoost-AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
