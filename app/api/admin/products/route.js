import connectDB from "@/app/db";
import Product from "@/models/product";
import { verifyAdmin } from "@/app/api/auth/admin-helper";

async function requireAdmin() {
  return (await verifyAdmin()) ? null : Response.json({ message: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await connectDB();
    return Response.json({ products: await Product.find().sort({ title: 1 }).lean() });
  } catch (error) {
    console.error("Admin products error:", error);
    return Response.json({ message: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    if (!title || !description || !Number.isFinite(price) || price < 0) {
      return Response.json({ message: "Title, description, and a valid price are required." }, { status: 400 });
    }

    await connectDB();
    const product = await Product.create({
      title,
      description,
      price,
      category: typeof body.category === "string" ? body.category.trim() : "General",
      image: typeof body.image === "string" ? body.image.trim() : "",
    });
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Admin product creation error:", error);
    return Response.json({ message: "Unable to create product." }, { status: 500 });
  }
}
