import mongoose from "mongoose";
import connectDB from "@/app/db";
import Product from "@/models/product";
import { verifyAdmin } from "@/app/api/auth/admin-helper";

async function authorized(id) {
  if (!(await verifyAdmin())) return Response.json({ message: "Unauthorized." }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(id)) return Response.json({ message: "Invalid product ID." }, { status: 400 });
  return null;
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const unauthorized = await authorized(id);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const updates = {};
    if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.description === "string" && body.description.trim()) updates.description = body.description.trim();
    if (typeof body.category === "string") updates.category = body.category.trim();
    if (typeof body.image === "string") updates.image = body.image.trim();
    if (body.price !== undefined && Number.isFinite(Number(body.price)) && Number(body.price) >= 0) {
      updates.price = Number(body.price);
    }
    if (!Object.keys(updates).length) {
      return Response.json({ message: "No valid product changes supplied." }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return Response.json({ message: "Product not found." }, { status: 404 });
    return Response.json({ product });
  } catch (error) {
    console.error("Admin product update error:", error);
    return Response.json({ message: "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const unauthorized = await authorized(id);
  if (unauthorized) return unauthorized;

  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return Response.json({ message: "Product not found." }, { status: 404 });
    return Response.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Admin product deletion error:", error);
    return Response.json({ message: "Unable to delete product." }, { status: 500 });
  }
}
