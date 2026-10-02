import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCw,
  AlertCircle,
  ExternalLink,
  Layers,
} from "lucide-react";
import { BannerSlot } from "../types";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";

const CATEGORIES = [
  "All",
  "Vegetables & Fruits",
  "Dairy & Breakfast",
  "Atta, Rice & Dal",
  "Oils & Masalas",
  "Snacks & Munchies",
  "Cold Drinks & Juices",
  "Instant & Frozen Food",
  "Cleaning & Household",
  "Personal Care",
];

export const Banners: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [banners, setBanners] = useState<BannerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null, null, null]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.SETTINGS.GET_BANNERS);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Ensure at least 5 slots exist
          const filled = [...data];
          while (filled.length < 5) {
            filled.push({
              badge: "PROMO DROP",
              title: `Special Promotion #${filled.length + 1}`,
              discount: "20% OFF",
              btnText: "Shop Now",
              categoryFilter: "All",
              imageUrl: "",
            });
          }
          setBanners(filled);
        } else {
          // Default 5 slots
          setBanners(
            Array.from({ length: 5 }, (_, i) => ({
              badge: "PROMO DROP",
              title: `Promotional Banner #${i + 1}`,
              discount: "30% OFF",
              btnText: "Explore Now",
              categoryFilter: "All",
              imageUrl: "",
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const updateBannerField = (index: number, field: keyof BannerSlot, value: string) => {
    const updated = [...banners];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setBanners(updated);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFiles = [...bannerFiles];
    newFiles[index] = file;
    setBannerFiles(newFiles);

    // Update preview URL
    updateBannerField(index, "imageUrl", URL.createObjectURL(file));
  };

  const handleSaveBanner = async (index: number) => {
    const banner = banners[index];
    if (!banner) return;

    setSavingIndex(index);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("slotIndex", String(index));
      formData.append("title", banner.title || `Banner ${index + 1}`);
      formData.append("badge", banner.badge || "SPECIAL OFFER");
      formData.append("discount", banner.discount || "30%");
      formData.append("offText", banner.offText || "OFF");
      formData.append("btnText", banner.btnText || "Shop Now");
      formData.append("categoryFilter", banner.categoryFilter || "All");

      if (bannerFiles[index]) {
        formData.append("image", bannerFiles[index] as File);
      } else {
        formData.append("imageUrl", banner.imageUrl || "");
      }

      const res = await fetch(ENDPOINTS.SETTINGS.UPDATE_BANNER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Banner Slot #${index + 1} updated and synced successfully!`);
        if (data.banners) {
          setBanners(data.banners);
        }
      } else {
        alert(data.message || "Failed to update banner.");
      }
    } catch (err: any) {
      alert("Error saving banner slot.");
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Intro Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Promotional Hero Banners
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure 5 dynamic auto-sliding banners displayed at the top of the Customer App home screen.
          </p>
        </div>

        <button
          onClick={fetchBanners}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload Banners</span>
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Banner Slots */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {banners.map((banner, index) => {
            const isSaving = savingIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300"
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-mono font-extrabold text-white">
                      SLOT {index + 1} OF 5
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {banner.title || `Promotional Banner #${index + 1}`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveBanner(index)}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSaving ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Save Slot #{index + 1}</span>
                  </button>
                </div>

                {/* Banner Content Grid */}
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                  {/* Image Preview & Upload */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Banner Graphic Preview
                    </span>

                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={`Slot ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
                          <span className="mt-1 block text-xs text-slate-400">No Image Uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(index, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      value={banner.imageUrl}
                      onChange={(e) => updateBannerField(index, "imageUrl", e.target.value)}
                      placeholder="Or enter direct image URL..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="space-y-3 md:col-span-2">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Headline / Title
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => updateBannerField(index, "title", e.target.value)}
                          placeholder="e.g. Summer Super Savers"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Top Badge Text
                        </label>
                        <input
                          type="text"
                          value={banner.badge}
                          onChange={(e) => updateBannerField(index, "badge", e.target.value)}
                          placeholder="e.g. LIMITED OFFER"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Discount / Highlight Text
                        </label>
                        <input
                          type="text"
                          value={banner.discount}
                          onChange={(e) => updateBannerField(index, "discount", e.target.value)}
                          placeholder="e.g. Up to 40% OFF"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Button CTA Text
                        </label>
                        <input
                          type="text"
                          value={banner.btnText}
                          onChange={(e) => updateBannerField(index, "btnText", e.target.value)}
                          placeholder="e.g. Shop Collection"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Target Category Filter on Click */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Target Category Link (When customer clicks banner)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((cat) => {
                          const isSel =
                            (banner.categoryFilter || "All").toLowerCase() === cat.toLowerCase();
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => updateBannerField(index, "categoryFilter", cat)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                                isSel
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
