"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const fallbackImage =
  "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load this product.");
        }

        setProduct(data.product);
      } catch (fetchError) {
        console.error("Error fetching product details:", fetchError);
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-[520px] rounded-3xl bg-zinc-200 dark:bg-navy-900 animate-pulse" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-20 text-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
            Product unavailable
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {error || "We could not find that product."}
          </p>
          <Link
            href="/"
            className="inline-flex mt-6 rounded-xl bg-electric-600 px-5 py-3 text-sm font-bold text-white hover:bg-electric-500 transition-colors"
          >
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-electric-600 dark:text-zinc-400 dark:hover:text-ice-300 transition-colors"
      >
        <span aria-hidden="true">←</span> Back to catalog
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14 items-start">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-navy-800 bg-white dark:bg-navy-900/30 aspect-square flex items-center justify-center">
          <span className="absolute top-5 left-5 z-10 rounded-lg bg-zinc-100/90 dark:bg-navy-950/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-electric-600 dark:text-ice-300 border border-zinc-200 dark:border-navy-800">
            {product.category || "General"}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || fallbackImage}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric-600 dark:text-ice-300">
            NexusStore product
          </p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            {product.title}
          </h1>
          <p className="mt-6 text-3xl font-black text-zinc-900 dark:text-white">
            {product.price ? product.price.toFixed(0) : "0"} TK
          </p>

          <div className="mt-8 border-t border-zinc-200 dark:border-navy-800 pt-7">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Product description
            </h2>
            <p className="mt-3 text-base leading-8 text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
              {product.description || "No detailed description is available for this product yet."}
            </p>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="mt-9 w-full sm:w-auto rounded-xl border border-electric-600 px-8 py-3.5 text-sm font-bold text-electric-600 dark:text-ice-300 hover:bg-electric-500/10 active:scale-95 transition-all"
          >
            Add to cart
          </button>
          <button
            onClick={() => {
              addToCart(product);
              router.push("/checkout");
            }}
            className="mt-3 w-full sm:w-auto sm:ml-3 rounded-xl bg-electric-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-electric-600/20 hover:bg-electric-500 active:scale-95 transition-all"
          >
            Buy now
          </button>
        </div>
      </section>
    </main>
  );
}
