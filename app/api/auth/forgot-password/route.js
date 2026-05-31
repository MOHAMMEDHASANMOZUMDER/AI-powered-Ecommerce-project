import connectDB from "@/app/db";
import User from "@/models/user";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        await connectDB();
        const { email } = await request.json();

        if (!email) {
            return Response.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Security best practice: Don't reveal if user exists or not (prevents email harvesting)
        if (!user) {
            return Response.json({ 
                message: "If this email is registered, a password reset link has been sent successfully." 
            }, { status: 200 });
        }

        // Generate token and expiry (1 hour)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpire = Date.now() + 3600000; // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpire = resetTokenExpire;
        await user.save();

        const origin = request.headers.get("origin") || "http://localhost:3000";
        const resetUrl = `${origin}/auth?resetToken=${resetToken}`;

        // Send email or fallback
        const emailUser = process.env.EMAIL;
        const emailPass = process.env.APP_PASSWORD;
        const isEmailConfigured = emailUser && emailPass && emailUser !== "your-gmail@gmail.com";

        let emailSent = false;

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
                    from: `"NexusStore Support" <${emailUser}>`,
                    to: user.email,
                    subject: "Reset your NexusStore Password",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
                            <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                            <p>Hi ${user.name},</p>
                            <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                            </div>
                            <p>If you didn't request a password reset, you can safely ignore this email.</p>
                            <p>Copy and paste this link in your browser if the button doesn't work:</p>
                            <p style="word-break: break-all; color: #64748b;">${resetUrl}</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated email. Please do not reply.</p>
                        </div>
                    `
                });
                emailSent = true;
            } catch (err) {
                console.error("Nodemailer failed to send password reset email:", err);
            }
        }

        // Always log reset link in console for easy debugging/local testing
        console.log("\n=============================================");
        console.log("🔑 PASSWORD RESET REQUEST");
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log("=============================================\n");

        return Response.json({
            message: "If this email is registered, a password reset link has been sent successfully.",
            resetUrl: emailSent ? null : resetUrl // Provide link for easy testing when local
        }, { status: 200 });

    } catch (error) {
        console.error("Forgot password error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
