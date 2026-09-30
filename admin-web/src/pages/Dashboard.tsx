import React from "react";
import {
  Wallet,
  ShoppingBag,
  Package,
  Users2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  PlusCircle,
  Eye,
} from "lucide-react";
import type { Order, Product } from "../types";
import type { TabType } from "../components/Sidebar";

interface DashboardProps {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
  onNavigate: (tab: TabType) => void;
  onSelectOrder: (order: Order) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  products,
  isLoading,
  onNavigate,
  onSelectOrder,
}) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
  const pendingOrders = orders.filter(
    (o) => (o.status || "").toLowerCase() !== "delivered" && (o.status || "").toLowerCase() !== "cancelled"
  );
  const deliveredOrders = orders.filter(
    (o) => (o.status || "").toLowerCase() === "delivered"
  );
  const totalProducts = products.length;

  const recentOrders = orders.slice(0, 6);

  const getStatusBadge = (status: string) => {
    const s = (status || "Order Placed").toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    }
    if (s === "out for delivery") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
          <Truck className="h-3 w-3" /> In Transit
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          <Truck className="h-3 w-3" /> Shipped
        </span>
      );
    }
    if (s === "packing") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3" /> Packing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
        <Clock className="h-3 w-3" /> Placed
      </span>
    );
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 sm:p-6 text-white shadow-md shadow-emerald-600/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-emerald-100">
              Total Gross Revenue
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
            <p className="mt-1 text-xs text-emerald-100 font-medium">
              Live accumulated store receipts
            </p>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-100 bg-white/10 rounded-lg px-2.5 py-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            Real-time settlement sync
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-500">
              Total Orders
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {totalOrders}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-bold text-amber-600">{pendingOrders.length} pending</span>
              <span>•</span>
              <span className="font-bold text-emerald-600">{deliveredOrders.length} delivered</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("orders")}
            className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <span>Manage Orders</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Total Catalog Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-500">
              Active Products
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {totalProducts}
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Products published in catalog
            </p>
          </div>
          <button
            onClick={() => onNavigate("products")}
            className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            <span>View Catalog</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Operations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-500">
              Store Actions
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 space-y-2">
            <button
              onClick={() => onNavigate("add-product")}
              className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-emerald-400" />
                Add Product
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button
              onClick={() => onNavigate("partners")}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-slate-500" />
                Partner & Riders
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="w-full max-w-full rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6 sm:py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Latest dispatch and delivery requests</p>
          </div>
          <button
            onClick={() => onNavigate("orders")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span>All Orders ({totalOrders})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-slate-800">No Orders Placed Yet</h4>
            <p className="mt-1 text-xs text-slate-400">
              Incoming customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {recentOrders.map((order) => {
                const customerName = `${order.address?.firstName || "Customer"} ${
                  order.address?.lastName || ""
                }`.trim();
                return (
                  <div key={order._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{customerName}</div>
                        <div className="text-xs text-slate-400">
                          {order.items?.length || 0} items • {order.paymentMethod || "COD"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{Number(order.amount || 0).toFixed(2)}
                        </div>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="mt-1 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table with clean horizontal scroll container */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Order ID & Date</th>
                    <th className="py-3 px-5">Customer & Phone</th>
                    <th className="py-3 px-5">Items Summary</th>
                    <th className="py-3 px-5">Amount & Payment</th>
                    <th className="py-3 px-5">Dispatch Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentOrders.map((order) => {
                    const customerName = `${order.address?.firstName || "Customer"} ${
                      order.address?.lastName || ""
                    }`.trim();
                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-bold text-slate-900">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <div className="text-xs text-slate-400">
                            {order.date
                              ? new Date(order.date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{customerName}</div>
                          <div className="text-xs text-slate-400">
                            {order.address?.phone || "No phone"} • {order.address?.city || "Local"}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-slate-700">
                            {order.items?.length || 0} items
                          </span>
                          <div className="max-w-[180px] truncate text-xs text-slate-400">
                            {order.items?.map((it) => it.name).join(", ")}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-extrabold text-slate-900">
                            ₹{Number(order.amount || 0).toFixed(2)}
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase">
                            {order.paymentMethod || "COD"}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          {getStatusBadge(order.status)}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
