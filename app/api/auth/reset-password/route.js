import connectDB from "@/app/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await connectDB();
        const { token, password } = await request.json();

        if (!token || !password) {
            return Response.json({ message: "Token and password are required" }, { status: 400 });
        }

        // 1. Find user with valid token that has not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return Response.json({ message: "Invalid or expired password reset token" }, { status: 400 });
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Update password and clear reset fields
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpire = null;
        await user.save();

        return Response.json({ message: "Password has been reset successfully! You can now log in." }, { status: 200 });

    } catch (error) {
        console.error("Reset password error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
