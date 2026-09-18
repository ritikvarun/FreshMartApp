import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";

export interface ProductItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image1: string;
  image2?: string;
  category: string;
  subCategory?: string;
  sizes?: string[];
  bestseller?: boolean;
}

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
  product: ProductItem;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  isLoading: boolean;
  addToCart: (product: ProductItem, size?: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  grandTotal: 0,
  isLoading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

const GUEST_CART_KEY = "freshmart_guest_cart";

async function saveGuestCart(items: CartItem[]) {
  try {
    const json = JSON.stringify(items);
    if (Platform.OS === "web") {
      localStorage.setItem(GUEST_CART_KEY, json);
    } else {
      await SecureStore.setItemAsync(GUEST_CART_KEY, json);
    }
  } catch (err) {
    console.warn("Guest cart save error", err);
  }
}

async function getGuestCart(): Promise<CartItem[]> {
  try {
    let json: string | null = null;
    if (Platform.OS === "web") {
      json = localStorage.getItem(GUEST_CART_KEY);
    } else {
      json = await SecureStore.getItemAsync(GUEST_CART_KEY);
    }
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.warn("Guest cart get error", err);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load cart initially
  useEffect(() => {
    refreshCart();
  }, [token, isAuthenticated]);

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && token) {
        // Fetch cart from backend
        const res = await fetch(ENDPOINTS.CART.GET, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const cartData = await res.json();
          // cartData format: { [itemId]: { [size]: quantity } }
          // Fetch product details if needed
          const prodRes = await fetch(ENDPOINTS.PRODUCTS.LIST);
          if (prodRes.ok) {
            const allProducts: ProductItem[] = await prodRes.json();
            const prodMap = new Map(allProducts.map((p) => [p._id, p]));

            const newItems: CartItem[] = [];
            for (const [productId, sizeMap] of Object.entries(cartData as Record<string, Record<string, number>>)) {
              const product = prodMap.get(productId);
              if (product && sizeMap) {
                for (const [size, qty] of Object.entries(sizeMap)) {
                  if (qty > 0) {
                    newItems.push({
                      productId,
                      size,
                      quantity: qty,
                      product,
                    });
                  }
                }
              }
            }
            setCartItems(newItems);
          }
        }
      } else {
        // Guest user: Load from local storage
        const localItems = await getGuestCart();
        setCartItems(localItems);
      }
    } catch (err) {
      console.warn("Error refreshing cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: ProductItem, size?: string) => {
    const itemSize = size || (product.sizes && product.sizes[0]) || "Standard";

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product._id && i.size === itemSize
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            productId: product._id,
            size: itemSize,
            quantity: 1,
            product,
          },
        ];
      }

      if (!isAuthenticated) {
        saveGuestCart(updated);
      }
      return updated;
    });

    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        await fetch(ENDPOINTS.CART.ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: product._id,
            size: itemSize,
          }),
        });
      } catch (err) {
        console.warn("Failed to sync addToCart with backend:", err);
      }
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    setCartItems((prev) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prev.filter(
          (i) => !(i.productId === productId && i.size === size)
        );
      } else {
        updated = prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity }
            : i
        );
      }

      if (!isAuthenticated) {
        saveGuestCart(updated);
      }
      return updated;
    });

    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        await fetch(ENDPOINTS.CART.UPDATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: productId,
            size,
            quantity,
          }),
        });
      } catch (err) {
        console.warn("Failed to sync updateQuantity with backend:", err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await saveGuestCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(
    cartItems.reduce((acc, item) => acc + item.quantity * (item.product.price || 0), 0).toFixed(2)
  );
  const deliveryFee = subtotal > 25 || subtotal === 0 ? 0 : 2.5;
  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        deliveryFee,
        grandTotal,
        isLoading,
        addToCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
