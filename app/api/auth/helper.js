import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * Reusable server-side helper to verify user authentication from HTTPOnly cookies.
 * Returns the decoded token payload { userId, email, name, role } if valid, otherwise null.
 */
export async function verifyAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        if (!token) {
            return null;
        }
        
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured in environment variables");
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.warn("Auth token verification failed:", error.message);
        return null;
    }
}
