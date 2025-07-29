import React from "react";
import { signOut } from "next-auth/react";

const menuItems = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Transaction", icon: "💸" },
  { label: "Auto Pay", icon: "🔁" },
  { label: "Goals", icon: "🎯" },
  { label: "Settings", icon: "⚙️" },
  { label: "Message", icon: "💬", active: true, badge: '' },
  { label: "Investment", icon: "📈" },
  { label: "Support", icon: "🛟" },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col justify-between h-full w-64 bg-white rounded-2xl shadow p-4 border border-gray-100">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-blue-100 rounded-xl p-2">
            <span className="text-2xl text-blue-600 font-bold">S</span>
          </div>
          <span className="font-bold text-lg text-gray-800">Smart Hire</span>
        </div>
        {/* Menu */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <div key={item.label} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${item.active ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div>
        {/* Upgrade Pro */}
        <div className="bg-pink-50 rounded-xl p-4 flex flex-col items-center mb-4">
          <span className="text-pink-600 font-bold mb-2">PRO</span>
          <span className="text-xs text-gray-500 mb-2 text-center">Reminders, advanced searching and more</span>
          <button className="bg-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold">Upgrade Pro</button>
        </div>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-blue-200" />
          <div>
            <div className="font-semibold text-gray-700">Ravi Shah</div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-red-500 hover:underline"
            >
            Log out
            </button>

          </div>
        </div>
      </div>
    </aside>
  );
} 