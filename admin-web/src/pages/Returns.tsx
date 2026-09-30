import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { ReturnRequest } from "../types";
import { ENDPOINTS } from "../config/api";
import { useAdminAuth } from "../context/AdminAuthContext";

export const Returns: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.RETURNS.ALL, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReturns([...data].reverse());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [adminToken]);

  const handleUpdateReturn = async (returnId: string, status: "Approved" | "Rejected") => {
    setUpdatingId(returnId);
    try {
      const res = await fetch(ENDPOINTS.RETURNS.UPDATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ returnId, status }),
      });

      if (res.ok) {
        fetchReturns();
      } else {
        alert("Could not update return status.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Customer Return & Refund Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review reasons for product returns and approve or reject claims.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        </div>
      ) : returns.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No Pending Returns</h3>
          <p className="mt-1 text-xs text-slate-500">
            All customer return requests are up to date and verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {returns.map((ret) => {
            const isUpdating = updatingId === ret._id;
            return (
              <div
                key={ret._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-slate-500" />
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        Order #{ret.orderId?.slice(-6)?.toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        ret.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : ret.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ret.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Reason for Return:
                    </span>
                    <p className="text-xs font-medium text-slate-800 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      "{ret.reason || "Product quality issue / item mismatch"}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {ret.status !== "Approved" && (
                    <button
                      onClick={() => handleUpdateReturn(ret._id, "Approved")}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {ret.status !== "Rejected" && (
                    <button
                      onClick={() => handleUpdateReturn(ret._id, "Rejected")}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
