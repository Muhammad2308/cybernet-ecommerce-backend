"use client";

const stats = [
  { label: "Total Users", value: "3,847", change: "+12%", up: true, color: "bg-blue-500" },
  { label: "Active Deliveries", value: "142", change: "+5%", up: true, color: "bg-emerald-500" },
  { label: "Revenue Today", value: "₦1.24M", change: "+18%", up: true, color: "bg-violet-500" },
  { label: "Pending Disputes", value: "7", change: "-3", up: false, color: "bg-rose-500" },
];

const recentOrders = [
  { id: "RDO-8841", platform: "RIDO", customer: "Emeka Okafor", route: "Wuse 2 → Garki", amount: "₦1,500", status: "In Transit", time: "2 min ago" },
  { id: "SHG-4412", platform: "SHAGO", customer: "Aisha Musa", route: "Kano DC", amount: "₦21,400", status: "Delivered", time: "15 min ago" },
  { id: "RDO-8839", platform: "RIDO", customer: "Chidi Nwosu", route: "Maitama → Asokoro", amount: "₦2,200", status: "Pending", time: "32 min ago" },
  { id: "SHG-4408", platform: "SHAGO", customer: "Fatima Bello", route: "Lagos DC", amount: "₦48,200", status: "Processing", time: "1 hr ago" },
  { id: "RDO-8835", platform: "RIDO", customer: "Tunde Adeyemi", route: "Gwarinpa → Kubwa", amount: "₦800", status: "Delivered", time: "2 hr ago" },
  { id: "SHG-4401", platform: "SHAGO", customer: "Grace Okonkwo", route: "Abuja DC", amount: "₦14,200", status: "Cancelled", time: "3 hr ago" },
];

const topTravelers = [
  { name: "Emeka Okafor", deliveries: 342, rating: 4.9, earned: "₦284,500" },
  { name: "Chidi Nwosu", deliveries: 298, rating: 4.8, earned: "₦241,200" },
  { name: "Tunde Adeyemi", deliveries: 267, rating: 4.7, earned: "₦198,700" },
  { name: "Ibrahim Sule", deliveries: 231, rating: 4.8, earned: "₦176,400" },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-blue-500/15 text-blue-400",
  "Delivered":  "bg-emerald-500/15 text-emerald-400",
  "Pending":    "bg-yellow-500/15 text-yellow-400",
  "Processing": "bg-violet-500/15 text-violet-400",
  "Cancelled":  "bg-rose-500/15 text-rose-400",
};

const navItems = [
  { icon: "⬛", label: "Dashboard", active: true },
  { icon: "📦", label: "Orders" },
  { icon: "🚚", label: "Deliveries" },
  { icon: "👥", label: "Users" },
  { icon: "🏪", label: "Merchants" },
  { icon: "💰", label: "Finance" },
  { icon: "📊", label: "Analytics" },
  { icon: "⚙️", label: "Settings" },
];

export default function AdminDashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden font-[var(--font-geist)]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">C</div>
            <div>
              <p className="text-white font-semibold text-sm">Cybernet</p>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                item.active
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">SA</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Super Admin</p>
              <p className="text-gray-500 text-xs truncate">admin@cybernet.ng</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-white font-semibold">Dashboard</h1>
            <p className="text-gray-500 text-xs">Thursday, 19 June 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders, users..."
                className="bg-gray-800 text-gray-300 placeholder-gray-600 text-sm rounded-lg px-4 py-2 w-56 outline-none border border-gray-700 focus:border-blue-500"
              />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" title="API Online" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">SA</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Platform Pills */}
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium border border-blue-500/20">● RIDO — Active</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20">● SHAGO — Active</span>
            <span className="px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 text-xs font-medium border border-gray-700">Backend v3.0.0</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                    <p className="text-white text-2xl font-bold">{s.value}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${s.color} mt-1`} />
                </div>
                <p className={`text-xs mt-3 font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {s.change} vs yesterday
                </p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Recent Orders — takes 2 cols */}
            <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Recent Orders</h2>
                <button className="text-blue-400 text-xs hover:text-blue-300">View all →</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Order ID", "Platform", "Customer", "Route", "Amount", "Status", "Time"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === recentOrders.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-3 text-blue-400 font-mono text-xs">{o.id}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${o.platform === "RIDO" ? "bg-violet-500/15 text-violet-400" : "bg-orange-500/15 text-orange-400"}`}>
                          {o.platform}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs">{o.customer}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{o.route}</td>
                      <td className="px-5 py-3 text-white font-medium text-xs">{o.amount}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{o.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Travelers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Top Travelers</h2>
                <span className="text-gray-500 text-xs">This month</span>
              </div>
              <div className="divide-y divide-gray-800">
                {topTravelers.map((t, i) => (
                  <div key={t.name} className="px-5 py-3.5 flex items-center gap-3">
                    <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.deliveries} deliveries · ⭐ {t.rating}</p>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium">{t.earned}</p>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="px-5 py-4 border-t border-gray-800 space-y-3">
                <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Platform Health</h3>
                {[
                  { label: "API Uptime", value: "99.98%", color: "bg-emerald-500" },
                  { label: "Avg Response", value: "142ms", color: "bg-blue-500" },
                  { label: "Error Rate", value: "0.02%", color: "bg-yellow-500" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
                      <span className="text-white text-xs font-medium">{m.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
