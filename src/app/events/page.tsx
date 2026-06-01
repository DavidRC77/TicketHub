export default function EventsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Browse Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Event Name</h3>
            <p className="text-gray-600 mb-4">Event description goes here</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Date</span>
              <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Book Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
