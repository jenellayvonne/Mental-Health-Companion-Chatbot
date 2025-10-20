"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLogin, setIsLogin] = useState(true); // 👈 Toggle between Login and Signup

  const handleSubmit = async () => {
  if (isLogin) {
    // only email + password required
    if (!email || !password) {
      return alert("Please fill in all fields.");
    }
  } else {
    // for signup: email + username + password
    if (!email || !username || !password) {
      return alert("Please fill in all fields.");
    }
  }

  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");

    localStorage.setItem("username", username || email); // fallback
    localStorage.setItem("role", role);
    router.push(role === "moderator" ? "/moderator" : "/user");
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Mental Health Companion Chatbot
        </h1>

        <input
          type="email"
          placeholder="Enter your Gmail"
          className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </>
        )}

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded-lg mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        {/* 👇 Toggle between Login and Signup */}
        <p className="text-center text-sm mt-4">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
