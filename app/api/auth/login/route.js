import connectDB from "@/app/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        await connectDB();
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ message: "Email and password are required" }, { status: 400 });
        }

        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return Response.json({ message: "Invalid email or password" }, { status: 400 });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return Response.json({ message: "Invalid email or password" }, { status: 400 });
        }

        // 3. Prevent login if email is not verified (Phase 2 constraint)
        if (!user.emailVerified) {
            return Response.json({ 
                message: "Please verify your email address first to activate your account.", 
                notVerified: true 
            }, { status: 403 });
        }

        // 4. Create JWT Token (Phase 1 constraint)
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured in environment variables");
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Respond with token and user details
        return Response.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
