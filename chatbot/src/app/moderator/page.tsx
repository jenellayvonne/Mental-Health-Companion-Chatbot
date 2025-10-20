"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, AlertCircle, Settings, LogOut } from "lucide-react";

export default function ModeratorDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">🧠 Moderator</h2>
          <nav className="flex flex-col space-y-3">
            {[
              { name: "Dashboard", icon: <MessageSquare /> },
              { name: "Users", icon: <Users /> },
              { name: "Reports", icon: <AlertCircle /> },
              { name: "Settings", icon: <Settings /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name.toLowerCase())}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                  activePage === item.name.toLowerCase()
                    ? "bg-blue-500"
                    : "hover:bg-blue-600"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg mt-6 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-300" />
            <span className="font-medium text-gray-700">Moderator</span>
          </div>
        </header>

        {/* Dashboard Page */}
        {activePage === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Active Chats", value: "0" },
                { label: "Flagged Reports", value: "0" },
                { label: "Total Users", value: "0" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow p-5 text-center"
                >
                  <h3 className="text-lg text-gray-500">{card.label}</h3>
                  <p className="text-3xl font-bold text-blue-600">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Chat Logs */}
            <section className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Chat Logs</h2>
              <div className="space-y-3">
                {[
                  { user: "User A", msg: "I'm feeling anxious lately." },
                  { user: "User B", msg: "Can I talk to someone privately?" },
                  { user: "User C", msg: "Thanks for the help!" },
                ].map((chat, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{chat.user}</p>
                      <p className="text-sm text-gray-600">{chat.msg}</p>
                    </div>
                    <button className="text-blue-600 hover:underline text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Users Page */}
        {activePage === "users" && (
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">
              List of all registered users will appear here.
            </p>
          </section>
        )}

        {/* Reports Page */}
        {activePage === "reports" && (
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Flagged Reports</h2>
            <p className="text-gray-600">
              All flagged or inappropriate messages will show here.
            </p>
          </section>
        )}

        {/* Settings Page */}
        {activePage === "settings" && (
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">
              Manage preferences and moderator controls here.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
