import { NextResponse } from "next/server";
import connectDB from "@/app/db";
import Product from "@/models/product";

export const GET = async () => {
  try {
    await connectDB();
    const products = await Product.find();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products from MongoDB:", error);
    return NextResponse.json(
      { error: "Unable to load products. Please try again later.", products: [] },
      { status: 500 }
    );
  }
};