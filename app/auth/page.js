"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Active Tab: 'login' | 'signup' | 'forgot' | 'reset' | 'dashboard'
    const [activeTab, setActiveTab] = useState("login");
    const [theme, setTheme] = useState("dark");

    // Form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Tokens/Alerts from query parameters
    const [resetToken, setResetToken] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState("success"); // 'success' | 'error'

    // Loading and progress states
    const [loading, setLoading] = useState(false);

    // Dashboard & Order Tracking States
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        // Detect theme from DOM
        if (typeof window !== "undefined") {
            const isDark = document.documentElement.classList.contains("dark");
            setTheme(isDark ? "dark" : "light");
        }

        // Detect if user is already logged in
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setActiveTab("dashboard");
                fetchOrderHistory();
            }
        }

        // Detect verification success redirect (?verified=true)
        if (searchParams.get("verified") === "true") {
            setAlertMessage("🎉 Account verified successfully! You can now log in.");
            setAlertType("success");
            setActiveTab("login");
        }

        // Detect reset token parameter (?resetToken=xyz)
        const token = searchParams.get("resetToken");
        if (token) {
            setResetToken(token);
            setActiveTab("reset");
        }
    }, [searchParams]);

    // Fetch order history for the logged-in user
    const fetchOrderHistory = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch("/api/orders/history");
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch order history:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Simple password strength calculation
    const getPasswordStrength = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 6) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        return score;
    };

    const getStrengthColor = (score) => {
        if (score <= 25) return "bg-rose-500";
        if (score <= 50) return "bg-amber-500";
        if (score <= 75) return "bg-indigo-500";
        return "bg-emerald-500";
    };

    const getStrengthLabel = (score) => {
        if (score === 0) return "";
        if (score <= 25) return "Weak";
        if (score <= 50) return "Fair";
        if (score <= 75) return "Good";
        return "Strong";
    };

    // Signup Handler
    const handleSignup = async (e) => {
        e.preventDefault();
        setAlertMessage(null);

        if (!name || !email || !password) {
            setAlertMessage("All fields are required");
            setAlertType("error");
            return;
        }

        if (password.length < 6) {
            setAlertMessage("Password must be at least 6 characters long");
            setAlertType("error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to sign up");
            }

            // Local development link fallback check
            if (data.verificationUrl) {
                setAlertMessage(
                    <div>
                        <p className="font-semibold">🎉 Sign up successful!</p>
                        <p className="mt-1 text-xs opacity-90">Please use this link to verify your account in your local dev environment:</p>
                        <a 
                            href={data.verificationUrl} 
                            className="mt-2 inline-block px-3 py-1 bg-white text-indigo-600 rounded text-xs font-bold hover:bg-zinc-100 transition-colors"
                        >
                            Verify Local Account
                        </a>
                    </div>
                );
            } else {
                setAlertMessage(data.message);
            }
            setAlertType("success");
            
            // Clear fields
            setName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("error");
        } finally {
            setLoading(false);
        }
    };

    // Login Handler
    const handleLogin = async (e) => {
        e.preventDefault();
        setAlertMessage(null);

        if (!email || !password) {
            setAlertMessage("Email and password are required");
            setAlertType("error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            setAlertMessage("Login successful! Loading dashboard...");
            setAlertType("success");

            // Save Public User details (No sensitive tokens in localStorage!)
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            // Fetch order history and load dashboard
            setTimeout(() => {
                setActiveTab("dashboard");
                fetchOrderHistory();
                setAlertMessage(null);
                // Dispatch window reload to let navbar update
                window.location.reload();
            }, 1000);

        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("error");
        } finally {
            setLoading(false);
        }
    };

    // Logout Handler
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Failed to post logout request:", err);
        }
        localStorage.removeItem("user");
        setUser(null);
        setOrders([]);
        setActiveTab("login");
        window.location.reload();
    };

    // Forgot Password Request Handler
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setAlertMessage(null);

        if (!email) {
            setAlertMessage("Please enter your email address");
            setAlertType("error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }

            // Local development link fallback check
            if (data.resetUrl) {
                setAlertMessage(
                    <div>
                        <p className="font-semibold">🔑 Reset link generated!</p>
                        <p className="mt-1 text-xs opacity-90">Please use this link to set a new password locally:</p>
                        <a 
                            href={data.resetUrl} 
                            className="mt-2 inline-block px-3 py-1 bg-white text-indigo-600 rounded text-xs font-bold hover:bg-zinc-100 transition-colors"
                        >
                            Reset Local Password
                        </a>
                    </div>
                );
            } else {
                setAlertMessage(data.message);
            }
            setAlertType("success");
            setEmail("");
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("error");
        } finally {
            setLoading(false);
        }
    };

    // Reset Password Submit Handler
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setAlertMessage(null);

        if (!password || !confirmPassword) {
            setAlertMessage("Password and confirmation are required");
            setAlertType("error");
            return;
        }

        if (password !== confirmPassword) {
            setAlertMessage("Passwords do not match");
            setAlertType("error");
            return;
        }

        if (password.length < 6) {
            setAlertMessage("Password must be at least 6 characters long");
            setAlertType("error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: resetToken, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setAlertMessage("Password reset successful! You can now log in.");
            setAlertType("success");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setActiveTab("login");
                router.push("/auth");
            }, 2000);
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("error");
        } finally {
            setLoading(false);
        }
    };

    // Render Expandable Order Items Row
    const renderOrderDetails = (order) => {
        return (
            <div className="mt-3 p-4 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-900 animate-slide-down">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Order Items</h4>
                <div className="space-y-2.5">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="flex-1 pr-4">
                                <span className="font-bold text-zinc-900 dark:text-zinc-200">{item.title}</span>
                                <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 font-semibold text-[10px]">x{item.quantity}</span>
                            </div>
                            <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                                ৳{(item.priceAtPurchase * item.quantity).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-900 grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                        <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Shipping Address</span>
                        <span className="block font-semibold text-zinc-800 dark:text-zinc-300 leading-relaxed">
                            {order.shippingAddress.name}<br />
                            {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.zip}<br />
                            Phone: {order.shippingAddress.phone}
                        </span>
                    </div>
                    <div>
                        <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Payment Information</span>
                        <span className="block font-semibold text-zinc-800 dark:text-zinc-300 capitalize">
                            Method: {order.paymentMethod.replace("_", " ")}
                        </span>
                        {order.paymentDetails?.transactionId && (
                            <span className="block text-[10px] font-bold font-mono text-indigo-500 dark:text-indigo-400 mt-1">
                                TrxID: {order.paymentDetails.transactionId}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 dark:from-indigo-950/20 via-white dark:via-zinc-950 to-zinc-50 dark:to-zinc-950">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* ==================== 1. DASHBOARD VIEW (AUTHENTICATED) ==================== */}
            {activeTab === "dashboard" && user ? (
                <div className="w-full max-w-5xl relative z-10 animate-fade-in space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-900/80 backdrop-blur-md p-6 rounded-3xl shadow-xl dark:shadow-none">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-snug">
                                    Welcome back, {user.name}!
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 font-medium">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    Active Secure Session ({user.email})
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:dark:bg-rose-950/30 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 border border-rose-200/50 dark:border-rose-900/30"
                        >
                            Log Out Session
                        </button>
                    </div>

                    {/* Dashboard Split Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Profile Details (Left Panel) */}
                        <div className="bg-white/70 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-900/80 backdrop-blur-md p-6 rounded-3xl shadow-xl dark:shadow-none h-fit space-y-5">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-200/50 dark:border-zinc-850 pb-3">
                                Client Profile
                            </h3>
                            
                            <div className="space-y-4 text-xs">
                                <div>
                                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Account ID</span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300 select-all font-semibold">{user.id}</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Display Name</span>
                                    <span className="text-zinc-850 dark:text-zinc-200 font-bold">{user.name}</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Verified Email</span>
                                    <span className="text-zinc-850 dark:text-zinc-200 font-semibold">{user.email}</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] mb-0.5">Access Role</span>
                                    <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase text-[9px] inline-block tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order History & Live Tracking (Right Panel) */}
                        <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-900/80 backdrop-blur-md p-6 rounded-3xl shadow-xl dark:shadow-none space-y-4">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-200/50 dark:border-zinc-850 pb-3 flex justify-between items-center">
                                <span>Purchase & Order Tracking</span>
                                <span className="text-xs bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">
                                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                                </span>
                            </h3>

                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                                    </svg>
                                    <span className="text-xs font-semibold text-zinc-400">Syncing live order tracking database...</span>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-900">
                                        <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Orders Found Yet</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                        Your purchases and deliveries will appear here with live tracking status metrics once you place your checkout order.
                                    </p>
                                    <Link
                                        href="/"
                                        className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                                    >
                                        Explore Product Catalog
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {orders.map((order) => {
                                        const isExpanded = expandedOrder === order._id;
                                        const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        });

                                        return (
                                            <div 
                                                key={order._id}
                                                className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-800 transition-all"
                                            >
                                                {/* Header Line */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                                                                #{order.orderNumber}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-zinc-400">
                                                                ({dateStr})
                                                            </span>
                                                        </div>
                                                        <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                                                            {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} {order.items.reduce((acc, curr) => acc + curr.quantity, 0) === 1 ? "item" : "items"} • {order.paymentMethod.replace("_", " ")}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Status Badge */}
                                                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                                                            order.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                            order.status === "processing" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                                                            order.status === "cancelled" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                                                            "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                        }`}>
                                                            {order.status}
                                                        </span>

                                                        {/* Total Price */}
                                                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                                            ৳{order.total.toLocaleString()}
                                                        </span>

                                                        {/* Expand Toggle Button */}
                                                        <button
                                                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                                        >
                                                            <svg 
                                                                className={`w-4 h-4 transform transition-transform duration-350 ${isExpanded ? "rotate-180" : ""}`} 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Details section */}
                                                {isExpanded && renderOrderDetails(order)}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            ) : (
                /* ==================== 2. AUTHENTICATION CARDS (UNAUTHENTICATED) ==================== */
                <div className="w-full max-w-md relative z-10 animate-fade-in">
                    {/* Branding header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                                NEXUS<span className="text-indigo-600 dark:text-indigo-400">STORE</span>
                            </span>
                        </Link>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
                            {activeTab === "login" && "Secure Client Sign In"}
                            {activeTab === "signup" && "Join our Premium Marketplace"}
                            {activeTab === "forgot" && "Reset Password Credentials"}
                            {activeTab === "reset" && "Update Account Security"}
                        </p>
                    </div>

                    {/* Main Auth Card Container (Glassmorphic) */}
                    <div className="bg-white/70 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-900/80 backdrop-blur-md p-8 rounded-3xl shadow-xl dark:shadow-none">
                        
                        {/* Auth Tab Buttons (Hidden during reset/forgot password) */}
                        {activeTab !== "forgot" && activeTab !== "reset" && (
                            <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl mb-6">
                                <button
                                    onClick={() => {
                                        setActiveTab("login");
                                        setAlertMessage(null);
                                    }}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                                        activeTab === "login"
                                            ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("signup");
                                        setAlertMessage(null);
                                    }}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                                        activeTab === "signup"
                                            ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    }`}
                                >
                                    Create Account
                                </button>
                            </div>
                        )}

                        {/* Alert Message Banner */}
                        {alertMessage && (
                            <div className={`p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 border animate-pulse ${
                                alertType === "success"
                                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                    : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
                            }`}>
                                <div className="shrink-0 mt-0.5">
                                    {alertType === "success" ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 leading-relaxed">{alertMessage}</div>
                            </div>
                        )}

                        {/* ==================== LOGIN FORM ==================== */}
                        {activeTab === "login" && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your-email@example.com"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveTab("forgot");
                                                setAlertMessage(null);
                                            }}
                                            className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading && (
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                                        </svg>
                                    )}
                                    {loading ? "Signing In..." : "Sign In"}
                                </button>
                            </form>
                        )}

                        {/* ==================== SIGNUP FORM ==================== */}
                        {activeTab === "signup" && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your-email@example.com"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Must be at least 6 characters"
                                            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {/* Real-time Password Strength Meter */}
                                    {password && (
                                        <div className="space-y-1.5 pt-1.5 animate-fade-in">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                                <span>Password Strength</span>
                                                <span className="uppercase tracking-wider font-extrabold">{getStrengthLabel(getPasswordStrength())}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${getStrengthColor(getPasswordStrength())}`} 
                                                    style={{ width: `${getPasswordStrength()}%` }} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer pt-3"
                                >
                                    {loading && (
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                                        </svg>
                                    )}
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </form>
                        )}

                        {/* ==================== FORGOT PASSWORD FORM ==================== */}
                        {activeTab === "forgot" && (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="text-center mb-2">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Forgot Password?</h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Enter your registered email below, and we'll send you secure instructions to reset your password.</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Registered Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your-email@example.com"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading && (
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                                        </svg>
                                    )}
                                    {loading ? "Sending..." : "Request Reset Link"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("login");
                                        setAlertMessage(null);
                                    }}
                                    className="w-full text-center text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors pt-2"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        )}

                        {/* ==================== RESET PASSWORD FORM ==================== */}
                        {activeTab === "reset" && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="text-center mb-2">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Choose New Password</h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Please enter a strong new password below to update your account security credentials.</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading && (
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                                        </svg>
                                    )}
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                </svg>
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
}
