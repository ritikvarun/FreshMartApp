import React, { useState, useEffect } from "react";
import {
  Store,
  Bike,
  PieChart,
  CheckCircle2,
  XCircle,
  RotateCw,
  Award,
  Wallet,
} from "lucide-react";
import type { Shop, DeliveryPartner, FinanceSummary } from "../types";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";

export const Partners: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"shops" | "delivery" | "finance">("shops");
  const [shops, setShops] = useState<Shop[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "shops") {
        const res = await fetch(ENDPOINTS.SHOPS.ALL, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setShops(data || []);
        }
      } else if (activeTab === "delivery") {
        const res = await fetch(ENDPOINTS.DELIVERY.ALL, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDeliveryPartners(data || []);
        }
      } else if (activeTab === "finance") {
        const res = await fetch(ENDPOINTS.SPLITS.SUMMARY, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFinanceSummary(data);
        }
      }
    } catch (err) {
      console.warn("Error fetching partners data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminToken, activeTab]);

  // Update Shop Status
  const handleUpdateShopStatus = async (shopId: string, newStatus: string) => {
    try {
      const res = await fetch(ENDPOINTS.SHOPS.APPROVE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ shopId, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to update shop status");
    }
  };

  // Update Delivery Partner Status
  const handleUpdateDeliveryStatus = async (partnerId: string, newStatus: string) => {
    try {
      const res = await fetch(ENDPOINTS.DELIVERY.APPROVE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ partnerId, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to update rider status");
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Top Tab Bar (Mobile scrollable) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-200 bg-white p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex w-full sm:w-auto items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => setActiveTab("shops")}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "shops"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Shops ({shops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("delivery")}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "delivery"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Bike className="h-4 w-4" />
            <span>Riders ({deliveryPartners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "finance"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Revenue Split</span>
          </button>
        </div>

        <button
          onClick={fetchData}
          className="self-end sm:self-auto flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ── TAB 1: SHOPS ────────────────────────────────────────── */}
          {activeTab === "shops" && (
            <div className="space-y-4">
              {shops.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
                  <Store className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-3 text-base font-bold text-slate-800">No Partner Stores Registered</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Merchant stores applying to sell on FreshMart will be listed here for KYC verification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {shops.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-base font-extrabold text-slate-900 truncate">{s.name}</h4>
                          <p className="text-xs text-slate-500 truncate">
                            Owner: <span className="font-semibold text-slate-700">{s.ownerName || "Merchant"}</span>
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            s.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : s.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone / WhatsApp:</span>
                          <a
                            href={`tel:${s.phone}`}
                            className="font-bold text-slate-900 hover:text-emerald-600"
                          >
                            {s.phone}
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category:</span>
                          <span className="font-semibold text-slate-800">{s.category || "General Grocery"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">KYC Legal Id:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {s.gstNumber ? `GST: ${s.gstNumber}` : `Aadhaar: ${s.aadhaarNumber || "Verified"}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Registration Fee:</span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> ₹500 Received
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span className="text-slate-700 text-right max-w-[200px] truncate">
                            {[s.address?.street, s.address?.city, s.address?.pinCode].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        {s.status !== "Approved" && (
                          <button
                            onClick={() => handleUpdateShopStatus(s._id, "Approved")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve Shop</span>
                          </button>
                        )}
                        {s.status !== "Rejected" && (
                          <button
                            onClick={() => handleUpdateShopStatus(s._id, "Rejected")}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: DELIVERY BOYS ──────────────────────────────── */}
          {activeTab === "delivery" && (
            <div className="space-y-4">
              {deliveryPartners.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
                  <Bike className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-3 text-base font-bold text-slate-800">No Delivery Riders Registered</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Riders applying to deliver orders for FreshMart will be listed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {deliveryPartners.map((d) => (
                    <div
                      key={d._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-slate-900 truncate">{d.name}</h4>
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                d.isOnline ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  d.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                }`}
                              />
                              {d.isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            Vehicle: <span className="font-semibold text-slate-700">{d.vehicleType}</span> •{" "}
                            {d.vehicleNumber || "Cycle/Local"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            d.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : d.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone (OTP Login):</span>
                          <a
                            href={`tel:${d.phone}`}
                            className="font-bold text-slate-900 hover:text-emerald-600"
                          >
                            {d.phone}
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Aadhaar Card:</span>
                          <span className="font-mono font-bold text-slate-800">{d.aadhaarNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Driving License:</span>
                          <span className="font-mono font-bold text-slate-800">{d.drivingLicenseNumber || "Verified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wallet Earnings:</span>
                          <span className="font-bold text-emerald-700">₹{d.walletBalance || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Registration Fee:</span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> ₹500 Received
                          </span>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        {d.status !== "Approved" && (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(d._id, "Approved")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve Rider</span>
                          </button>
                        )}
                        {d.status !== "Rejected" && (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(d._id, "Rejected")}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: REVENUE SPLIT & FINANCE ───────────────────── */}
          {activeTab === "finance" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Hero Volume Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Total Ecosystem Platform Volume
                </span>
                <h3 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  ₹{Number(financeSummary?.totalGrossVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Aggregated across {financeSummary?.totalOrders || 0} customer orders and hyperlocal store dispatches.
                </p>
              </div>

              {/* Finance Grid */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Admin Commission */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Admin Commission (10%)
                  </h4>
                  <div className="mt-1 text-2xl font-black text-emerald-800">
                    ₹{Number(financeSummary?.totalAdminCommission || 0).toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">Platform net margin</p>
                </div>

                {/* Shopkeepers Share */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-2xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Store className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    Shopkeepers Share
                  </h4>
                  <div className="mt-1 text-2xl font-black text-blue-800">
                    ₹{Number(financeSummary?.totalShopPayouts || 0).toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-blue-700">Vendor & inventory payouts</p>
                </div>

                {/* Delivery Boy Share */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                    <Bike className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Delivery Fleet Share
                  </h4>
                  <div className="mt-1 text-2xl font-black text-amber-800">
                    ₹{Number(financeSummary?.totalDeliveryPayouts || 0).toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-amber-700">Rider delivery payouts</p>
                </div>

                {/* Registration Fees Collection */}
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-2xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-[11px] font-bold uppercase tracking-wider text-purple-900">
                    Registration Deposits
                  </h4>
                  <div className="mt-1 text-2xl font-black text-purple-800">
                    ₹{((shops.length + deliveryPartners.length) * 500).toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-purple-700">
                    ₹500 × {shops.length + deliveryPartners.length} onboarded partners
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
