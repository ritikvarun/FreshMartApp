import React, { useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Navigation,
  Printer,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Clock,
  Truck,
  PieChart,
  Store,
  Bike,
  Filter,
} from "lucide-react";
import type { Order, DeliveryPartner } from "../types";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { InvoiceModal } from "../components/InvoiceModal";

const STATUSES = [
  "All",
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

interface OrdersProps {
  orders: Order[];
  deliveryPartners: DeliveryPartner[];
  isLoading: boolean;
  onRefreshOrders: () => void;
  selectedOrderForModal: Order | null;
  setSelectedOrderForModal: (order: Order | null) => void;
}

export const Orders: React.FC<OrdersProps> = ({
  orders,
  deliveryPartners,
  isLoading,
  onRefreshOrders,
}) => {
  const { adminToken } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      statusFilter === "All" ||
      (ord.status || "Order Placed").toLowerCase() === statusFilter.toLowerCase();

    const customer = `${ord.address?.firstName || ""} ${ord.address?.lastName || ""}`.toLowerCase();
    const city = (ord.address?.city || "").toLowerCase();
    const phone = (ord.address?.phone || "").toLowerCase();
    const id = ord._id?.toLowerCase() || "";

    const q = search.toLowerCase();
    const matchesSearch =
      customer.includes(q) || city.includes(q) || phone.includes(q) || id.includes(q);

    return matchesStatus && matchesSearch;
  });

  // Update Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(ENDPOINTS.ORDERS.STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        onRefreshOrders();
      } else {
        alert("Failed to update status. Please try again.");
      }
    } catch (err) {
      alert("Network error updating status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Assign Delivery Partner
  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder || !selectedPartnerId) return;

    const partner = deliveryPartners.find((d) => d._id === selectedPartnerId);
    if (!partner) return;

    try {
      const res = await fetch(ENDPOINTS.ORDERS.ASSIGN_DELIVERY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId: assigningOrder._id,
          deliveryBoyId: partner._id,
          deliveryBoyName: partner.name,
          deliveryBoyPhone: partner.phone,
        }),
      });

      if (res.ok) {
        setAssigningOrder(null);
        setSelectedPartnerId("");
        onRefreshOrders();
      } else {
        alert("Failed to assign rider.");
      }
    } catch (err) {
      alert("Network error assigning rider.");
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone, city, or Order ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex w-full md:w-auto items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {STATUSES.map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <Filter className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No Orders Match Your Filter</h3>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search query or selecting a different status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerName = `${order.address?.firstName || "Customer"} ${
              order.address?.lastName || ""
            }`.trim();

            const addr = order.address;
            const fullAddress = [
              addr?.street,
              addr?.landmark ? `Near ${addr.landmark}` : null,
              addr?.city,
              addr?.state,
              addr?.pinCode ? `(${addr.pinCode})` : null,
            ]
              .filter(Boolean)
              .join(", ");

            const mapsQuery =
              addr?.latitude && addr?.longitude
                ? `${addr.latitude},${addr.longitude}`
                : encodeURIComponent(fullAddress);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

            const currentStatus = order.status || "Order Placed";
            const isUpdating = updatingOrderId === order._id;

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300"
              >
                {/* Order Top Bar: Responsive flex-wrap */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 p-3.5 sm:px-6 sm:py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {order.date
                        ? new Date(order.date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </span>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {order.paymentMethod || "COD"}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        (order as any).orderType === "single"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {(order as any).orderType === "single" ? "Single Material" : "Multi-Material / Parchi"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-medium mr-1.5 hidden sm:inline">Amount:</span>
                      <span className="text-base font-black text-slate-900">
                        ₹{Number(order.amount || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Status Select */}
                    <div className="relative">
                      <select
                        disabled={isUpdating}
                        value={currentStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white py-1.5 pr-7 pl-2.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer disabled:opacity-50"
                      >
                        {STATUSES.filter((s) => s !== "All").map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:p-6 lg:grid-cols-3">
                  {/* Col 1: Customer & Address */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Customer & Address
                      </span>
                      {order.address?.isLiveLocation && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Navigation className="h-2.5 w-2.5" /> GPS Verified
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{customerName}</h4>
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <span className="break-words">{fullAddress || "Address details not available"}</span>
                      </p>
                    </div>

                    {/* Map & Call buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Navigation className="h-3 w-3 text-slate-600" />
                        <span>Google Maps</span>
                      </a>

                      {order.address?.phone && (
                        <a
                          href={`tel:${order.address.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                        >
                          <Phone className="h-3 w-3" />
                          <span>Call: {order.address.phone}</span>
                        </a>
                      )}
                    </div>

                    {(order as any).orderNotes ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-900 mt-2">
                        <span className="font-extrabold text-[10px] uppercase block tracking-wider text-amber-700">
                          📝 Parchi / Requirement Note:
                        </span>
                        {(order as any).orderNotes}
                      </div>
                    ) : null}
                  </div>

                  {/* Col 2: Ordered Items */}
                  <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Ordered Items ({order.items?.length || 0})
                    </span>

                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-900 truncate block">{it.name}</span>
                            <span className="text-[11px] text-slate-400">
                              ({it.size || "Std"}) × {it.quantity || 1}
                            </span>
                          </div>
                          <span className="font-bold text-slate-800 shrink-0">
                            ₹{((it.price || 0) * (it.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 3: Commission, Settlement & Delivery Rider */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase">
                        <PieChart className="h-3 w-3 text-emerald-600" />
                        Settlement Split
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                        {order.orderType === "single" ? "Single" : "Multi"}
                      </span>
                    </div>

                    {/* Split Numbers */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                        <span className="text-[9px] font-semibold text-slate-400 block">Admin 10%</span>
                        <div className="font-bold text-emerald-700 text-xs">
                          ₹{order.adminCommission || Math.round(Math.max(0, (order.amount || 0) - 50) * 0.1)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                        <span className="text-[9px] font-semibold text-slate-400 block">Shop Share</span>
                        <div className="font-bold text-blue-700 text-xs">
                          ₹{order.shopPayout || (order.amount || 0) - 50 - Math.round(Math.max(0, (order.amount || 0) - 50) * 0.1)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                        <span className="text-[9px] font-semibold text-slate-400 block">Rider</span>
                        <div className="font-bold text-amber-700 text-xs">
                          ₹{order.deliveryBoyPayout || 50}
                        </div>
                      </div>
                    </div>

                    {/* Partner Details & Rider Assignment */}
                    <div className="border-t border-slate-200/80 pt-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Store className="h-3 w-3 text-slate-400" />
                          <span>Shop:</span>
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[130px]">
                          {order.shopName || "Central Store"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Bike className="h-3 w-3 text-slate-400" />
                          <span>Rider:</span>
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[130px]">
                          {order.deliveryBoyName || "Pending Assign"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions: Responsive wrapping */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 bg-white p-3.5 sm:px-6 sm:py-3">
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    <span>Print Tax Invoice</span>
                  </button>

                  <button
                    onClick={() => setAssigningOrder(order)}
                    className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{order.deliveryBoyName ? "Re-assign Rider" : "Assign Delivery Boy"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Delivery Partner Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Assign Delivery Rider
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Order #{assigningOrder._id.slice(-6).toUpperCase()} • Delivery Charge: ₹50
            </p>

            <form onSubmit={handleAssignDelivery} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Approved Rider
                </label>
                <select
                  required
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option value="">-- Choose from available riders --</option>
                  {deliveryPartners
                    .filter((d) => d.status === "Approved")
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.vehicleType}) - {d.phone} {d.isOnline ? "🟢 Online" : "⚪ Offline"}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPartnerId}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable Modal */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
};
