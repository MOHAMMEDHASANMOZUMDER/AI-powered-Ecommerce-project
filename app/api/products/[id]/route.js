import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/db";
import Product from "@/models/product";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  try {
    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Failed to fetch product from MongoDB:", error);
    return NextResponse.json(
      { error: "Unable to load the product. Please try again later." },
      { status: 500 }
    );
  }
}
