import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export interface SavedProduct {
  id: string;
  title: string;
  category: string;
  price: string;
  rawPrice: number;
  unit: string;
  size?: string;
  bgColor?: string;
  image: string;
  rating?: number;
}

interface SavedContextType {
  savedItems: SavedProduct[];
  savedCount: number;
  isSaved: (id: string | undefined | null) => boolean;
  toggleSave: (product: any) => Promise<boolean>;
  removeSaved: (id: string) => Promise<void>;
  clearSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType>({
  savedItems: [],
  savedCount: 0,
  isSaved: () => false,
  toggleSave: async () => false,
  removeSaved: async () => {},
  clearSaved: async () => {},
});

export const SAVED_STORAGE_KEY = "freshmart_saved_items";

// Helper to filter out dummy sample items from old mock templates
function isDummySample(item: any): boolean {
  if (!item || !item.id) return true;
  const idStr = String(item.id).toLowerCase();
  const titleStr = String(item.title || "").toLowerCase();
  if (idStr === "s1" || idStr === "s2" || idStr === "s3" || idStr === "s4") return true;
  if (
    titleStr.includes("linen shirt") ||
    titleStr.includes("running shoes") ||
    titleStr.includes("summer dress") ||
    titleStr.includes("leather sneakers")
  ) {
    return true;
  }
  return false;
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedProduct[]>([]);

  // Load saved items on mount
  useEffect(() => {
    async function loadSaved() {
      try {
        let stored: string | null = null;
        if (Platform.OS === "web") {
          stored = localStorage.getItem(SAVED_STORAGE_KEY);
        } else {
          stored = await SecureStore.getItemAsync(SAVED_STORAGE_KEY);
        }

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Purge dummy mock items if they were saved earlier
            const cleaned = parsed.filter((item) => !isDummySample(item));
            setSavedItems(cleaned);
            if (cleaned.length !== parsed.length) {
              persistSaved(cleaned);
            }
            return;
          }
        }
        // If not stored or empty, default to empty list
        setSavedItems([]);
      } catch (e) {
        console.warn("Failed to load saved items:", e);
        setSavedItems([]);
      }
    }
    loadSaved();
  }, []);

  const persistSaved = async (items: SavedProduct[]) => {
    try {
      const serialized = JSON.stringify(items);
      if (Platform.OS === "web") {
        localStorage.setItem(SAVED_STORAGE_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(SAVED_STORAGE_KEY, serialized);
      }
    } catch (e) {
      console.warn("Failed to persist saved items:", e);
    }
  };

  const isSaved = (id: string | undefined | null) => {
    if (!id) return false;
    const targetId = String(id);
    return savedItems.some((item) => String(item.id) === targetId);
  };

  const removeSaved = async (id: string) => {
    const updated = savedItems.filter((item) => String(item.id) !== String(id));
    setSavedItems(updated);
    await persistSaved(updated);
  };

  const clearSaved = async () => {
    setSavedItems([]);
    await persistSaved([]);
  };

  const toggleSave = async (product: any): Promise<boolean> => {
    if (!product) return false;
    const id = String(product._id || product.id);
    const alreadySaved = savedItems.some((item) => String(item.id) === id);

    if (alreadySaved) {
      const updated = savedItems.filter((item) => String(item.id) !== id);
      setSavedItems(updated);
      await persistSaved(updated);
      return false;
    } else {
      // Normalize product details
      const rawPrice =
        typeof product.price === "number"
          ? product.price
          : Number(String(product.price).replace(/[^0-9.]/g, "")) || 0;
      const formattedPrice =
        typeof product.price === "string" && product.price.startsWith("₹")
          ? product.price
          : `₹${rawPrice}`;

      const newItem: SavedProduct = {
        id,
        title: product.name || product.title || "Product",
        category: product.category || "General",
        price: formattedPrice,
        rawPrice,
        unit:
          product.unit ||
          (product.sizes && product.sizes.length > 0
            ? product.sizes[0]
            : "Standard"),
        size:
          product.size ||
          (product.sizes && product.sizes.length > 0
            ? product.sizes[0]
            : "Standard"),
        bgColor: product.bgColor || "#F9FAFB",
        image:
          product.image1 ||
          product.image ||
          (Array.isArray(product.images) && product.images[0]) ||
          "",
        rating: Number(product.rating) || 4.8,
      };

      const updated = [newItem, ...savedItems];
      setSavedItems(updated);
      await persistSaved(updated);
      return true;
    }
  };

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        savedCount: savedItems.length,
        isSaved,
        toggleSave,
        removeSaved,
        clearSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
