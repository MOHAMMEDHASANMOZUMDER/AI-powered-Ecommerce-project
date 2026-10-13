
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/app/db";
import Product from "@/models/product";

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (typeof query !== "string" || !query.trim()) {
      return Response.json({ products: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    await connectDB();

    const ai = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = ai.getGenerativeModel({
      model: "gemini-embedding-2",
    });

    const result = await model.embedContent(query.trim());
    const queryEmbedding = result.embedding.values;

    console.log("Embedding dimensions:", queryEmbedding.length);

    const products = await Product.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          image: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    return Response.json({ products });
  } catch (error) {
    console.error("AI Search API Error:", error);

    return Response.json(
      { error: error.message, products: [] },
      { status: 500 }
    );
  }
}
