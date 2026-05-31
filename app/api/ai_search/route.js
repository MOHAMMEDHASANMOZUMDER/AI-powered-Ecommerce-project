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
         await connectDB();
        let ai;
        let embeddingModel;
        
        function getEmbeddingModel() {
            if (!embeddingModel) {
                if (!process.env.GEMINI_API_KEY) {
                    throw new Error("GEMINI_API_KEY is not defined in environment variables");
                }
                ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                embeddingModel = ai.getGenerativeModel({ model: "gemini-embedding-2" });
            }
            return embeddingModel;
        }
     async function generateEmbedding(text){
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
}
        const queryEmbedding = await generateEmbedding(query);
        const allProducts = await Product.find({});
        //aproach 1: using ai embedding
      //  const productsWithSimilarity = allProducts.map((product) => {
           // const productEmbedding = product.embedding;
            
//             if (!productEmbedding || productEmbedding.length === 0) {
//                 return {
//                     ...product.toObject(),
//                     cosineSimilarity: 0
//                 };
//             }
//             let dotProduct = 0;
//             let querySqSum = 0;
//             let productSqSum = 0;
            
//             const len = Math.min(queryEmbedding.length, productEmbedding.length);
//             for (let i = 0; i < len; i++) {
//                 const qVal = queryEmbedding[i];
//                 const pVal = productEmbedding[i];
//                 dotProduct += qVal * pVal;
//                 querySqSum += qVal * qVal;
//                 productSqSum += pVal * pVal;
//             }
            
//             const qMagnitude = Math.sqrt(querySqSum);
//             const pMagnitude = Math.sqrt(productSqSum);
            
//             const cosineSimilarity = (qMagnitude && pMagnitude)
//                 ? dotProduct / (qMagnitude * pMagnitude)
//                 : 0;
            
//             return {
//                 ...product.toObject(),
//                 cosineSimilarity
//             };
//         });
//         productsWithSimilarity.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
//         const relevantProducts = productsWithSimilarity.filter((product) => product.cosineSimilarity > 0.2);
//         console.log(relevantProducts)
//aproach 2: using vector search
const startTime= Date.now();
const results= await Product.aggregate([
    {
       $vectorSearch: {
            index: "vector_index",
            queryVector: queryEmbedding,
            path: "embedding",
            numCandidates: 50,
            limit: 10,
            similarityFunction: "cosine"
        } 
    },
    {$project: {
        title:1,
        description:1,
        price:1,
        category:1,
        image:1,
        score: { $meta: "vectorSearchScore" }
    }
}
]);
console.log(results)
const endTime= Date.now();
console.log("Time taken:", endTime-startTime);
        
        return Response.json({ products:results });
    } catch (error) {
        console.error("AI Search API Error:", error);
        return Response.json({ error: "Failed to perform AI search", products: [] }, { status: 500 });
    }
}

