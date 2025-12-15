export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="you@example.com"
                disabled
              />
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Billing</h2>
          <p className="mb-4 text-gray-600">
            Manage your subscription and billing information.
          </p>
          <button className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">
            Manage Billing
          </button>
        </div>

        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Danger Zone
          </h2>
          <p className="mb-4 text-gray-600">
            Permanently delete your account and all associated data.
          </p>
          <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
