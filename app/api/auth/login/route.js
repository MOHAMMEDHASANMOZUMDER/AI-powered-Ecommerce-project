import connectDB from "@/app/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

        // 5. Set HttpOnly JWT Cookie (Production Best Practice)
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,                               // Shield token from XSS attacks
            secure: process.env.NODE_ENV === "production", // Only transport over HTTPS in production
            sameSite: "strict",                           // Defend against CSRF requests
            maxAge: 7 * 24 * 60 * 60,                     // 7 days expiration
            path: "/"
        });

        // 6. Respond with user details (Frontend can store these public details in state)
        return Response.json({
            message: "Login successful!",
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
