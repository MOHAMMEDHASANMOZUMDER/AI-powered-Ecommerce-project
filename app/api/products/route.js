import { NextResponse } from "next/server";
import connectDB from "@/app/db";
import Product from "@/models/product";

export const GET = async () => {
    await connectDB();
    const products = await Product.find();
    return NextResponse.json({ products });
}