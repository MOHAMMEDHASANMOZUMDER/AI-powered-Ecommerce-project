import { NextResponse } from "next/server";
import connectDB from "@/app/db";
import Order from "@/models/order";

export const POST = async (request) => {
  try {
    await connectDB();
    const body = await request.json();

    const {
      orderNumber,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      items,
      subtotal,
      tax,
      total,
    } = body;

    // Server-side baseline validation
    if (!orderNumber || !shippingAddress || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order parameters." },
        { status: 400 }
      );
    }

    // Persist new order in DB
    const newOrder = new Order({
      orderNumber,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      items,
      subtotal,
      tax,
      total,
      status: "pending",
    });

    await newOrder.save();

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to store checkout order to MongoDB:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
};
