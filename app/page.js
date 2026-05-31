"use client";

import { useEffect, useState, useMemo } from "react";
import { useCart } from "@/app/context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const { addToCart, toast } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
    <div className="flex-1 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-200 dark:border-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 dark:from-indigo-950/20 via-white dark:via-zinc-950 to-zinc-50 dark:to-zinc-950 transition-colors duration-300">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 mb-4 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            MongoDB Powered Storefront
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            Discover Premium <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Tech & Gear</span>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Explore our curated catalog of high-quality electronics, accessories, and home goods sourced directly from our live database.
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors duration-300">
          {/* Search Input Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    // Also trigger search reset immediately when cleared
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-indigo-500/30"
            >
              Search
            </button>
          </form>

          {/* Sort Selection */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
            >
              <option value="default">Newest Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {!loading && products.length > 0 && (
          <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
            {categoriesData.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-900/10"
                      : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm dark:shadow-none"
                  }`}
                >
                  {cat.name}
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-indigo-500 text-white animate-pulse" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Showcase Counter */}
        <div className="flex items-center justify-between mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <span className="font-semibold text-zinc-900 dark:text-white">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">{products.length}</span> products
          </div>
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
          /* Main Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const reviewStars = 4 + (product.title.length % 2 === 0 ? 0.5 : 0);
              const reviewCount = 12 + (product.title.charCodeAt(0) % 50);

              return (
                <div
                  key={product._id}
                  className="group relative bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800/80 rounded-2xl p-4 flex flex-col h-[400px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none cursor-pointer"
                >
                  {/* Category Indicator Tag */}
                  <span className="absolute top-6 left-6 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-zinc-100/90 dark:bg-zinc-950/90 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800/60 backdrop-blur-md">
                    {product.category || "General"}
                  </span>

                  {/* Image container */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center">
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
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 line-clamp-1 leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-zinc-150 dark:bg-zinc-900 w-full my-4" />

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
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
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
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-10 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} NexusStore Inc. All rights reserved. Powered by MongoDB & Next.js.
          </div>
          <div className="flex gap-4 text-xs text-zinc-500">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Floating Success Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-500 text-zinc-900 dark:text-zinc-100 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/40">
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-semibold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
