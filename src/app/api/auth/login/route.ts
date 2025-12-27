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
  const user = await db.collection("users").findOne({ email: normalizedEmail });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash as string);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = signToken(user._id.toString());
  setAuthCookie(token);

  return NextResponse.json({ ok: true });
};
