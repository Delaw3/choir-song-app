import { NextResponse, type NextRequest } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/mongodb/types";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Email and password are required." },
        { status: 400 },
      );
    }

    const db = getMongoDb();
    let user = await db.collection<UserDoc>("users").findOne({ email });

    // Self-healing fallback: If admin user doesn't exist yet, seed it on demand
    if (!user && email === "admin@choir.app") {
      const now = new Date();
      const adminDoc: UserDoc = {
        displayName: "Choir Admin",
        email: "admin@choir.app",
        passwordHash: hashPassword("Choir123!"),
        role: "admin",
        creditBalance: 1000,
        status: "active",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection<UserDoc>("users").insertOne(adminDoc);
      user = { ...adminDoc, _id: result.insertedId };
    }

    // Self-healing fallback for demo member
    if (!user && email === "member@choir.app") {
      const now = new Date();
      const memberDoc: UserDoc = {
        displayName: "Amara Okafor",
        email: "member@choir.app",
        passwordHash: hashPassword("Choir123!"),
        role: "member",
        creditBalance: 84,
        status: "active",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection<UserDoc>("users").insertOne(memberDoc);
      user = { ...memberDoc, _id: result.insertedId };
    }

    if (!user) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "ACCOUNT_INACTIVE", message: "Your account is suspended or inactive." },
        { status: 403 },
      );
    }

    // Create session record in MongoDB and set signed session cookie
    await createSession(user);

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        name: user.displayName,
        email: user.email ?? "",
        role: user.role,
        emailVerified: Boolean(user.emailVerified),
        creditBalance: user.creditBalance ?? 0,
      },
    });
  } catch (err: unknown) {
    console.error("Sign-in error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: "SERVER_ERROR", message }, { status: 500 });
  }
}
