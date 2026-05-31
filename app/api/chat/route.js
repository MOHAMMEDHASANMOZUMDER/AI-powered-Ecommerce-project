import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/app/db";
import Product from "@/models/product";
import Order from "@/models/order";

let ai;
let embeddingModel;
let chatModel;

function getGeminiClient() {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables");
        }
        ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return ai;
}

function getEmbeddingModel() {
    if (!embeddingModel) {
        const client = getGeminiClient();
        embeddingModel = client.getGenerativeModel({ model: "gemini-embedding-2" });
    }
    return embeddingModel;
}

function getChatModel() {
    if (!chatModel) {
        const client = getGeminiClient();
        chatModel = client.getGenerativeModel({ model: "gemini-3.5-flash" });
    }
    return chatModel;
}

async function generateEmbedding(text) {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
}

export async function POST(request) {
    try {
        const { message } = await request.json();
        
        if (!message || message.trim() === "") {
            return Response.json({ reply: "Hello! How can I help you today?" });
        }
        
        await connectDB();
        
        const lowercaseMessage = message.toLowerCase();
        
        // ==========================================
        // INTENT 1: ORDER TRACKING
        // ==========================================
        const orderNumberMatch = message.match(/(NEX-\d+|ORD\d+)/i);
        const isTrackingQuery = lowercaseMessage.includes("track") || lowercaseMessage.includes("status") || orderNumberMatch;
        
        if (isTrackingQuery) {
            if (orderNumberMatch) {
                const orderNumber = orderNumberMatch[0].toUpperCase();
                const order = await Order.findOne({ orderNumber });
                
                if (order) {
                    const itemsList = order.items.map(item => `- ${item.title} (x${item.quantity})`).join("\n");
                    const reply = `🔍 **Order Found!**\n\n` +
                                  `**Order Number:** \`${order.orderNumber}\`\n` +
                                  `**Status:** \`${order.status.toUpperCase()}\`\n` +
                                  `**Total:** **${order.total.toFixed(0)} TK**\n\n` +
                                  `**Items:**\n${itemsList}\n\n` +
                                  `**Shipping Address:**\n` +
                                  `${order.shippingAddress.name}, ${order.shippingAddress.phone}\n` +
                                  `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.zip}\n\n` +
                                  `Is there anything else I can assist you with regarding this order?`;
                    return Response.json({ reply });
                } else {
                    return Response.json({ 
                        reply: `I detected you are looking for order **${orderNumber}**, but I couldn't find that order in our database. Please double-check the order number and try again!` 
                    });
                }
            } else {
                return Response.json({ 
                    reply: "It looks like you want to track an order! Please provide your order number (for example, `NEX-883192`) so I can look up its status in our database." 
                });
            }
        }
        
        // ==========================================
        // INTENT 2: FAQ / SPECIAL SERVICE POLICIES
        // ==========================================
        const isFaqQuery = lowercaseMessage.includes("return") || 
                           lowercaseMessage.includes("refund") || 
                           lowercaseMessage.includes("shipping") || 
                           lowercaseMessage.includes("delivery") ||
                           lowercaseMessage.includes("warranty");
                           
        if (isFaqQuery) {
            const faqPrompt = `
You are a friendly customer service AI assistant for NexusStore (a premium e-commerce site in Bangladesh using TK/Taka currency).
Answering the user's FAQ query about shipping, returns, delivery, or warranty.

Our Store Policies:
- **Returns & Refunds:** 7-day return policy for any manufacturing defect. The product must be unused and in original packaging. Refunds are processed within 3-5 business days.
- **Shipping & Delivery:** Inside Dhaka delivery is 80 TK and takes 24-48 hours. Outside Dhaka delivery is 150 TK and takes 2-3 business days. We support Cash on Delivery (COD), bKash, Nagad, and Stripe (Cards).
- **Warranty:** Laptops have a 2-year official brand warranty, accessories and other electronics have a 6-month or 1-year warranty unless specified.
- **General Support Hours:** 9 AM to 9 PM every day.

User Message: "${message}"

Generate a helpful, natural, and friendly response answering their query using the markdown format. Keep it concise.
            `;
            const model = getChatModel();
            const result = await model.generateContent(faqPrompt);
            return Response.json({ reply: result.response.text() });
        }
        
        // ==========================================
        // INTENT 3: PRODUCT SEARCH & RECOMMENDATION (GEMINI RAG FLOW)
        // ==========================================
        // 1. Generate query embedding
        const queryEmbedding = await generateEmbedding(message);
        
        let matchingProducts = [];
        try {
            // Attempt MongoDB Atlas Vector Search
            matchingProducts = await Product.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        queryVector: queryEmbedding,
                        path: "embedding",
                        numCandidates: 50,
                        limit: 5,
                        similarityFunction: "cosine"
                    } 
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        price: 1,
                        category: 1,
                        image: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);
        } catch (dbError) {
            // Fallback: In-memory cosine similarity search
            const allProducts = await Product.find({});
            const productsWithSimilarity = allProducts.map((product) => {
                const productEmbedding = product.embedding;
                if (!productEmbedding || productEmbedding.length === 0) {
                    return { ...product.toObject(), cosineSimilarity: 0 };
                }
                
                let dotProduct = 0;
                let querySqSum = 0;
                let productSqSum = 0;
                const len = Math.min(queryEmbedding.length, productEmbedding.length);
                for (let i = 0; i < len; i++) {
                    const qVal = queryEmbedding[i];
                    const pVal = productEmbedding[i];
                    dotProduct += qVal * pVal;
                    querySqSum += qVal * qVal;
                    productSqSum += pVal * pVal;
                }
                const qMagnitude = Math.sqrt(querySqSum);
                const pMagnitude = Math.sqrt(productSqSum);
                const cosineSimilarity = (qMagnitude && pMagnitude)
                    ? dotProduct / (qMagnitude * pMagnitude)
                    : 0;
                
                return {
                    ...product.toObject(),
                    cosineSimilarity
                };
            });
            
            productsWithSimilarity.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
            matchingProducts = productsWithSimilarity.filter(p => p.cosineSimilarity > 0.15).slice(0, 5);
        }
        
        // 2. Pass products to Gemini for a highly personalized recommendation
        const chatPrompt = `
You are an expert personal shopping assistant for NexusStore, a premium e-commerce platform. Your job is to help the user find the best products in our catalog.

User Query: "${message}"

Available Products from our database matching their interest:
${JSON.stringify(matchingProducts.map(p => ({
    id: p._id,
    title: p.title,
    price: p.price + " TK",
    category: p.category,
    description: p.description
})))}

Instructions:
- Provide an engaging, natural response in English.
- If there are relevant products in the list above, explain why they fit the user's criteria. Recommend 1-3 best options.
- ALWAYS mention the exact prices (in TK/Taka) and highlight main specs or features.
- If no matching products were found, politely ask for more details or suggest other general product categories we offer (e.g. Laptops, Keyboards, Accessories, Sports, Home Decor).
- Keep the tone friendly, helpful, professional, and slightly enthusiastic!
- Format your response beautifully with bold text, bullet points, or numbered lists using clean markdown syntax.
        `;
        
        const model = getChatModel();
        const result = await model.generateContent(chatPrompt);
        const reply = result.response.text();
        
        return Response.json({ reply, products: matchingProducts });
    } catch (error) {
        console.error("Chat API Error:", error);
        return Response.json({ 
            reply: "I am having trouble connecting to my brain right now! Please try again in a moment.", 
            error: error.message 
        }, { status: 500 });
    }
}
