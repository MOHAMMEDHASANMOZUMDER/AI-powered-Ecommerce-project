import connectDB from "@/app/db";
import User from "@/models/user";

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return Response.json({ message: "Verification token is required" }, { status: 400 });
        }

        // Find user with matching token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return Response.json({ message: "Invalid or expired verification token" }, { status: 400 });
        }

        // Update verification fields
        user.emailVerified = true;
        user.verificationToken = null;
        await user.save();

        // Redirect back to our premium storefront /auth page with a verified=true flag
        const origin = request.headers.get("origin") || new URL(request.url).origin;
        return Response.redirect(`${origin}/auth?verified=true`);

    } catch (error) {
        console.error("Verification error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
