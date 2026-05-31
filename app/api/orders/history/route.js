import connectDB from "@/app/db";
import Order from "@/models/order";
import { verifyAuth } from "@/app/api/auth/helper";

export async function GET() {
    try {
        await connectDB();

        // 1. Verify user authentication session
        const authenticatedUser = await verifyAuth();
        if (!authenticatedUser) {
            return Response.json({ message: "Unauthorized access. Please log in first." }, { status: 401 });
        }

        // 2. Fetch all orders linked to the logged-in user
        const orders = await Order.find({ user: authenticatedUser.userId })
            .sort({ createdAt: -1 }) // Show newest orders first
            .lean();                 // Lightweight JS object format

        return Response.json({
            message: "Orders retrieved successfully!",
            orders
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch orders history error:", error);
        return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
