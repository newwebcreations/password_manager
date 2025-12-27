import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { setAuthCookie, signToken } from "@/lib/auth";

export const POST = async (request: NextRequest) => {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const existingUser = await db.collection("users").findOne({ email: normalizedEmail });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.collection("users").insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });

  const token = signToken(result.insertedId.toString());
  setAuthCookie(token);

  return NextResponse.json({ ok: true });
};
