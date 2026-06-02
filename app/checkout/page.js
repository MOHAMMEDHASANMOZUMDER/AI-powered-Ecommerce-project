"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function Checkout() {
  const {
    cart,
    addToCart,
    removeFromCart,
    deleteFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  } = useCart();

  // Shipping Form State (Added 'phone' to prevent controlled-input warnings)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // 'stripe' (card), 'cash_on_delivery', 'bkash', 'nagad'

  // Credit Card State
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Mobile Banking State (bKash & Nagad)
  const [mobileBankingData, setMobileBankingData] = useState({
    number: "",
    transactionId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number to add spaces every 4 digits
    if (name === "number") {
      value = value
        .replace(/\s?/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19); // 16 digits + 3 spaces
    }
    
    // Format expiry (MM/YY)
    if (name === "expiry") {
      value = value
        .replace(/\//g, "")
        .replace(/(\d{2})/g, "$1/")
        .replace(/\/$/, "")
        .slice(0, 5);
    }

    // Restrict CVV to 3-4 digits
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileBankingChange = (e) => {
    const { name, value } = e.target;
    setMobileBankingData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    const generatedOrderNum = "NEX-" + Math.floor(100000 + Math.random() * 900000);

    // Format payment details based on selection
    let paymentDetails = {};
    if (paymentMethod === "stripe") {
      paymentDetails = {
        cardHolder: cardData.name,
        cardNumberLast4: cardData.number.replace(/\s/g, "").slice(-4),
      };
    } else if (paymentMethod === "bkash" || paymentMethod === "nagad") {
      paymentDetails = {
        senderNumber: mobileBankingData.number,
        transactionId: mobileBankingData.transactionId,
      };
    }

    // Format items schema payload
    const itemsPayload = cart.map(({ product, quantity }) => ({
      product: product._id,
      title: product.title,
      quantity: quantity,
      priceAtPurchase: product.price,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: generatedOrderNum,
          shippingAddress: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            address: formData.address,
            city: formData.city,
            zip: formData.zip,
          },
          paymentMethod,
          paymentDetails,
          items: itemsPayload,
          subtotal: cartTotal,
          tax,
          total: finalTotal,
        }),
      });

      if (response.ok) {
        setOrderNumber(generatedOrderNum);
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        alert(`Checkout Error: ${errorData.error || "Failed to process your order. Please try again."}`);
      }
    } catch (error) {
      console.error("Failed to place e-commerce checkout order:", error);
      alert("A system connection error occurred. Please verify your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmOrderAndReset = () => {
    setShowSuccessModal(false);
    clearCart();
    // Redirect logic handled by Link in modal button
  };

  // Pricing calculations (Tax removed, Taka transition)
  const tax = 0; // Tax removed
  const shippingCost = 0; // Free shipping
  const finalTotal = cartTotal + shippingCost;

  // Custom button label based on payment choice
  const getButtonText = () => {
    if (paymentMethod === "stripe") return `Place Order (${finalTotal.toFixed(0)} TK)`;
    if (paymentMethod === "bkash") return `Verify bKash (${finalTotal.toFixed(0)} TK)`;
    if (paymentMethod === "nagad") return `Verify Nagad (${finalTotal.toFixed(0)} TK)`;
    return `Confirm Order (${finalTotal.toFixed(0)} TK)`;
  };

  return (
    <div className="flex-1 flex flex-col font-sans transition-colors duration-300">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-8">
          Secured Checkout
        </h1>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900/10 rounded-3xl border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none my-auto">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 dark:text-zinc-500 mb-6 animate-pulse">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-zinc-500 max-w-sm mb-8 text-sm">
              Looks like you haven't added any products to your catalog workspace yet. Let's find some premium gear.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-electric-600 hover:bg-electric-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-electric-600/10 hover:shadow-electric-600/20 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back to Catalog
            </Link>
          </div>
        ) : (
          /* Checkout Grid Container */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Order breakdown (7 cols on large screens) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>Shopping Cart Breakdown</span>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    {cartCount} items
                  </span>
                </h2>

                {/* Items List */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {cart.map(({ product, quantity }) => (
                    <div key={product._id} className="py-4 flex gap-4 items-center">
                      {/* Image Thumbnail */}
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex-shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {product.title}
                        </h3>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">
                          {product.category || "General"}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1.5 gap-2.5">
                        <button
                          type="button"
                          onClick={() => removeFromCart(product._id)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white w-4 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Individual Price Calculation */}
                      <div className="text-right min-w-[75px]">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {(product.price * quantity).toFixed(0)} TK
                        </span>
                      </div>

                      {/* Full delete trash button */}
                      <button
                        onClick={() => deleteFromCart(product._id)}
                        className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all cursor-pointer"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sub-Pricing Summary */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{cartTotal.toFixed(0)} TK</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Express Shipping</span>
                    <span className="font-semibold text-electric-600 dark:text-electric-400 uppercase tracking-wider text-[10px] bg-electric-500/10 px-2 py-0.5 rounded-full border border-electric-500/20">
                      Free
                    </span>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                    <span>Total Amount</span>
                    <span>{finalTotal.toFixed(0)} TK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Checkout Form & Interactive Card Preview */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-5 flex flex-col gap-8 w-full">
              
              {/* PAYMENT & SHIPPING DETAILS FORM PANEL */}
              <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col gap-5">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Shipping & Settlement Details</h2>
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="John Doe"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="01XXXXXXXXX"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email Address (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="abc@example.com"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                  />
                </div>

                {/* Shipping Address */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="address" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Road, Area"
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                  />
                </div>

                {/* City & Zip (Inline) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="city" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleFormChange}
                      placeholder="Dhaka"
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="zip" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Zip Code</label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleFormChange}
                      placeholder="1207"
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                    />
                  </div>
                </div>

                {/* PREMIUM PAYMENT METHOD CARDS SELECTOR */}
                <div className="flex flex-col gap-2.5 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-250 cursor-pointer active:scale-[0.97] ${
                        paymentMethod === "cash_on_delivery"
                          ? "border-electric-500 bg-electric-500/5 text-electric-600 dark:text-electric-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">Cash on Delivery</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">Doorstep settlement</span>
                      </div>
                    </button>

                    {/* Stripe / Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-250 cursor-pointer active:scale-[0.97] ${
                        paymentMethod === "stripe"
                          ? "border-electric-500 bg-electric-500/5 text-electric-600 dark:text-electric-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">Credit Card</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">Visa, Mastercard</span>
                      </div>
                    </button>

                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bkash")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-250 cursor-pointer active:scale-[0.97] ${
                        paymentMethod === "bkash"
                          ? "border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="h-5.5 w-5.5 rounded-lg bg-pink-500 text-white flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 shadow-sm shadow-pink-500/10">
                        bK
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">bKash Pay</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">Instant mobile banking</span>
                      </div>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("nagad")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-250 cursor-pointer active:scale-[0.97] ${
                        paymentMethod === "nagad"
                          ? "border-orange-500 bg-orange-500/5 text-orange-600 dark:text-orange-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="h-5.5 w-5.5 rounded-lg bg-orange-500 text-white flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 shadow-sm shadow-orange-500/10">
                        N
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">Nagad Pay</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">Instant mobile banking</span>
                      </div>
                    </button>

                  </div>
                </div>

                {/* CONDITIONAL PAYMENT INPUTS */}

                {/* STRIPE / CARD FIELDS */}
                {paymentMethod === "stripe" && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-col gap-4 animate-fade-in">
                    
                    {/* INTERACTIVE CREDIT CARD VISUAL */}
                    <div className="relative h-44 w-full rounded-2xl bg-gradient-to-tr from-navy-950 via-navy-900 to-electric-600 p-5 flex flex-col justify-between text-white shadow-lg border border-electric-500/20 dark:border-electric-550/10 backdrop-blur-md overflow-hidden">
                      <div className="absolute -top-12 -right-12 h-36 w-36 bg-ice-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 h-36 w-36 bg-electric-500/20 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex justify-between items-center z-10">
                        <div className="h-6 w-9 rounded bg-zinc-200/20 backdrop-blur-md border border-white/10 flex flex-col gap-0.5 p-1">
                          <div className="h-full bg-amber-400/40 rounded-sm w-3/4" />
                        </div>
                        <span className="text-[9px] font-extrabold tracking-widest text-ice-200">
                          NEXUS CARD
                        </span>
                      </div>

                      <div className="text-lg font-bold tracking-[0.2em] font-mono z-10 text-center">
                        {cardData.number || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between items-end z-10 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-ice-200 uppercase tracking-wider">Card Holder</span>
                          <span className="font-bold truncate max-w-[170px]">
                            {cardData.name.toUpperCase() || "YOUR FULL NAME"}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] text-ice-200 uppercase tracking-wider">Expires</span>
                          <span className="font-bold font-mono">
                            {cardData.expiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Credit Card Information</h3>
                    
                    {/* Cardholder Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="card_name" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name on Card</label>
                      <input
                        type="text"
                        id="card_name"
                        name="name"
                        required
                        value={cardData.name}
                        onChange={handleCardChange}
                        placeholder="Johnathan Doe"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-medium"
                      />
                    </div>

                    {/* Card Number */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="card_number" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Card Number</label>
                      <input
                        type="text"
                        id="card_number"
                        name="number"
                        required
                        value={cardData.number}
                        onChange={handleCardChange}
                        placeholder="4111 2222 3333 4444"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-mono font-medium"
                      />
                    </div>

                    {/* Expiry & CVV (Inline) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="card_expiry" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          id="card_expiry"
                          name="expiry"
                          required
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-mono font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="card_cvv" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">CVV Code</label>
                        <input
                          type="password"
                          id="card_cvv"
                          name="cvv"
                          required
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="•••"
                          className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 font-mono font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* bKASH MOBILE WALLET FIELDS */}
                {paymentMethod === "bkash" && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-col gap-4 animate-fade-in">
                    
                    {/* bKash Instructions Card */}
                    <div className="relative rounded-2xl bg-gradient-to-tr from-pink-600 via-pink-700 to-pink-500 p-5 text-white shadow-lg border border-pink-500/20 backdrop-blur-md overflow-hidden">
                      <div className="absolute -top-12 -right-12 h-36 w-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-pink-100 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        bKash Merchant Settlement
                      </h3>
                      <ol className="list-decimal list-inside text-xs mt-3 flex flex-col gap-2 text-pink-50 leading-relaxed font-semibold">
                        <li>Send payment <span className="font-extrabold text-white text-xs bg-white/10 px-2 py-0.5 rounded">{finalTotal.toFixed(0)} TK</span> to Wallet **01999988776**</li>
                        <li>Enter your mobile account number and the Transaction ID (TrxID) below.</li>
                      </ol>
                    </div>

                    {/* bKash Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bkash_number" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">bKash Phone Number</label>
                      <input
                        type="text"
                        id="bkash_number"
                        name="number"
                        required
                        value={mobileBankingData.number}
                        onChange={handleMobileBankingChange}
                        placeholder="017XXXXXXXX"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200 font-mono"
                      />
                    </div>

                    {/* bKash TrxID */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bkash_trx" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        id="bkash_trx"
                        name="transactionId"
                        required
                        value={mobileBankingData.transactionId}
                        onChange={handleMobileBankingChange}
                        placeholder="A1B2C3D4E5"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200 font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* NAGAD MOBILE WALLET FIELDS */}
                {paymentMethod === "nagad" && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-col gap-4 animate-fade-in">
                    
                    {/* Nagad Instructions Card */}
                    <div className="relative rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-700 to-orange-500 p-5 text-white shadow-lg border border-orange-500/20 backdrop-blur-md overflow-hidden">
                      <div className="absolute -top-12 -right-12 h-36 w-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        Nagad Merchant Settlement
                      </h3>
                      <ol className="list-decimal list-inside text-xs mt-3 flex flex-col gap-2 text-orange-50 leading-relaxed font-semibold">
                        <li>Send payment <span className="font-extrabold text-white text-xs bg-white/10 px-2 py-0.5 rounded">{finalTotal.toFixed(0)} TK</span> to Wallet **01888877665**</li>
                        <li>Enter your mobile account number and the Transaction ID below.</li>
                      </ol>
                    </div>

                    {/* Nagad Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="nagad_number" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nagad Phone Number</label>
                      <input
                        type="text"
                        id="nagad_number"
                        name="number"
                        required
                        value={mobileBankingData.number}
                        onChange={handleMobileBankingChange}
                        placeholder="018XXXXXXXX"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 font-mono"
                      />
                    </div>

                    {/* Nagad Trx ID */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="nagad_trx" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        id="nagad_trx"
                        name="transactionId"
                        required
                        value={mobileBankingData.transactionId}
                        onChange={handleMobileBankingChange}
                        placeholder="N8M7K6L5J4"
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* CASH ON DELIVERY ANNOUNCEMENT BOX */}
                {paymentMethod === "cash_on_delivery" && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 animate-fade-in">
                    <div className="flex gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350">
                      <div className="h-10 w-10 rounded-xl bg-electric-500/10 text-electric-650 dark:text-ice-300 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1 text-sm">
                        <h4 className="font-bold text-zinc-900 dark:text-white">Cash on Delivery Selected</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-405 leading-relaxed font-medium">
                          Your settlement request will process instantly. No advance verification is required. Simply hand the cash to our delivery executive when your parcel arrives.
                        </p>
                        <span className="text-[10px] text-electric-600 dark:text-electric-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-electric-500 animate-pulse" />
                          Standard Delivery: 2-3 Business Days
                        </span>
                      </div>
                    </div>
                  </div>
                )}
 
                {/* Complete Payment Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-electric-600 to-electric-650 hover:from-electric-500 hover:to-electric-600 disabled:from-electric-600/50 disabled:to-electric-650/50 text-white font-bold text-sm rounded-xl shadow-lg shadow-electric-600/10 hover:shadow-electric-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying Transaction...
                    </>
                  ) : (
                    <>
                      {getButtonText()}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Dynamic Success Modal Backdrop */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 max-w-md w-full rounded-3xl p-8 text-center shadow-2xl transition-colors duration-300">
            {/* Success icon */}
            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Modal Head */}
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
              Purchase Completed!
            </h2>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
              Thank you for shopping at NexusStore! Your settlement request has been processed successfully.
            </p>

            {/* Receipt block */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-left mb-8">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Receipt No.</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Recipient</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-bold">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Deliver To</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-bold truncate max-w-[200px]">
                  {formData.address}, {formData.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Payment Method</span>
                <span className="text-zinc-800 dark:text-zinc-300 font-bold uppercase">
                  {paymentMethod === "stripe" ? "Credit Card" : paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full my-1.5" />
              <div className="flex justify-between text-zinc-900 dark:text-white font-extrabold">
                <span className="uppercase tracking-wider">Settled Total</span>
                <span>{finalTotal.toFixed(0)} TK</span>
              </div>
            </div>

            {/* Return to Catalog button */}
            <Link
              href="/"
              onClick={confirmOrderAndReset}
              className="w-full block py-3.5 bg-electric-600 hover:bg-electric-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-electric-600/10 hover:shadow-electric-650/20 transition-all duration-200 cursor-pointer active:scale-95 text-center"
            >
              Close & Reset Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
