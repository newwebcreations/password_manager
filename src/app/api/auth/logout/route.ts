import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const POST = async () => {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
};
