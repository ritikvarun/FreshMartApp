import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  Upload,
  Search,
  Check,
  LayoutGrid,
  Edit3,
  X,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import type { Product } from "../types";

export interface CustomCategory {
  id: string;
  name: string;
  image: string;
  productIds: string[];
}

interface CategoriesManagerProps {
  products: Product[];
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  products,
}) => {
  const { adminToken } = useAdminAuth();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal / Editing State
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(
    null
  );
  const [productSearch, setProductSearch] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load existing categories from backend
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.SETTINGS.GET_CATEGORIES);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(
            data.map((c: any, index: number) => ({
              id: String(c.id || `cat-${Date.now()}-${index}`),
              name: String(c.name || ""),
              image: String(c.image || ""),
              productIds: Array.isArray(c.productIds)
                ? c.productIds.map(String)
                : [],
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Failed to load custom categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Map product id to product item
  const productMap = useMemo(() => {
    return new Map(products.map((p) => [String(p._id || (p as any).id), p]));
  }, [products]);

  // Handle Image Upload for Category
  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(ENDPOINTS.SETTINGS.UPLOAD_CATEGORY_IMAGE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setEditingCategory((prev) =>
            prev ? { ...prev, image: data.imageUrl } : null
          );
        }
      } else {
        alert("Image upload failed. You can also paste an image URL directly.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image. Please paste image URL.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Open modal to create a new category
  const handleAddNewCategory = () => {
    const newCat: CustomCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: "",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
      productIds: [],
    };
    setEditingCategory(newCat);
    setProductSearch("");
  };

  // Toggle a product inside the currently edited category
  const toggleProductSelection = (productId: string) => {
    if (!editingCategory) return;
    const exists = editingCategory.productIds.includes(productId);
    setEditingCategory({
      ...editingCategory,
      productIds: exists
        ? editingCategory.productIds.filter((id) => id !== productId)
        : [...editingCategory.productIds, productId],
    });
  };

  // Select all or clear all products for the category
  const handleSelectAllProducts = () => {
    if (!editingCategory) return;
    const allIds = products.map((p) => String(p._id || (p as any).id));
    setEditingCategory({
      ...editingCategory,
      productIds: allIds,
    });
  };

  const handleClearAllProducts = () => {
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      productIds: [],
    });
  };

  // Save the currently edited category to the categories list
  const handleSaveModalCategory = () => {
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setCategories((prev) => {
      const existsIndex = prev.findIndex((c) => c.id === editingCategory.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = editingCategory;
        return updated;
      }
      return [...prev, editingCategory];
    });

    setEditingCategory(null);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to remove this category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Save all categories to backend
  const handleSaveAllToBackend = async () => {
    const cleaned = categories
      .map((c) => ({
        id: c.id,
        name: c.name.trim(),
        image: c.image.trim(),
        productIds: Array.from(new Set(c.productIds.filter(Boolean))),
      }))
      .filter((c) => c.name.length > 0);

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(ENDPOINTS.SETTINGS.UPDATE_CATEGORIES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ categories: cleaned }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save categories");
      }

      setCategories(data.categories || cleaned);
      setFeedback("Categories saved successfully! Live on mobile app.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || "Failed to save categories.");
    } finally {
      setSaving(false);
    }
  };

  // Filter products inside modal search
  const filteredModalProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 animate-fade-in">
      {/* Top Action Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Category Manager
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Add category name & image, and choose which uploaded products appear inside each category.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddNewCategory}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>

            <button
              type="button"
              onClick={handleSaveAllToBackend}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-slide-in">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Categories Content */}
      {loading ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <p className="mt-4 text-lg font-bold text-slate-800">
            No Custom Categories Yet
          </p>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Click "+ Add Category" to create your first category with a photo, title, and selected products.
          </p>
          <button
            type="button"
            onClick={handleAddNewCategory}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const assignedProducts = category.productIds
              .map((id) => productMap.get(id))
              .filter(Boolean) as Product[];

            return (
              <div
                key={category.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div>
                  {/* Category Card Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          #{index + 1}
                        </span>
                        <h3 className="truncate text-base font-extrabold text-slate-900">
                          {category.name || "Untitled Category"}
                        </h3>
                      </div>
                      <p className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        {category.productIds.length} Products Assigned
                      </p>
                    </div>
                  </div>

                  {/* Product Thumbs Preview */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Products Preview:
                    </p>
                    {assignedProducts.length === 0 ? (
                      <p className="mt-1 text-xs text-slate-400 italic">
                        No products selected yet.
                      </p>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
                        {assignedProducts.slice(0, 5).map((p, i) => (
                          <div
                            key={p._id || i}
                            className="h-8 w-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                            title={p.name}
                          >
                            <img
                              src={p.image1 || (p as any).image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {assignedProducts.length > 5 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                            +{assignedProducts.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(category);
                      setProductSearch("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    Edit & Add Products
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {categories.some((c) => c.id === editingCategory.id)
                    ? "Edit Category"
                    : "Create New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Category Name & Image Inputs */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Sabzi, Cold Drinks, Bakery"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    This title will show in the app for this category.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Category Image URL
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingCategory.image}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <label className="relative shrink-0 cursor-pointer rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition">
                      <Upload className="h-4 w-4 inline mr-1" />
                      {isUploadingImage ? "..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview & Quick Presets */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
                  {editingCategory.image ? (
                    <img
                      src={editingCategory.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">
                    Category Image Preview
                  </p>
                  <p className="text-[11px] text-slate-400">
                    A square clean product photo works best for customer app tiles.
                  </p>
                </div>
              </div>

              {/* Products Assignment Section */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                      Select Products For This Category
                    </h4>
                    <p className="text-xs text-slate-500">
                      {editingCategory.productIds.length} of {products.length} products selected
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllProducts}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Product Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by name or category..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  />
                </div>

                {/* Scrollable Products List */}
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 divide-y divide-slate-100">
                  {filteredModalProducts.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      No products found.
                    </p>
                  ) : (
                    filteredModalProducts.map((p) => {
                      const prodId = String(p._id || (p as any).id);
                      const isSelected = editingCategory.productIds.includes(prodId);

                      return (
                        <div
                          key={prodId}
                          onClick={() => toggleProductSelection(prodId)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                            isSelected
                              ? "bg-emerald-50/70 border border-emerald-200/50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                              <img
                                src={p.image1 || (p as any).image}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                ₹{p.price} • {p.category || "General"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalCategory}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
