import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = hash.split(":");

  if (algorithm !== "scrypt" || !saltHex || !hashHex) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, "hex");
    const storedHash = Buffer.from(hashHex, "hex");

    if (storedHash.length === 0 || salt.length === 0) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, storedHash.length)) as Buffer;

    if (derivedKey.length !== storedHash.length) {
      return false;
    }

    return timingSafeEqual(storedHash, derivedKey);
  } catch {
    return false;
  }
}
