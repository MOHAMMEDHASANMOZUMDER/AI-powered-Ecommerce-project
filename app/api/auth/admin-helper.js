import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const ADMIN_COOKIE = "admin_token";

export async function verifyAdmin() {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token || !process.env.JWT_SECRET) return null;

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  };
}

export { ADMIN_COOKIE };
