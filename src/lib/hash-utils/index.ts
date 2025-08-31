import crypto from "node:crypto";

export function computeContentHash(
  firstRow: string,
  secondRow: string,
): string {
  const canonical = `${firstRow}\n${secondRow}`.trim();
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT ?? "";
  if (!salt) return undefined;
  const digest = crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
  return digest.slice(0, 24);
}

export function sanitizeUserAgent(ua: string | undefined): string | undefined {
  if (!ua) return undefined;
  const withoutZeroWidth = ua.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
  const collapsedWhitespace = withoutZeroWidth.replace(/\s+/g, " ").trim();
  const maxLen = 256;
  return collapsedWhitespace.slice(0, maxLen);
}
