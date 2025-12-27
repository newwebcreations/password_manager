import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const cookieName = "pm_token";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
};

export const setAuthCookie = (token: string) => {
  const cookieStore = cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookie = () => {
  const cookieStore = cookies();
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export const getUserIdFromRequest = (request: NextRequest): string | null => {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
};
