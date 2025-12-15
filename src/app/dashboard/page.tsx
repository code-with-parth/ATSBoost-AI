export default function DashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-600">
            Total Resumes
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-600">
            Applications
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-600">
            Success Rate
          </h3>
          <p className="text-3xl font-bold">-%</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <p className="text-gray-600">No recent activity yet.</p>
        <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create Your First Resume
        </button>
      </div>
    </div>
  );
}
