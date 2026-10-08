import React, { useState } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Check,
  Star,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { TabType } from "../components/Sidebar";

export interface CategoryOption {
  value: string;
  label: string;
  group: "Grocery & Kitchen" | "Snacks & Drinks";
  subCategories: string[];
}

export const ADMIN_GROCERY_CATEGORIES: CategoryOption[] = [
  // Grocery & Kitchen
  {
    value: "Vegetables",
    label: "Vegetables & Fruits",
    group: "Grocery & Kitchen",
    subCategories: ["Fresh Vegetables", "Fresh Fruits", "Exotic & Organic", "Seasonal Special", "Leafy Greens", "Herbs & Spices"],
  },
  {
    value: "Atta & Dal",
    label: "Atta, Rice & Dal",
    group: "Grocery & Kitchen",
    subCategories: ["Chakki Atta & Flours", "Basmati & Daily Rice", "Toor & Moong Dal", "Chana, Rajma & Pulses", "Poha & Grains"],
  },
  {
    value: "Oil & Ghee",
    label: "Oil, Ghee & Masala",
    group: "Grocery & Kitchen",
    subCategories: ["Cooking Oils", "Pure Cow Ghee", "Mustard & Sunflower Oil", "Powdered Spices", "Whole Spices & Blends"],
  },
  {
    value: "Dairy",
    label: "Dairy, Bread & Eggs",
    group: "Grocery & Kitchen",
    subCategories: ["Milk & Packaged Pouches", "Butter & Spreads", "Fresh Paneer", "Bread & Buns", "Farm Eggs", "Curd & Yogurt", "Cheese"],
  },
  {
    value: "Bakery",
    label: "Bakery & Biscuits",
    group: "Grocery & Kitchen",
    subCategories: ["Cookies & Biscuits", "Cream Biscuits", "Rusk & Khari", "Cakes & Pastries", "Buns & Pav"],
  },
  {
    value: "Dry Fruits",
    label: "Dry Fruits & Cereals",
    group: "Grocery & Kitchen",
    subCategories: ["Almonds & Badam", "Cashews & Kaju", "Raisins & Kishmish", "Walnuts & Pistachios", "Breakfast Cereals & Oats"],
  },
  {
    value: "Meat & Fish",
    label: "Chicken, Meat & Fish",
    group: "Grocery & Kitchen",
    subCategories: ["Fresh Chicken Curry Cut", "Boneless Chicken", "Fish & Seafood", "Mutton & Cuts", "Eggs & Cuts"],
  },
  {
    value: "Kitchenware",
    label: "Kitchenware & Appliances",
    group: "Grocery & Kitchen",
    subCategories: ["Water Bottles & Flasks", "Cookware & Pans", "Storage Containers", "Electric Kettles & Appliances", "Choppers & Cutlery"],
  },

  // Snacks & Drinks
  {
    value: "Snacks",
    label: "Chips & Namkeen",
    group: "Snacks & Drinks",
    subCategories: ["Potato Chips", "Namkeen & Bhujia", "Nachos & Crisps", "Puffs & Popcorn", "Roasted Snacks"],
  },
  {
    value: "Sweets",
    label: "Sweets & Chocolates",
    group: "Snacks & Drinks",
    subCategories: ["Cadbury & Silk Chocolates", "Indian Mithai & Tins", "Gift Packs & Boxes", "Candies & Toffees", "Dessert Mixes"],
  },
  {
    value: "Drinks",
    label: "Drinks & Juices",
    group: "Snacks & Drinks",
    subCategories: ["Cold Drinks & Cans", "Fruit Juices", "Energy Drinks", "Soda & Mineral Water", "Syrups & Concentrates"],
  },
  {
    value: "Beverages",
    label: "Tea, Coffee & Milk Drinks",
    group: "Snacks & Drinks",
    subCategories: ["Tea & Chai Leaves", "Green Tea & Herbal", "Instant Coffee", "Health Food Drinks (Bournvita/Horlicks)"],
  },
  {
    value: "Instant Food",
    label: "Instant Food",
    group: "Snacks & Drinks",
    subCategories: ["Instant Noodles & Maggi", "Pasta & Vermicelli", "Ready-to-Eat Meals", "Instant Soups & Mixes"],
  },
  {
    value: "Sauces",
    label: "Sauces & Spreads",
    group: "Snacks & Drinks",
    subCategories: ["Tomato Ketchup", "Mayonnaise & Dips", "Jams & Honey", "Chocolate Spreads & Nutella", "Schezwan & Chutneys"],
  },
  {
    value: "Paan Corner",
    label: "Paan Corner",
    group: "Snacks & Drinks",
    subCategories: ["Mukhwas & Saunf", "Mouth Fresheners", "Chewing Gums & Mints", "Paan Chutney & Elaichi"],
  },
  {
    value: "Ice Creams",
    label: "Ice Creams & More",
    group: "Snacks & Drinks",
    subCategories: ["Ice Cream Tubs & Family Packs", "Cones & Chocobars", "Kulfi & Candies", "Frozen Desserts"],
  },
];

