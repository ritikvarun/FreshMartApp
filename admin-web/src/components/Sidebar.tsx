import React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  Image as ImageIcon,
  Users2,
  RotateCcw,
  LogOut,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export type TabType =
  | "dashboard"
  | "orders"
  | "products"
  | "add-product"
  | "banners"
  | "partners"
  | "returns";

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingOrdersCount?: number;
  pendingReturnsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile,
  pendingOrdersCount = 0,
  pendingReturnsCount = 0,
}) => {
  const { adminUser, logout } = useAdminAuth();

  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "orders" as TabType,
      label: "Orders & Dispatch",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      id: "products" as TabType,
      label: "Store Catalog",
      icon: Package,
      badge: null,
    },
    {
      id: "add-product" as TabType,
      label: "Add New Product",
      icon: PlusCircle,
      badge: null,
    },
    {
      id: "banners" as TabType,
      label: "Promotional Banners",
      icon: ImageIcon,
      badge: null,
    },
    {
      id: "partners" as TabType,
      label: "Partners & Splits",
      icon: Users2,
      badge: null,
    },
    {
      id: "returns" as TabType,
      label: "Customer Returns",
      icon: RotateCcw,
      badge: pendingReturnsCount > 0 ? pendingReturnsCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
  ];

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  FreshMart
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Console & Control Hub</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-100/80 px-3.5 py-2 text-xs font-medium text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Store Dispatch Live</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">v2.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      item.badgeColor || "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin Footer & Logout */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-xs">
                {adminUser?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-slate-900">
                  {adminUser?.email || "admin@freshmart.com"}
                </p>
                <p className="text-[11px] font-medium text-slate-400">Super Administrator</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out from the Admin Console?")) {
                  logout();
                }
              }}
              title="Sign Out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
