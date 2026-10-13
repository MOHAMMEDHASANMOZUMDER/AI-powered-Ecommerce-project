"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const emptyProduct = { title: "", description: "", price: "", category: "General", image: "" };

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [draft, setDraft] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    const [productsResponse, ordersResponse] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/orders"),
    ]);
    if (productsResponse.status === 401 || ordersResponse.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const productsData = await productsResponse.json();
    const ordersData = await ordersResponse.json();
    if (!productsResponse.ok || !ordersResponse.ok) throw new Error("Unable to load admin data.");
    setProducts(productsData.products);
    setOrders(ordersData.orders);
  }

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  async function saveProduct(event) {
    event.preventDefault();
    setError("");
    const endpoint = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const response = await fetch(endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to save product.");
      return;
    }
    setDraft(emptyProduct);
    setEditingId(null);
    await loadData();
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product? Existing order history will remain unchanged.")) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete product.");
      return;
    }
    await loadData();
  }

  async function logout() {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric-600 dark:text-ice-300">NexusStore</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-900 dark:text-white">Admin dashboard</h1>
        </div>
        <button onClick={logout} className="rounded-xl border border-zinc-200 dark:border-navy-800 px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:border-rose-400 hover:text-rose-500">Sign out</button>
      </div>
      {error && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={saveProduct} className="rounded-2xl border border-zinc-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-6">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">{editingId ? "Edit product" : "Add product"}</h2>
          <div className="mt-5 space-y-3">
            {[
              ["title", "Title", "text"],
              ["price", "Price (TK)", "number"],
              ["category", "Category", "text"],
              ["image", "Image URL", "url"],
            ].map(([key, label, type]) => (
              <label key={key} className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}
                <input type={type} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} required={key === "title" || key === "price"} className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-navy-800 bg-transparent px-3 py-2.5 outline-none focus:border-electric-500" />
              </label>
            ))}
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">Description
              <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required rows={5} className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-navy-800 bg-transparent px-3 py-2.5 outline-none focus:border-electric-500" />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-xl bg-electric-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-electric-500">{editingId ? "Save changes" : "Add product"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyProduct); }} className="rounded-xl border border-zinc-200 dark:border-navy-800 px-5 py-2.5 text-sm font-bold">Cancel</button>}
          </div>
        </form>

        <section className="rounded-2xl border border-zinc-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-6">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">Products ({products.length})</h2>
          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 dark:border-navy-900 p-3">
                <div className="min-w-0"><p className="truncate font-bold text-zinc-900 dark:text-white">{product.title}</p><p className="text-xs text-zinc-500">{product.price} TK · {product.category || "General"}</p></div>
                <div className="flex shrink-0 gap-2"><button onClick={() => { setEditingId(product._id); setDraft({ ...product, price: String(product.price), description: product.description || "", category: product.category || "General", image: product.image || "" }); }} className="text-xs font-bold text-electric-600">Edit</button><button onClick={() => deleteProduct(product._id)} className="text-xs font-bold text-rose-600">Delete</button></div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-6">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Customer orders ({orders.length})</h2>
        <div className="mt-5 space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="rounded-xl border border-zinc-100 dark:border-navy-900 p-4">
              <div className="flex flex-wrap justify-between gap-2"><div><p className="font-black text-zinc-900 dark:text-white">{order.orderNumber}</p><p className="text-xs text-zinc-500">{order.shippingAddress?.name} · {order.shippingAddress?.email || "Guest"} · {order.shippingAddress?.phone}</p></div><p className="font-black text-electric-600">{order.total} TK</p></div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{order.items?.map((item) => `${item.title} × ${item.quantity}`).join(", ")}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">{order.status} · {order.paymentMethod} · {new Date(order.createdAt).toLocaleString()}</p>
            </article>
          ))}
          {orders.length === 0 && <p className="text-sm text-zinc-500">No orders yet.</p>}
        </div>
      </section>
    </main>
  );
}
