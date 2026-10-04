import React, { useEffect, useMemo, useState } from "react";
import { Check, Layers3, Plus, Save, Trash2 } from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import type { Product } from "../types";

interface HomeSection {
  id: string;
  title: string;
  productIds: string[];
}

interface HomeSectionsProps {
  products: Product[];
}

export const HomeSections: React.FC<HomeSectionsProps> = ({ products }) => {
  const { adminToken } = useAdminAuth();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product._id, product]));
  }, [products]);

  const loadSections = async () => {
    try {
      const res = await fetch(ENDPOINTS.SETTINGS.GET_HOME_SECTIONS);
      if (!res.ok) throw new Error("Unable to load sections");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSections(
          data.map((section: any) => ({
            id: String(
              section.id || crypto.randomUUID?.() || `section-${Date.now()}`,
            ),
            title: String(section.title || ""),
            productIds: Array.isArray(section.productIds)
              ? section.productIds.map(String)
              : [],
          })),
        );
      } else {
        setSections([]);
      }
    } catch (error) {
      console.warn("Failed to fetch home sections", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `new-section-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: "",
        productIds: [],
      },
    ]);
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title } : section,
      ),
    );
  };

  const toggleProduct = (sectionId: string, productId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const exists = section.productIds.includes(productId);
        return {
          ...section,
          productIds: exists
            ? section.productIds.filter((id) => id !== productId)
            : [...section.productIds, productId],
        };
      }),
    );
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  const saveSections = async () => {
    const cleaned = sections
      .map((section) => ({
        id: section.id,
        title: section.title.trim(),
        productIds: Array.from(new Set(section.productIds.filter(Boolean))),
      }))
      .filter((section) => section.title.length > 0);

    if (cleaned.length === 0) {
      setFeedback("Please add at least one section title.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(ENDPOINTS.SETTINGS.UPDATE_HOME_SECTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ sections: cleaned }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to save sections");
      }

      setSections(data.sections || cleaned);
      setFeedback("Home sections saved successfully.");
    } catch (error: any) {
      setFeedback(error.message || "Failed to save home sections.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <Layers3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-extrabold">Home Sections Builder</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Add as many section names as you want and choose any product for
              each section.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>

            <button
              type="button"
              onClick={saveSections}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-lg font-bold text-slate-700">
                No sections created yet.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first home section and assign products to it.
              </p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black tracking-wider text-white">
                      SECTION {sectionIndex + 1}
                    </span>
                    <input
                      value={section.title}
                      onChange={(event) =>
                        updateSectionTitle(section.id, event.target.value)
                      }
                      placeholder="Section name e.g. Grocery & Kitchen"
                      className="w-full min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                      Choose products
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      {section.productIds.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
                      const selected = section.productIds.includes(product._id);
                      const displayName = product.name || "Product";

                      return (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => toggleProduct(section.id, product._id)}
                          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            selected
                              ? "border-emerald-500 bg-emerald-50 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                            {product.image1 ? (
                              <img
                                src={product.image1}
                                alt={displayName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                                IMG
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-bold text-slate-800">
                                {displayName}
                              </p>
                              {selected && (
                                <Check className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.category || "General"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-700">
                              ₹{Number(product.price || 0)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
