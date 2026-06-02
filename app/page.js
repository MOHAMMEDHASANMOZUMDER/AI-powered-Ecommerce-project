"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useCart } from "@/app/context/CartContext";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: "bot", 
      text: "👋 Hello! I am your NexusStore Assistant. Ask me to recommend products, track your orders (try tracking `NEX-883192`), or inquire about our store policies and FAQs!" 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const { addToCart, toast } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Clean and read search/category query params from Next.js URL hook
        const query = searchParams.get("q") || searchParams.get("search") || "";
        const cat = searchParams.get("category") || "All";

        setSelectedCategory(cat);

        if (query) {
          setSearchQuery(query);
          const response = await fetch("/api/ai_search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          setSearchQuery("");
          const response = await fetch("/api/products");
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      if (searchQuery.trim() === "") {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        const response = await fetch("/api/ai_search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error performing AI search:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text || text.trim() === "") return;
    
    // Add user message
    const userMsg = { sender: "user", text };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setChatLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply, products: data.products }
      ]);
    } catch (error) {
      console.error("Chatbot communication error:", error);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, I am having trouble connecting to my brain right now! Please try again in a moment." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatMessageText = (text) => {
    if (!text) return "";
    // Regex split by bold patterns **word** and code blocks `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="bg-ice-50 dark:bg-navy-900/40 text-electric-600 dark:text-ice-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-ice-100/30 dark:border-navy-800/30">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Get dynamic categories list with count
  const categoriesData = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    return [
      { name: "All", count: products.length },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="flex-1 flex flex-col font-sans antialiased selection:bg-electric-500 selection:text-white">
      {/* Full-Width Atmospheric Laser Hero Promo Slider */}
      {selectedCategory === "All" && searchQuery.trim() === "" && (
        <section className="relative overflow-hidden py-20 bg-zinc-950 border-b border-zinc-900 select-none">
          {/* Neon absolute blur lights representing Caliburn/XROS neon green-laser vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-zinc-950 to-navy-950" />
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Simulated neon laser diagonal grids from the screenshots */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent rotate-3 transform scale-x-125" />
            <div className="absolute top-2/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-electric-400 to-transparent -rotate-6 transform scale-x-125" />
            <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent rotate-1 transform scale-x-125" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Promo Text */}
            <div className="flex flex-col items-start text-left max-w-xl md:w-1/2">              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 uppercase leading-none">
                PREMIUM TECH & <br />
                <span className="text-electric-500 bg-gradient-to-r from-electric-400 to-emerald-400 bg-clip-text text-transparent">MODERN GEAR</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base font-medium mb-8">
                Explore our curated catalog of high-quality electronics, accessories, and home goods sourced directly from our live database.
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById("catalog-grid");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-electric-600 hover:bg-electric-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-electric-600/20 hover:scale-[1.01] cursor-pointer border-none"
              >
                DISCOVER PRODUCTS
              </button>
            </div>

            {/* Simulated 3D Vape Silhouette Graphic Mockup from Screenshot */}
            <div className="relative w-full max-w-md h-64 md:w-1/2 flex items-center justify-center pointer-events-none hidden md:flex">
              {/* Glassmorphic Cyber Device Mockup Panel */}
              <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">HARDWARE SPEC</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[9px] font-black">ONLINE CONNECTED</span>
                </div>
                <div className="my-auto flex flex-col items-center">
                  <div className="w-10 h-28 bg-gradient-to-b from-zinc-800 via-zinc-700 to-zinc-900 border border-zinc-700/80 rounded-xl relative flex flex-col justify-between p-2 shadow-2xl">
                    <div className="w-full h-3 bg-electric-500/20 rounded-md border border-electric-500/30 animate-pulse flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-electric-400" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center self-center my-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
                    </div>
                    <div className="w-full h-6 bg-zinc-950 border border-zinc-850 rounded-md text-[7px] font-black text-center text-zinc-400 flex items-center justify-center uppercase tracking-widest font-mono">
                      OCTA
                  </div>
                  </div>
                  <span className="text-[10px] font-black text-zinc-300 mt-3 tracking-wider uppercase">Smart Hub Console</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sleek Catalog Header with Heading on Left and Sort on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-zinc-200/60 dark:border-navy-900/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              {selectedCategory === "All" ? "Explore Catalog" : `Browse ${selectedCategory}`}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
              Discover authentic products directly from our MongoDB cluster
            </p>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-navy-950 border border-zinc-200 dark:border-navy-800 rounded-xl px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 cursor-pointer font-bold shadow-sm dark:shadow-none"
            >
              <option value="default">Newest Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Showcase Counter & Filter Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <span className="font-semibold text-zinc-900 dark:text-white">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">{products.length}</span> products
          </div>

          {/* Elegant active category chip indicator */}
          {selectedCategory !== "All" && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-450">Active Category:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-electric-500/10 text-electric-600 dark:text-electric-400 border border-electric-500/20 rounded-full text-xs font-extrabold shadow-sm">
                {selectedCategory}
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    // Clear the category from URL query parameters
                    const url = new URL(window.location.href);
                    url.searchParams.delete("category");
                    window.history.pushState({}, "", url.toString());
                  }}
                  className="hover:text-rose-500 transition-colors cursor-pointer ml-0.5 shrink-0"
                  title="Clear Category Filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          /* Shimmer Loading Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900/80 rounded-2xl p-4 flex flex-col h-[380px] animate-pulse"
              >
                <div className="w-full h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3 mb-3" />
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 mb-2" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mb-auto" />
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-zinc-150 dark:border-zinc-900">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/4" />
                  <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Search State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900/10 rounded-3xl border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 dark:text-zinc-600 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No products found</h3>
            <p className="text-zinc-500 max-w-sm">
              We couldn't find any products matching your current criteria. Try resetting your search or filters.
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  const resetSearch = async () => {
                    try {
                      setLoading(true);
                      const response = await fetch("/api/products");
                      const data = await response.json();
                      setProducts(data.products || []);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setLoading(false);
                    }
                  };
                  resetSearch();
                }}
                className="mt-5 px-5 py-2.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white transition-all duration-200 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Main Products Grid */}
            {filteredProducts.map((product) => {
              const reviewStars = 4 + (product.title.length % 2 === 0 ? 0.5 : 0);
              const reviewCount = 12 + (product.title.charCodeAt(0) % 50);

              return (
                <div
                  key={product._id}
                  className="group relative bg-white dark:bg-navy-900/30 border border-zinc-200 dark:border-navy-900/80 hover:border-electric-500/50 dark:hover:border-electric-500/50 rounded-2xl p-4 flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-electric-500/5 dark:hover:shadow-electric-500/3 cursor-pointer"
                >
                  {/* Category Indicator Tag */}
                  <span className="absolute top-6 left-6 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-zinc-100/90 dark:bg-navy-950/90 text-electric-600 dark:text-ice-300 border border-zinc-200 dark:border-navy-800/60 backdrop-blur-md">
                    {product.category || "General"}
                  </span>
                  
                  {/* Top Right impulse badge */}
                  <span className="absolute top-6 right-6 z-10 px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black tracking-widest uppercase animate-pulse shadow-sm">
                    {product.title.length % 2 === 0 ? "HOT" : "SALE"}
                  </span>

                  {/* Image container */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-zinc-50 dark:bg-navy-950 border border-zinc-200 dark:border-navy-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Rating indicator */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`w-3.5 h-3.5 ${
                            starIndex < Math.floor(reviewStars)
                              ? "fill-current"
                              : "text-zinc-300 dark:text-zinc-700 stroke-current"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                      {reviewStars} ({reviewCount})
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col mb-auto">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-electric-600 dark:group-hover:text-ice-300 transition-colors duration-200 line-clamp-1 leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-zinc-150 dark:bg-navy-900 w-full my-4" />

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Price</span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">
                        {product.price ? product.price.toFixed(0) : "0"} TK
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-electric-600/10 hover:shadow-electric-600/20 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-navy-900 bg-white dark:bg-navy-950 py-10 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} NexusStore Inc. All rights reserved. Powered by MongoDB & Next.js.
          </div>
          <div className="flex gap-4 text-xs text-zinc-500">
            <a href="#" className="hover:text-electric-600 dark:hover:text-ice-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-electric-600 dark:hover:text-ice-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-electric-600 dark:hover:text-ice-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Floating Chat Assistant - Repositioned to Bottom-Left Corner */}
      <div className="fixed bottom-6 left-6 z-45 flex flex-col items-start">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="mb-4 w-92 max-w-[calc(100vw-2rem)] h-[500px] bg-white/95 dark:bg-navy-950/98 border border-zinc-200 dark:border-navy-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-fade-in transition-all duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white flex items-center justify-between shadow-md border-b border-navy-850/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-none">Nexus AI Assistant</h4>
                  <span className="text-[10px] opacity-75">AI Customer Service & Sales</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-lg bg-ice-50 dark:bg-navy-900/40 text-electric-600 dark:text-ice-300 flex items-center justify-center shrink-0 border border-ice-100/30 dark:border-navy-800/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1.5 max-w-[80%]">
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                      msg.sender === "user" 
                        ? "bg-electric-600 border-electric-700 text-white rounded-tr-none" 
                        : "bg-zinc-50 dark:bg-navy-900/40 border-zinc-150 dark:border-navy-850 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                    }`}>
                      {formatMessageText(msg.text)}
                    </div>
                    
                    {/* Inline Products Showcase */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        {msg.products.map((prod) => (
                          <div 
                            key={prod._id}
                            className="flex items-center gap-3 p-2 bg-white dark:bg-navy-900/50 border border-zinc-200 dark:border-navy-800 rounded-xl hover:border-electric-500 transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={prod.image || "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"} 
                              alt={prod.title}
                              className="w-12 h-12 object-cover rounded-lg bg-zinc-50 dark:bg-navy-950 border border-zinc-150 dark:border-navy-900"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">{prod.title}</h5>
                              <span className="text-[11px] font-extrabold text-electric-600 dark:text-ice-400">{prod.price.toFixed(0)} TK</span>
                            </div>
                            <button 
                              onClick={() => {
                                addToCart(prod);
                                toast(`Added "${prod.title}" to cart from chat!`);
                              }}
                              className="px-2.5 py-1.5 bg-electric-600 hover:bg-electric-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {chatLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-ice-50 dark:bg-navy-900/40 text-electric-600 dark:text-ice-300 flex items-center justify-center shrink-0 border border-ice-100/30 dark:border-navy-800/30">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                    </svg>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-navy-900/40 border border-zinc-150 dark:border-navy-800 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            {chatMessages.length === 1 && !chatLoading && (
              <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 shrink-0 bg-transparent">
                <button 
                  onClick={() => sendChatMessage("Show me gaming keyboards")}
                  className="px-2.5 py-1 border border-ice-200 dark:border-navy-800 bg-ice-50/20 dark:bg-navy-950/15 text-electric-600 dark:text-ice-400 hover:bg-electric-600 hover:text-white dark:hover:bg-electric-650 dark:hover:text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                >
                  🎮 Gaming gear
                </button>
                <button 
                  onClick={() => sendChatMessage("Track order NEX-883192")}
                  className="px-2.5 py-1 border border-ice-200 dark:border-navy-800 bg-ice-50/20 dark:bg-navy-950/15 text-electric-600 dark:text-ice-400 hover:bg-electric-600 hover:text-white dark:hover:bg-electric-650 dark:hover:text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                >
                  📦 Track NEX-883192
                </button>
                <button 
                  onClick={() => sendChatMessage("What is your refund policy?")}
                  className="px-2.5 py-1 border border-ice-200 dark:border-navy-800 bg-ice-50/20 dark:bg-navy-950/15 text-electric-600 dark:text-ice-400 hover:bg-electric-600 hover:text-white dark:hover:bg-electric-650 dark:hover:text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                >
                  🔄 Refund Policy
                </button>
              </div>
            )}

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
              className="p-3 bg-zinc-50 dark:bg-navy-980 border-t border-zinc-200 dark:border-navy-900 flex gap-2"
            >
              <input 
                type="text"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="flex-1 bg-white dark:bg-navy-950 border border-zinc-250 dark:border-navy-850 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 disabled:opacity-50 font-medium"
              />
              <button 
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-3 bg-electric-600 hover:bg-electric-500 disabled:bg-zinc-300 dark:disabled:bg-navy-900 text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-4 bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-electric-450 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group relative"
        >
          {isChatOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {/* Unread notification ping */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-navy-950 rounded-full animate-ping animate-duration-1000" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-navy-950 rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Floating Success Toast */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-navy-900 border border-electric-500 text-zinc-900 dark:text-zinc-100 shadow-2xl shadow-electric-500/10 dark:shadow-navy-950/40">
            <div className="h-6 w-6 rounded-lg bg-electric-500/10 text-electric-650 dark:text-ice-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <svg className="w-8 h-8 animate-spin text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
        </svg>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
