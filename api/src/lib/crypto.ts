import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const SECRET = process.env.ENCRYPTION_SECRET || "agora-dev-secret-change-me";
const KEY    = scryptSync(SECRET, "agora-salt", 32);
const ALG    = "aes-256-gcm";

export function encrypt(text: string): string {
  const iv     = randomBytes(16);
  const cipher = createCipheriv(ALG, KEY, iv);
  const enc    = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return [iv.toString("hex"), enc.toString("hex"), tag.toString("hex")].join(":");
}

export function decrypt(payload: string): string {
  const [ivHex, encHex, tagHex] = payload.split(":");
  const decipher = createDecipheriv(ALG, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return decipher.update(encHex, "hex", "utf8") + decipher.final("utf8");
}
