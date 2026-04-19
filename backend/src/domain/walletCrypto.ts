import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function keyBuffer(keyHex: string) {
  const hex = keyHex.replace(/^0x/i, "").trim();
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("USER_WALLET_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)");
  }
  return key;
}

/** iv(12) | tag(16) | ciphertext — base64 */
export function encryptUtf8(plain: string, keyHex: string): string {
  const key = keyBuffer(keyHex);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptUtf8(blobB64: string, keyHex: string): string {
  const key = keyBuffer(keyHex);
  const buf = Buffer.from(blobB64, "base64");
  if (buf.length < 28) {
    throw new Error("invalid ciphertext");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
