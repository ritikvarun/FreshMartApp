import React, { useState, useEffect, useRef } from "react";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import { Sidebar } from "./components/Sidebar";
import type { TabType } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { AddProduct } from "./pages/AddProduct";
import { Banners } from "./pages/Banners";
import { HomeSections } from "./pages/HomeSections";
import { CategoriesManager } from "./pages/CategoriesManager";
import { Partners } from "./pages/Partners";
import { Returns } from "./pages/Returns";
import type { Order, Product, DeliveryPartner } from "./types";
import { ENDPOINTS } from "./config/api";
import { ShieldCheck } from "lucide-react";

// Web Audio API Ding-Dong Notification Sound Generator
function playOrderChime() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    // Tone 1 (High chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2 (Harmonic echo)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn("Audio chime prevented by browser policy", e);
  }
}

const AdminApp: React.FC = () => {
  const { isAuthenticated, isLoading, adminToken } = useAdminAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Store Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(
    [],
  );
  const [returnsCount, setReturnsCount] = useState(0);

  const [isFetchingData, setIsFetchingData] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrdersCount = useRef<number | null>(null);

  // Selected Order for Modal from Dashboard
  const [selectedOrderForModal, setSelectedOrderForModal] =
    useState<Order | null>(null);

  // Fetch all core datasets
  const fetchGlobalData = async () => {
    if (!adminToken) return;
    setIsFetchingData(true);

    try {
      // 1. Fetch Orders
      const orderRes = await fetch(ENDPOINTS.ORDERS.LIST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (Array.isArray(orderData)) {
          const sorted = [...orderData].reverse();
          setOrders(sorted);

          // Check if new order arrived for chime
          if (
            previousOrdersCount.current !== null &&
            sorted.length > previousOrdersCount.current &&
            soundEnabled
          ) {
            playOrderChime();
          }
          previousOrdersCount.current = sorted.length;
        }
      }

      // 2. Fetch Products
      const prodRes = await fetch(ENDPOINTS.PRODUCTS.LIST);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setProducts([...prodData].reverse());
        }
      }

      // 3. Fetch Delivery Partners (for assignment dropdown)
      const deliveryRes = await fetch(ENDPOINTS.DELIVERY.ALL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (deliveryRes.ok) {
        const deliveryData = await deliveryRes.json();
        if (Array.isArray(deliveryData)) {
          setDeliveryPartners(deliveryData);
        }
      }

      // 4. Fetch Returns count
      const returnsRes = await fetch(ENDPOINTS.RETURNS.ALL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (returnsRes.ok) {
        const retData = await returnsRes.json();
        if (Array.isArray(retData)) {
          const pendingRet = retData.filter(
            (r) => r.status === "Pending",
          ).length;
          setReturnsCount(pendingRet);
        }
      }
    } catch (err) {
      console.warn("Global data fetch error:", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalData();
      // Auto-refresh orders every 20 seconds for real-time order alerts
      const interval = setInterval(fetchGlobalData, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, adminToken]);

  // If loading auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20 animate-bounce">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-base font-extrabold tracking-tight">
          AkA Admin Console
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Verifying session authentication...
        </p>
      </div>
    );
  }

  // If not logged in
  if (!isAuthenticated) {
    return <Login />;
  }

  // Pending orders count for sidebar badge
  const pendingOrdersCount = orders.filter(
    (o) =>
      (o.status || "").toLowerCase() !== "delivered" &&
      (o.status || "").toLowerCase() !== "cancelled",
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Persistent Left Sidebar: Always fixed height, stationary */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        pendingOrdersCount={pendingOrdersCount}
        pendingReturnsCount={returnsCount}
      />

      {/* Main Content Area: Header (fixed) + Content (only this scrolls) */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header: Stationary */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefreshAll={fetchGlobalData}
          isRefreshing={isFetchingData}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Dynamic Page Container: ONLY THIS SCROLLS INDEPENDENTLY */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-7">
          {currentTab === "dashboard" && (
            <Dashboard
              orders={orders}
              products={products}
              isLoading={isFetchingData && orders.length === 0}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectOrder={(order) => {
                setSelectedOrderForModal(order);
                setCurrentTab("orders");
              }}
            />
          )}

          {currentTab === "orders" && (
            <Orders
              orders={orders}
              deliveryPartners={deliveryPartners}
              isLoading={isFetchingData && orders.length === 0}
              onRefreshOrders={fetchGlobalData}
              selectedOrderForModal={selectedOrderForModal}
              setSelectedOrderForModal={setSelectedOrderForModal}
            />
          )}

          {currentTab === "products" && (
            <Products
              products={products}
              isLoading={isFetchingData && products.length === 0}
              onRefreshProducts={fetchGlobalData}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === "add-product" && (
            <AddProduct
              onProductAdded={fetchGlobalData}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === "banners" && <Banners />}

          {currentTab === "home-sections" && (
            <HomeSections products={products} />
          )}

          {currentTab === "categories" && (
            <CategoriesManager products={products} />
          )}

          {currentTab === "partners" && <Partners />}

          {currentTab === "returns" && <Returns />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminApp />
    </AdminAuthProvider>
  );
}
