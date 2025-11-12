import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// helper to normalize username when checking moderator eligibility
function normalizeName(name?: string) {
  if (!name) return "";
  return name.replace(/[\s.]/g, "").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Only allow "Dr. Moody" (normalized 'drmoody') to signup as moderator
    if (role === "moderator") {
      if (normalizeName(username) !== "drmoody") {
        return NextResponse.json(
          { message: "Only Dr. Moody can sign up as a moderator." },
          { status: 403 }
        );
      }
    }

    // Check if user already exists (by username)
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role === "moderator" && normalizeName(username) === "drmoody" ? "moderator" : "user",
      },
    });

    // return user excluding password
    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json({ message: "Signup successful", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
