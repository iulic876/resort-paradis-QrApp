export const ADMIN_SESSION_COOKIE = "paradis_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const SESSION_MESSAGE = "paradis-admin-session-v1";

export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
}

export function isAdminPasswordConfigured() {
  return getAdminPassword() !== null;
}

export async function verifyAdminPassword(input: string) {
  const password = getAdminPassword();
  if (!password) return false;

  return constantTimeEqual(input, password);
}

export async function createAdminSessionToken() {
  const password = getAdminPassword();
  if (!password) return null;

  return signSession(password);
}

export async function isAdminSessionValid(token: string | undefined) {
  if (!token) return false;

  const expected = await createAdminSessionToken();
  if (!expected) return false;

  return constantTimeEqual(token, expected);
}

export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

async function signSession(secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(SESSION_MESSAGE),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let result = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    result |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return result === 0;
}
