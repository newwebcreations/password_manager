import crypto from "crypto";

const IV_LENGTH = 12;

const getKey = (): Buffer => {
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("ENCRYPTION_KEY is not set");
  }

  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }

  try {
    const keyBuffer = Buffer.from(rawKey, "base64");
    if (keyBuffer.length === 32) {
      return keyBuffer;
    }
  } catch {
    // fallthrough
  }

  if (rawKey.length === 32) {
    return Buffer.from(rawKey, "utf8");
  }

  throw new Error("ENCRYPTION_KEY must be 32 bytes (base64, hex, or utf8)");
};

export const encryptPassword = (plaintext: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), encrypted.toString("base64"), tag.toString("base64")].join(":");
};

export const decryptPassword = (payload: string): string => {
  const key = getKey();
  const [ivBase64, encryptedBase64, tagBase64] = payload.split(":");

  if (!ivBase64 || !encryptedBase64 || !tagBase64) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
};
