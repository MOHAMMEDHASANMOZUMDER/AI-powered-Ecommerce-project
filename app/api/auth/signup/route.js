import connectDB from "@/app/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        await connectDB();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return Response.json({ message: "Name, email, and password are required" }, { status: 400 });
        }

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return Response.json({ message: "Email is already registered" }, { status: 400 });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 4. Create user
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            verificationToken
        });

        // 5. Verification Link
        const origin = request.headers.get("origin") || "http://localhost:3000";
        const verifyUrl = `${origin}/api/auth/verify?token=${verificationToken}`;

        // 6. Send Email or Fallback
        const emailUser = process.env.EMAIL;
        const emailPass = process.env.APP_PASSWORD;
        const isEmailConfigured = emailUser && emailPass && emailUser !== "your-gmail@gmail.com";

        let emailSent = false;
        let consoleLink = verifyUrl;

        if (isEmailConfigured) {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                await transporter.sendMail({
                    from: `"NexusStore Auth" <${emailUser}>`,
                    to: newUser.email,
                    subject: "Verify your NexusStore Account",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
                            <h2 style="color: #4f46e5; text-align: center;">Welcome to NexusStore!</h2>
                            <p>Hi ${newUser.name},</p>
                            <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Account</a>
                            </div>
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #64748b;">${verifyUrl}</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated email. Please do not reply.</p>
                        </div>
                    `
                });
                emailSent = true;
            } catch (err) {
                console.error("Nodemailer failed to send email. Falling back to console log:", err);
            }
        }

        // Always log verification link in console for easy debugging/local testing
        console.log("\n=============================================");
        console.log("📨 NEW USER REGISTRATION INFO");
        console.log(`User: ${newUser.name} (${newUser.email})`);
        console.log(`Verification URL: ${consoleLink}`);
        console.log("=============================================\n");

        return Response.json({
            message: emailSent 
                ? "Sign up successful! Please check your email to verify your account." 
                : "Sign up successful! (Local development: Please use the verification URL sent to the server console or the link below to verify.)",
            verificationUrl: emailSent ? null : verifyUrl
        }, { status: 201 });

    } catch (error) {
        console.error("Signup error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
