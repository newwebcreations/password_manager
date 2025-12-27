import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getUserIdFromRequest } from "@/lib/auth";
import { decryptPassword, encryptPassword } from "@/lib/crypto";

const getPasswordDoc = async (userId: string, id: string) => {
  const client = await clientPromise;
  const db = client.db();
  return db.collection("passwords").findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
  });
};

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await getPasswordDoc(userId, params.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      id: doc._id.toString(),
      title: doc.title,
      username: doc.username,
      url: doc.url,
      password: decryptPassword(doc.passwordEncrypted),
    },
  });
};

export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
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

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (title) updates.title = title;
  if (username) updates.username = username;
  if (typeof url === "string") updates.url = url;
  if (password) updates.passwordEncrypted = encryptPassword(password);

  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("passwords").updateOne(
    { _id: new ObjectId(params.id), userId: new ObjectId(userId) },
    { $set: updates }
  );

  if (!result.matchedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
};

export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("passwords").deleteOne({
    _id: new ObjectId(params.id),
    userId: new ObjectId(userId),
  });

  if (!result.deletedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
};
