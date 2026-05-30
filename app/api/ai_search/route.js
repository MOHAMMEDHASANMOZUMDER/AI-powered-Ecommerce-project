import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/app/db";
import Product from "@/models/product";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



export async function POST(request) {
    try {
        const { query } = await request.json();
        
        if (!query || query.trim() === "") {
            return Response.json({ products: [] });
        }

        const model = client.getGenerativeModel({ model: "gemini-3.5-flash" });
        const aiRes = await model.generateContent(
            `Convert the following user search query into a single simplified product search keyword. Return ONLY the search keyword, with no extra explanation, punctuation, or text:\n\nUser Query: "${query}"`
        );
        const keywords = aiRes.response.text()
            .replace(/["'**`]/g, "")
            .trim();
        
        await connectDB();
        
        
        const products = await Product.find({
            $or: [
                // Match AI-extracted keywords
                { title: { $regex: keywords, $options: "i" } },
                { description: { $regex: keywords, $options: "i" } },
                // Match original user query as fallback
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        });

        return Response.json({ products });
    } catch (error) {
        console.error("AI Search API Error:", error);
        return Response.json({ error: "Failed to perform AI search", products: [] }, { status: 500 });
    }
}
