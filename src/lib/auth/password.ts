import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hashes a plain-text password using scrypt with a unique 16-byte salt.
 * Returns the salt and derived key in `salt:hash` hex format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored `salt:hash` string.
 */
export function verifyPassword(password: string, storedHash: string | undefined): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}