const PRESET_SIZES: Record<string, string[]> = {
  weight: ["100g", "250g", "500g", "1kg", "2kg", "5kg", "10kg"],
  volume: ["100ml", "200ml", "500ml", "750ml", "1L", "2L", "5L"],
  units: ["1 pc", "2 pcs", "4 pcs", "6 pcs", "12 pcs", "Pack of 1", "Pack of 2", "Pack of 4"],
};

interface AddProductProps {
  onProductAdded: () => void;
  onNavigate: (tab: TabType) => void;
}

export const AddProduct: React.FC<AddProductProps> = ({ onProductAdded, onNavigate }) => {
  const { adminToken } = useAdminAuth();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [subCategory, setSubCategory] = useState("Fresh Vegetables");
  const [sizeType, setSizeType] = useState<"weight" | "volume" | "units">("weight");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["1kg"]);
  const [customSize, setCustomSize] = useState("");
  const [bestseller, setBestseller] = useState(false);

  // 5 Image Slots: can be File object or URL string
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", "", "", ""]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(["", "", "", "", ""]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSize.trim()) return;
    if (!selectedSizes.includes(customSize.trim())) {
      setSelectedSizes([...selectedSizes, customSize.trim()]);
    }
    setCustomSize("");
  };

  // Image Upload handler (file)
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);

    // Create local object URL for preview
    const newPreviews = [...previewUrls];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviewUrls(newPreviews);

    // Clear manual URL for this slot
    const newUrls = [...imageUrls];
    newUrls[index] = "";
    setImageUrls(newUrls);
  };

  // Image URL input handler
  const handleUrlChange = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);

    // Update preview with URL
    const newPreviews = [...previewUrls];
    newPreviews[index] = url;
    setPreviewUrls(newPreviews);

    // Clear file
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newUrls = [...imageUrls];
    newUrls[index] = "";
    setImageUrls(newUrls);

    const newPreviews = [...previewUrls];
    newPreviews[index] = "";
    setPreviewUrls(newPreviews);
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!previewUrls[0]) {
      setFeedback({
        type: "error",
        message: "Primary Product Photo (Slot 1) is mandatory. Please upload an image or provide a URL.",
      });
      return;
    }

    if (!name.trim() || !description.trim() || !price.trim()) {
      setFeedback({
        type: "error",
        message: "Please fill in all basic product details (Title, Description, and Price).",
      });
      return;
    }

    if (selectedSizes.length === 0) {
      setFeedback({
        type: "error",
        message: "Please select at least one available size or packing variant.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price.trim());
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", String(bestseller));
      formData.append("sizes", JSON.stringify(selectedSizes));

      // Append image files or URLs
      for (let i = 0; i < 5; i++) {
        const fieldName = `image${i + 1}`;
        if (imageFiles[i]) {
          formData.append(fieldName, imageFiles[i] as File);
        } else if (imageUrls[i] && imageUrls[i].trim()) {
          formData.append(fieldName, imageUrls[i].trim());
        }
      }

      const res = await fetch(ENDPOINTS.PRODUCTS.ADD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to publish product.");
      }

      setFeedback({
        type: "success",
        message: `"${name}" has been published to the catalog successfully!`,
      });

      // Clear Form
      setName("");
      setDescription("");
      setPrice("");
      setSelectedSizes(["M", "L"]);
      setBestseller(false);
      setImageFiles([null, null, null, null, null]);
      setImageUrls(["", "", "", "", ""]);
      setPreviewUrls(["", "", "", "", ""]);

      onProductAdded();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error submitting product. Check server logs.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{feedback.message}</p>
            {feedback.type === "success" && (
              <button
                type="button"
                onClick={() => onNavigate("products")}
                className="mt-2 text-xs font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
              >
                View in Catalog →
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: 5 Photo Upload Slots */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Product Images (Up to 5)</h3>
              <p className="text-xs text-slate-400">
                Slot 1 is required (Primary catalog cover). Slots 2-5 are optional angles.
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Cloudinary Auto-Upload
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[0, 1, 2, 3, 4].map((index) => {
              const preview = previewUrls[index];
              const isPrimary = index === 0;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 transition ${
                    preview
                      ? "border-emerald-300 bg-emerald-50/20"
                      : isPrimary
                      ? "border-slate-300 bg-slate-50 hover:bg-slate-100/80"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                  }`}
                >
                  {/* Slot Label */}
                  <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                    {isPrimary ? "Slot 1 (Cover)*" : `Slot ${index + 1}`}
                  </span>

                  {preview ? (
                    <div className="relative mt-4 w-full aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={preview}
                        alt={`Slot ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col items-center text-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                      <label className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer">
                        <Upload className="h-3 w-3" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(index, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Direct URL input fallback */}
                  <div className="mt-3 w-full">
                    <input
                      type="url"
                      placeholder="Or paste URL..."
                      value={imageUrls[index]}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 placeholder-slate-400 outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Basic Product Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Product Specifications
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Farm Fresh Strawberries 500g"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Detailed Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed nutritional info, fabric quality, freshness guarantee, or ingredients..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Price in ₹ (INR) *
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-9 text-sm font-extrabold text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Bestseller Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <span className="text-xs font-bold text-slate-900">Featured / Bestseller</span>
                <p className="text-[11px] text-slate-500">Show highlighted badge on store homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setBestseller(!bestseller)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  bestseller ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    bestseller ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Store Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  const catObj = ADMIN_GROCERY_CATEGORIES.find((c) => c.value === newCat);
                  if (catObj && catObj.subCategories.length > 0) {
                    setSubCategory(catObj.subCategories[0]);
                  }
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
              >
                <optgroup label="Grocery & Kitchen">
                  {ADMIN_GROCERY_CATEGORIES.filter((c) => c.group === "Grocery & Kitchen").map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Snacks & Drinks">
                  {ADMIN_GROCERY_CATEGORIES.filter((c) => c.group === "Snacks & Drinks").map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* SubCategory */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Sub-Category
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
              >
                {(
                  ADMIN_GROCERY_CATEGORIES.find((c) => c.value === category)?.subCategories || [
                    "General",
                  ]
                ).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Available Sizes & Variants */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Available Packaging & Sizes</h3>
              <p className="text-xs text-slate-400">
                Select predefined sizes or add custom packing variants (e.g. 500g, 1L, Pack of 6).
              </p>
            </div>

            {/* Size Type Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {(["weight", "volume", "units"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSizeType(type)}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize transition cursor-pointer ${
                    sizeType === type ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  {type === "weight" ? "Weight (g/kg)" : type === "volume" ? "Volume (ml/L)" : "Packs/Units"}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_SIZES[sizeType].map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span>{size}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Size / Pack Adder */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Custom size (e.g. 250ml, Pack of 3)..."
              className="max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              + Add Variant
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate("products")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Publishing Product...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Publish Product To Catalog</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
