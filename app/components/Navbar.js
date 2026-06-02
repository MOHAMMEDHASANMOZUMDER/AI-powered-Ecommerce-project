"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { cartCount, toast } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [navbarSearch, setNavbarSearch] = useState("");

  // Slide Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("login"); // 'login' | 'signup'
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [drawerSuccess, setDrawerSuccess] = useState("");

  // Drawer Form Inputs
  const [drawerEmail, setDrawerEmail] = useState("");
  const [drawerPassword, setDrawerPassword] = useState("");
  const [drawerName, setDrawerName] = useState("");
  const [drawerLastName, setDrawerLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic Theme switcher
  const [theme, setTheme] = useState("dark");

  // Load user and theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  // Drawer Submit Actions
  const handleDrawerLogin = async (e) => {
    e.preventDefault();
    setDrawerError("");
    setDrawerSuccess("");

    if (!drawerEmail || !drawerPassword) {
      setDrawerError("Email and password are required");
      return;
    }

    setDrawerLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: drawerEmail, password: drawerPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setDrawerSuccess("Login successful!");
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setTimeout(() => {
        setIsDrawerOpen(false);
        setDrawerEmail("");
        setDrawerPassword("");
        window.location.reload();
      }, 800);

    } catch (err) {
      setDrawerError(err.message);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDrawerSignup = async (e) => {
    e.preventDefault();
    setDrawerError("");
    setDrawerSuccess("");

    if (!drawerName || !drawerEmail || !drawerPassword) {
      setDrawerError("Name, Email and Password are required");
      return;
    }

    if (drawerPassword.length < 6) {
      setDrawerError("Password must be at least 6 characters");
      return;
    }

    setDrawerLoading(true);
    const fullName = `${drawerName} ${drawerLastName}`.trim();
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email: drawerEmail, password: drawerPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setDrawerSuccess("Account created successfully!");
      if (data.verificationUrl) {
        // Automatically open local verification link for testing convenience
        window.location.href = data.verificationUrl;
      } else {
        setTimeout(() => {
          setDrawerMode("login");
          setDrawerSuccess("Please log in with your credentials.");
        }, 1500);
      }

    } catch (err) {
      setDrawerError(err.message);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navbarSearch.trim() !== "") {
      window.location.href = `/?q=${encodeURIComponent(navbarSearch)}`;
    }
  };

  const vapeCategories = [
    { name: "ELECTRONICS", dbName: "Electronics" },
    { name: "ACCESSORIES", dbName: "Accessories" },
    { name: "HOME DECOR", dbName: "Home Decor" },
    { name: "HOME APPLIANCES", dbName: "Home Appliances" },
    { name: "PERSONAL CARE", dbName: "Personal Care" },
    { name: "SPORTS", dbName: "Sports" },
    { name: "STATIONERY", dbName: "Stationery" },
    { name: "CLOTHING", dbName: "Clothing" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950 text-white transition-colors duration-300">
      {/* Top Banner (Welcome Message from Screenshot) */}
      <div className="bg-zinc-900 text-zinc-400 text-[10px] sm:text-xs py-1.5 border-b border-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>Welcome to NexusStore - Your Premium AI-Powered E-Commerce Storefront!</span>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer border-none bg-transparent py-0 px-1 text-zinc-400 font-medium"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05L5.75 4.35a1 1 0 10-1.41 1.41l.71.71zm10.61 10.606a1 1 0 101.41-1.41l-.7-.7a1 1 0 10-1.42 1.42l.7.7zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <span className="text-zinc-700">|</span>
            <Link href="/auth" className="hover:text-white transition-colors">My Account</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand/Logo (Screenshot styled) */}
        <Link href="/" className="flex flex-col items-start shrink-0 group">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white select-none">
            <span className="text-electric-500 font-black">Nexus</span>Store
          </span>
          <span className="text-[9px] tracking-[0.25em] text-zinc-500 font-bold -mt-1 uppercase">
            PREMIUM ELECTRONICS
          </span>
        </Link>

        {/* Centered Keyword Search Bar (Screenshot styled) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Enter your keyword..."
            value={navbarSearch}
            onChange={(e) => setNavbarSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all"
          />
          <button type="submit" className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Actions (Cart & Sign In) */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Checkout Page Link */}
          <Link href="/about" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            About Us
          </Link>

          {/* Cart Icon Drawer Link */}
          <Link
            href="/checkout"
            className="relative p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 bg-electric-500 text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            ) : (
              <span className="absolute top-0.5 right-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center">
                0
              </span>
            )}
          </Link>

          {/* Dynamic Desktop User Auth */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-3">
              <Link
                href="/auth"
                className="text-xs font-bold text-electric-400 hover:text-electric-300 transition-colors"
              >
                Hi, {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-rose-500 text-xs font-bold rounded-lg transition-all border border-zinc-850 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setDrawerMode("login");
                setIsDrawerOpen(true);
              }}
              className="px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Vape Category Navigation Bar (Bottom Section of Header from Screenshot) */}
      <div className="bg-zinc-950 border-t border-zinc-900 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <nav className="flex items-center gap-8">
            {vapeCategories.map((cat) => {
              const filterPath = `/?category=${cat.dbName}`;
              const activeCategory = searchParams.get("category") || "All";
              const isActive = activeCategory === cat.dbName;
              return (
                <Link
                  key={cat.name}
                  href={filterPath}
                  className={`text-xs font-bold tracking-widest transition-all hover:text-electric-400 relative py-1 ${
                    isActive ? "text-electric-400 font-extrabold border-b-2 border-electric-500" : "text-zinc-200"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="md:hidden px-4 pb-3 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Enter your keyword..."
            value={navbarSearch}
            onChange={(e) => setNavbarSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-lg pl-4 pr-10 py-2 text-xs focus:outline-none focus:border-electric-500"
          />
          <button type="submit" className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Slide Drawer: LOG IN & Sign Up (Exact Replica of media__1780379704520.png) */}
      {isDrawerOpen && (
        <>
          {/* Overlay backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white text-zinc-900 z-50 shadow-2xl p-6 flex flex-col justify-start overflow-y-auto transform transition-transform duration-300 animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
                {drawerMode === "login" ? "LOG IN" : "CREATE ACCOUNT"}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-zinc-500 hover:text-zinc-950"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error & Success States */}
            {drawerError && (
              <div className="my-4 p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100 animate-pulse">
                ⚠️ {drawerError}
              </div>
            )}
            {drawerSuccess && (
              <div className="my-4 p-3.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 animate-bounce">
                🎉 {drawerSuccess}
              </div>
            )}

            {/* Form Section */}
            {drawerMode === "login" ? (
              <form onSubmit={handleDrawerLogin} className="flex flex-col gap-5 mt-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={drawerEmail}
                    onChange={(e) => setDrawerEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Password <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={drawerPassword}
                    onChange={(e) => setDrawerPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-950 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={drawerLoading}
                  className="w-full mt-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-colors border-none disabled:opacity-50 cursor-pointer shadow-sm shadow-zinc-950/20"
                >
                  {drawerLoading ? "Logging In..." : "LOG IN"}
                </button>

                <div className="flex flex-col items-center gap-2 mt-4 text-xs font-semibold">
                  <Link href="/auth?tab=forgot" onClick={() => setIsDrawerOpen(false)} className="text-zinc-400 hover:text-zinc-950 transition-colors">
                    Forgot password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerMode("signup");
                      setDrawerError("");
                    }}
                    className="text-zinc-500 hover:text-electric-500 transition-colors uppercase font-bold text-[10px] tracking-wider mt-2 border-none bg-transparent cursor-pointer"
                  >
                    Don't have an account? <span className="underline font-black text-zinc-950">CREATE ONE HERE.</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDrawerSignup} className="flex flex-col gap-4.5 mt-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={drawerName}
                    onChange={(e) => setDrawerName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={drawerLastName}
                    onChange={(e) => setDrawerLastName(e.target.value)}
                    placeholder="Your last name"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={drawerEmail}
                    onChange={(e) => setDrawerEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={drawerPassword}
                    onChange={(e) => setDrawerPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={drawerLoading}
                  className="w-full mt-3 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-colors border-none disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {drawerLoading ? "Creating Account..." : "SAVE INFORMATION"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerMode("login");
                    setDrawerError("");
                  }}
                  className="text-center text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase mt-3 border-none bg-transparent cursor-pointer underline"
                >
                  Back to login
                </button>
              </form>
            )}

            {/* Quick Links Footer in Drawer from Screenshot */}
            <div className="mt-auto pt-8 border-t border-zinc-100 flex flex-col gap-3 text-xs font-bold text-zinc-500">
              <Link href="/checkout" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-2 hover:text-zinc-950">
                ❤️ Wish List (0)
              </Link>
              <Link href="/about" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-2 hover:text-zinc-950">
                ✉️ Contact us
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
