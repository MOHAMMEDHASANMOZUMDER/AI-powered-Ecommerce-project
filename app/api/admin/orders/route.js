import connectDB from "@/app/db";
import Order from "@/models/order";
import "@/models/user";
import { verifyAdmin } from "@/app/api/auth/admin-helper";

export async function GET() {
  if (!(await verifyAdmin())) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean();
    return Response.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return Response.json({ message: "Unable to load orders." }, { status: 500 });
  }
}
