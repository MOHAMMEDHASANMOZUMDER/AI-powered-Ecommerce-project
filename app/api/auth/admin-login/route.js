import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { adminCookieOptions, ADMIN_COOKIE } from "@/app/api/auth/admin-helper";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const configuredEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    const isBcryptHash = typeof passwordHash === "string"
      && /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash);

    if (!configuredEmail || !isBcryptHash || !process.env.JWT_SECRET) {
      console.error("Admin authentication is not configured with a valid email, bcrypt hash, and JWT secret.");
      return Response.json({ message: "Admin authentication is unavailable." }, { status: 503 });
    }

    const validEmail = typeof email === "string" && email.toLowerCase() === configuredEmail;
    const validPassword = typeof password === "string" && await bcrypt.compare(password, passwordHash);

    if (!validEmail || !validPassword) {
      return Response.json({ message: "Invalid admin email or password." }, { status: 401 });
    }

    const token = jwt.sign(
      { email: configuredEmail, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    (await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions());
    return Response.json({ message: "Admin login successful." });
  } catch (error) {
    console.error("Admin login error:", error);
    return Response.json({ message: "Unable to sign in as admin." }, { status: 500 });
  }
}
