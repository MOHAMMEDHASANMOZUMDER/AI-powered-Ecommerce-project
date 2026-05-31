import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest checkouts
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "cash_on_delivery", "bkash", "nagad"],
    },
    paymentDetails: {
      cardHolder: { type: String },
      cardNumberLast4: { type: String },
      senderNumber: { type: String },
      transactionId: { type: String },
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { type: String, required: true }, // Snapshots title
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times in Next.js hot-reload
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
