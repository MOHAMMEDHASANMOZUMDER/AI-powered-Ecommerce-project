import { cookies } from "next/headers";

/**
 * Endpoint to securely clear the HttpOnly JWT session cookie.
 */
export async function POST() {
    try {
        const cookieStore = await cookies();
        
        // Overwrite token cookie with empty string and past expiration
        cookieStore.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0), // Instantly expire cookie
            path: "/"
        });

        return Response.json({ message: "Logged out securely!" }, { status: 200 });
    } catch (error) {
        console.error("Logout error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
