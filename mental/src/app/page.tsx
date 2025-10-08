"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Normal Sign In (future: connect to backend or Firebase)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter your credentials.");
      return;
    }

    // Temporary mock login logic
    if (email === "moderator@example.com") {
      router.push("/moderator");
    } else {
      router.push("/user");
    }
  };

  // Quick Role-Based Demo Logins
  const handleUserLogin = () => {
    localStorage.setItem("role", "user");
    router.push("/user");
  };

  const handleModeratorLogin = () => {
    localStorage.setItem("role", "moderator");
    router.push("/moderator");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-[340px] text-center border border-gray-200">
        {/* Bot Icon */}
        <div className="flex justify-center mb-4">
          <Image
            src="/favicon.ico"
            alt="Bot Logo"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800">
          Mental Health Companion
        </h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to continue</p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-900 transition"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <p className="text-gray-400 text-xs mt-6 mb-3">Sign in to continue</p>

        {/* Role Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUserLogin}
            className="w-full border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Login as User
          </button>
          <button
            onClick={handleModeratorLogin}
            className="w-full border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Login as Moderator
          </button>
        </div>
      </div>
    </div>
  );
}
