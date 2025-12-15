export default function ResumesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create New Resume
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-center text-gray-600">
            No resumes yet. Create your first resume to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
