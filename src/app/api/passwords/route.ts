import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import { encryptPassword } from "@/lib/crypto";

export const GET = async (request: NextRequest) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const items = await db
    .collection("passwords")
    .find({ userId: new ObjectId(userId) })
    .project({ passwordEncrypted: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ items });
};

export const POST = async (request: NextRequest) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, username, url, password } = (await request.json()) as {
    title?: string;
    username?: string;
    url?: string;
    password?: string;
  };

  if (!title || !username || !password) {
    return NextResponse.json({ error: "Title, username, and password are required." }, { status: 400 });
  }

  const encrypted = encryptPassword(password);

  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("passwords").insertOne({
    userId: new ObjectId(userId),
    title,
    username,
    url: url ?? "",
    passwordEncrypted: encrypted,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
};
