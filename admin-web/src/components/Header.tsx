import React from "react";
import {
  Menu,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { TabType } from "./Sidebar";

interface HeaderProps {
  currentTab: TabType;
  onOpenMobileSidebar: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const TAB_TITLES: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Executive Dashboard",
    subtitle: "Real-time store metrics, gross sales, and recent customer activity",
  },
  orders: {
    title: "Orders & Dispatch",
    subtitle: "Track order lifecycle, assign delivery boys, and view commissions",
  },
  products: {
    title: "Store Catalog",
    subtitle: "Manage categories, prices, pack sizes, and catalog visibility",
  },
  "add-product": {
    title: "Add New Product",
    subtitle: "Upload up to 5 photos, set sizes, category pricing, and discounts",
  },
  banners: {
    title: "Promotional Banners",
    subtitle: "Configure 5 auto-scrolling hero banners on the customer app",
  },
  partners: {
    title: "Partners & Finance",
    subtitle: "Merchant approvals, delivery boy duty status, and payout splits",
  },
  returns: {
    title: "Customer Returns",
    subtitle: "Inspect return reasons and grant approval or rejection",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onRefreshAll,
  isRefreshing,
  soundEnabled,
  setSoundEnabled,
}) => {
  const currentInfo = TAB_TITLES[currentTab] || {
    title: "Admin Panel",
    subtitle: "Store Management Hub",
  };

  return (
    <header className="shrink-0 z-30 flex h-16 sm:h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-3.5 backdrop-blur-md sm:px-6 w-full max-w-full">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 truncate">
            {currentInfo.title}
          </h1>
          <p className="hidden text-xs text-slate-500 font-medium sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Sound Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Audio alerts enabled (Click to mute)" : "Audio alerts muted (Click to enable)"}
          className={`flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold transition cursor-pointer ${
            soundEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 text-emerald-600" />
              <span className="hidden md:inline">Alerts On</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" />
              <span className="hidden md:inline">Alerts Muted</span>
            </>
          )}
        </button>

        {/* Global Refresh Button */}
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 transition cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Live Status Pill */}
        <div className="hidden xl:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Live API</span>
        </div>
      </div>
    </header>
  );
};
