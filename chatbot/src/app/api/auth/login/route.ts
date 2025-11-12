import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

function normalizeName(name?: string) {
  if (!name) return "";
  return name.replace(/[\s.]/g, "").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If client requested moderator login, ensure only Dr. Moody can log in as moderator
    if (role === "moderator") {
      if (normalizeName(username) !== "drmoody" || user.role !== "moderator") {
        return NextResponse.json({ message: "Not authorized as moderator" }, { status: 403 });
      }
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    // return clean user data (no password)
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json({ message: "Login successful", user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
