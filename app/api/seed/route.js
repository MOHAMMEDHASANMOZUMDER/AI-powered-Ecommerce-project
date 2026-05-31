import connectDB from "@/app/db"; // Corrected to app/db
import Product from "@/models/product";
import Order from "@/models/order";
import {GoogleGenerativeAI} from "@google/generative-ai";

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


export const GET = async () => {
    try {
        await connectDB();
        await Product.deleteMany({});
        await Order.deleteMany({});
        const products= [
        {
    title: "Gaming Mouse",
    description: "Ergonomic gaming mouse with customizable RGB lighting.",
    price: 59.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Mechanical Keyboard",
    description: "Responsive mechanical keyboard for gaming and productivity.",
    price: 99.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Laptop Stand",
    description: "Adjustable aluminum laptop stand for better posture.",
    price: 29.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Wireless Charger",
    description: "Fast wireless charging pad compatible with most smartphones.",
    price: 19.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Office Chair",
    description: "Comfortable ergonomic chair for long working hours.",
    price: 149.99,
    category: "Furniture",
    image: "https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness levels.",
    price: 34.99,
    category: "Home Decor",
    image: "https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Coffee Maker",
    description: "Automatic coffee maker with programmable timer.",
    price: 79.99,
    category: "Home Appliances",
    image: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Fitness Tracker",
    description: "Track your daily activity, heart rate, and sleep.",
    price: 69.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Basketball",
    description: "Official size basketball for indoor and outdoor play.",
    price: 24.99,
    category: "Sports",
    image: "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Football",
    description: "Durable football designed for all weather conditions.",
    price: 22.99,
    category: "Sports",
    image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Camping Tent",
    description: "Water-resistant tent suitable for 4 people.",
    price: 129.99,
    category: "Outdoor",
    image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Travel Mug",
    description: "Insulated stainless steel mug keeps drinks hot or cold.",
    price: 18.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Water Bottle",
    description: "Reusable BPA-free water bottle for everyday use.",
    price: 14.99,
    category: "Sports",
    image: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Air Fryer",
    description: "Cook healthier meals with less oil.",
    price: 119.99,
    category: "Home Appliances",
    image: "https://images.pexels.com/photos/6996093/pexels-photo-6996093.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Hair Dryer",
    description: "Professional hair dryer with multiple heat settings.",
    price: 39.99,
    category: "Personal Care",
    image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Electric Toothbrush",
    description: "Rechargeable toothbrush with advanced cleaning modes.",
    price: 49.99,
    category: "Personal Care",
    image: "https://images.pexels.com/photos/6621463/pexels-photo-6621463.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Notebook Set",
    description: "Pack of premium notebooks for school and office use.",
    price: 12.99,
    category: "Stationery",
    image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Ballpoint Pen Pack",
    description: "Smooth-writing pens in assorted colors.",
    price: 8.99,
    category: "Stationery",
    image: "https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Monitor 24 Inch",
    description: "Full HD monitor with vibrant color reproduction.",
    price: 179.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Webcam HD",
    description: "1080p webcam perfect for video conferencing.",
    price: 49.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/5935755/pexels-photo-5935755.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Power Bank",
    description: "10000mAh portable charger for phones and tablets.",
    price: 29.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/4526413/pexels-photo-4526413.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Smartphone Tripod",
    description: "Flexible tripod for photography and content creation.",
    price: 21.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Bean Bag",
    description: "Soft and comfortable bean bag for relaxing.",
    price: 89.99,
    category: "Furniture",
    image: "https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Wall Clock",
    description: "Modern wall clock with silent movement.",
    price: 24.99,
    category: "Home Decor",
    image: "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Table Fan",
    description: "Portable table fan with adjustable speed settings.",
    price: 44.99,
    category: "Home Appliances",
    image: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Duffel Bag",
    description: "Spacious duffel bag ideal for gym and travel.",
    price: 39.99,
    category: "Accessories",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Hoodie",
    description: "Warm and comfortable cotton hoodie.",
    price: 34.99,
    category: "Clothing",
    image: "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Denim Jacket",
    description: "Classic denim jacket for casual wear.",
    price: 59.99,
    category: "Clothing",
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Wireless Earbuds",
    description: "Compact earbuds with excellent sound quality.",
    price: 89.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Digital Alarm Clock",
    description: "Modern alarm clock with LED display.",
    price: 19.99,
    category: "Home Decor",
    image: "https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
{
    title: "Portable SSD",
    description: "High-speed external SSD with 1TB storage.",
    price: 139.99,
    category: "Electronics",
    image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400",
},
    ]
    const productsWithVectors= await Promise.all(products.map(async(product)=>{
        const embedding= await generateEmbedding(`${product.title}\n${product.description}\n${product.category}`);
        return {...product, embedding};
    }));
    
    const seededProducts = await Product.insertMany(productsWithVectors);


    // Seed mock Orders using references to our newly created products
    const mouse = seededProducts[0];
    const keyboard = seededProducts[1];
    const stand = seededProducts[2];

    await Order.insertMany([
      {
        orderNumber: "NEX-883192",
        shippingAddress: {
          name: "Alice Johnson",
          phone: "01712345678",
          email: "alice@example.com",
          address: "House 12, Road 5, Banani",
          city: "Dhaka",
          zip: "1213",
        },
        paymentMethod: "stripe",
        paymentDetails: {
          cardHolder: "ALICE JOHNSON",
          cardNumberLast4: "4242",
        },
        items: [
          {
            product: mouse._id,
            title: mouse.title,
            quantity: 1,
            priceAtPurchase: mouse.price,
          },
          {
            product: keyboard._id,
            title: keyboard.title,
            quantity: 1,
            priceAtPurchase: keyboard.price,
          },
        ],
        subtotal: mouse.price + keyboard.price,
        tax: 0,
        total: mouse.price + keyboard.price,
        status: "completed",
      },
      {
        orderNumber: "NEX-992187",
        shippingAddress: {
          name: "Rahman Khan",
          phone: "01999887766",
          email: "rahman@example.com",
          address: "Flat 4B, Dhanmondi",
          city: "Dhaka",
          zip: "1209",
        },
        paymentMethod: "bkash",
        paymentDetails: {
          senderNumber: "01999887766",
          transactionId: "BK8877X992",
        },
        items: [
          {
            product: stand._id,
            title: stand.title,
            quantity: 2,
            priceAtPurchase: stand.price,
          },
        ],
        subtotal: stand.price * 2,
        tax: 0,
        total: stand.price * 2,
        status: "processing",
      },
    ]);

        return Response.json({message: `Products and Orders seeded successfully`});
    } catch (error) {
        console.error("Seeding Error:", error);
        return Response.json({ error: error.message || error, stack: error.stack }, { status: 500 });
    }
}
