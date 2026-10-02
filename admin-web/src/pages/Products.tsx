import React, { useState, useMemo } from "react";
import {
  Search,
  Package,
  PlusCircle,
  Trash2,
  Star,
  LayoutGrid,
  List,
  Filter,
  AlertTriangle,
} from "lucide-react";
import type { Product } from "../types";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import type { TabType } from "../components/Sidebar";

export const GROCERY_CATEGORIES = [
  "All",
  "Vegetables & Fruits",
  "Dairy & Breakfast",
  "Atta, Rice & Dal",
  "Oils & Masalas",
  "Snacks & Munchies",
  "Cold Drinks & Juices",
  "Instant & Frozen Food",
  "Tea, Coffee & Drinks",
  "Cleaning & Household",
  "Personal Care",
];

interface ProductsProps {
  products: Product[];
  isLoading: boolean;
  onRefreshProducts: () => void;
  onNavigate: (tab: TabType) => void;
}

export const Products: React.FC<ProductsProps> = ({
  products,
  isLoading,
  onRefreshProducts,
  onNavigate,
}) => {
  const { adminToken } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // View Mode: 'cards' or 'table'
  // Auto-detect: default to 'cards' on mobile (< 1024px), 'table' on desktop
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Collect unique categories:
  // 1. "All" (always first)
  // 2. Standard grocery categories
  // 3. Only non-grocery categories that actually exist in the DB (count > 0) so admin can filter & delete them
  const categories = useMemo(() => {
    const list: string[] = ["All"];

    // Add standard grocery categories
    GROCERY_CATEGORIES.forEach((cat) => {
      if (cat !== "All" && !list.includes(cat)) {
        list.push(cat);
      }
    });

    // Add any legacy categories only if they have actual products in DB (count > 0)
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        const catName = p.category.trim();
        const exists = list.some((c) => c.toLowerCase() === catName.toLowerCase());
        if (!exists) {
          list.push(catName);
        }
      }
    });

    return list;
  }, [products]);

  // Legacy non-grocery product count detection
  const legacyCount = useMemo(() => {
    return products.filter((p) => {
      const cat = (p.category || "").trim().toLowerCase();
      return !GROCERY_CATEGORIES.some((gc) => gc.toLowerCase() === cat);
    }).length;
  }, [products]);

  // Product counts
  const getCategoryCount = (cat: string) => {
    if (cat === "All") return products.length;
    return products.filter(
      (p) => (p.category || "").trim().toLowerCase() === cat.trim().toLowerCase()
    ).length;
  };

  // Filtered
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q);

      const matchesCat =
        activeCategory === "All" ||
        (p.category || "").trim().toLowerCase() === activeCategory.trim().toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, search, activeCategory]);

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${name}" from the store catalog?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(ENDPOINTS.PRODUCTS.REMOVE(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        onRefreshProducts();
      } else {
        alert("Could not remove item. Please try again.");
      }
    } catch (err) {
      alert("Network error removing item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Search, Action & View Switcher Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grocery products by title, category, or subcategory..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* View Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode("cards")}
              title="Card Grid View (Best for Mobile & Tablets)"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table View (Best for Wide Desktops)"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => onNavigate("add-product")}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Legacy Non-Grocery Items Alert (if any exist in database) */}
      {legacyCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 sm:px-4 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Catalog Alert:</strong> {legacyCount} non-grocery test product(s) (e.g. clothing or hardware) detected. Click the amber pills marked <em>[Old]</em> to filter and delete them.
            </span>
          </div>
        </div>
      )}

      {/* Category Chips Bar (Horizontally scrollable with touch) */}
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {categories.map((cat) => {
          const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
          const count = getCategoryCount(cat);
          const isGrocery =
            cat === "All" ||
            GROCERY_CATEGORIES.some((g) => g.toLowerCase() === cat.toLowerCase());

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : !isGrocery
                  ? "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{cat}</span>
              {!isGrocery && (
                <span className="text-[9px] font-semibold text-amber-700 bg-amber-100/90 px-1 py-0.2 rounded border border-amber-200">
                  Old
                </span>
              )}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : !isGrocery
                    ? "bg-amber-200 text-amber-900"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No Products Found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {search ? "No products match your search keyword." : "Your catalog is currently empty."}
          </p>
          <button
            onClick={() => onNavigate("add-product")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Add First Product</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* ── RESPONSIVE CARDS VIEW (2 columns on mobile, 3-4 on larger screens) ── */
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              className="flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-2xs transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                {/* Image + Bestseller Badge */}
                <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50">
                  <img
                    src={
                      item.image1 ||
                      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400"
                    }
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                  {item.bestseller && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-0.5 sm:gap-1 rounded-full bg-amber-500 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-black text-white shadow-xs">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-white text-white" />
                      <span>BESTSELLER</span>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 rounded-md bg-slate-900/80 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-xs">
                    {item.category}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-2 sm:mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                    <span>{item.subCategory || "General"}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1" title={item.name}>
                    {item.name}
                  </h4>

                  {item.description && (
                    <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Available Sizes Pills */}
                  <div className="pt-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Pack / Weight:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                      {Array.isArray(item.sizes) && item.sizes.length > 0 ? (
                        item.sizes.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-bold text-slate-700"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] sm:text-[11px] text-slate-400">Std</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="mt-2.5 sm:mt-4 flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-3">
                <div className="min-w-0 pr-1">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase block">Price</span>
                  <span className="text-xs sm:text-base font-black text-slate-900 truncate block">
                    ₹{Number(item.price || 0).toFixed(0)}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteProduct(item._id, item.name)}
                  disabled={deletingId === item._id}
                  title="Delete product"
                  className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── TABLE VIEW (Desktop Optimized with Smooth Horizontal Scroll) ── */
        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Product Item</th>
                  <th className="py-3 px-5">Category & Subcategory</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Pack / Weight</th>
                  <th className="py-3 px-5">Status / Tags</th>
                  <th className="py-3 px-5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item with Thumbnail */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image1 ||
                            "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300"
                          }
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                        />
                        <div className="max-w-[240px]">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5">
                      <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {item.category} • {item.subCategory || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-5 font-black text-slate-900 whitespace-nowrap">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </td>

                    {/* Sizes */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Array.isArray(item.sizes) && item.sizes.length > 0 ? (
                          item.sizes.map((s, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-bold text-slate-700 whitespace-nowrap"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Standard</span>
                        )}
                      </div>
                    </td>

                    {/* Bestseller Badge */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {item.bestseller ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> BESTSELLER
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteProduct(item._id, item.name)}
                        disabled={deletingId === item._id}
                        title="Delete product"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
