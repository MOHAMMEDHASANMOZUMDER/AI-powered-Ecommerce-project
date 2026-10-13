import { cookies } from "next/headers";
import { adminCookieOptions, ADMIN_COOKIE } from "@/app/api/auth/admin-helper";

export async function POST() {
  (await cookies()).set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return Response.json({ message: "Admin logged out." });
}
