export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-black text-red-500 mb-2">CYBERNET</h1>
        <p className="text-gray-400 text-lg mb-8">Unified Admin Dashboard</p>
        <div className="flex gap-4 justify-center">
          <a href="/rido" className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition">RIDO Platform</a>
          <a href="/shago" className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition">SHAGO Platform</a>
        </div>
      </div>
    </div>
  )
}
