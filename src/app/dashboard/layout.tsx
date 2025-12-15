import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold">
            ATSBoost-AI
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/resumes"
              className="text-sm font-medium hover:text-blue-600"
            >
              Resumes
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium hover:text-blue-600"
            >
              Settings
            </Link>
            <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Log out
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
