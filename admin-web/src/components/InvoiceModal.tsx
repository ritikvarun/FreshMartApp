import React from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle } from "lucide-react";
import { Order } from "../types";

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const customerName = `${order.address?.firstName || "Customer"} ${
    order.address?.lastName || ""
  }`.trim();

  const formattedDate = order.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  const subtotal = order.items?.reduce(
    (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
    0
  ) || order.amount || 0;

  const deliveryFee = 50;
  const grandTotal = Number(order.amount || subtotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto no-print:flex">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Printable Tax Invoice</span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              #{order._id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-slate-800" id="printable-invoice">
          {/* Top Brand & Metadata */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
                  FM
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">FreshMart</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Fresh & Fast Hyperlocal Delivery Network<br />
                GSTIN: 07AAACH7409R1ZZ • Support: help@freshmart.com
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 uppercase">
                ORIGINAL INVOICE
              </span>
              <p className="mt-2 text-xs font-mono font-bold text-slate-900">
                INVOICE #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-slate-500">Date: {formattedDate}</p>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-2 gap-6 border-b border-slate-200 py-6 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Customer & Delivery Address:
              </span>
              <p className="mt-1.5 font-bold text-slate-900 text-sm">{customerName}</p>
              <p className="text-slate-600">
                {order.address?.street}
                {order.address?.landmark ? `, Near ${order.address.landmark}` : ""}
              </p>
              <p className="text-slate-600">
                {order.address?.city}
                {order.address?.pinCode ? ` - ${order.address.pinCode}` : ""}
              </p>
              <p className="mt-1 text-slate-800 font-semibold">
                Phone: {order.address?.phone || "N/A"}
              </p>
            </div>

            <div className="text-right">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Order & Payment Info:
              </span>
              <p className="mt-1.5 font-semibold text-slate-800">
                Payment Method:{" "}
                <span className="font-bold text-slate-900 uppercase">
                  {order.paymentMethod || "COD"}
                </span>
              </p>
              <p className="text-slate-600">
                Status: <span className="font-semibold text-emerald-600">{order.status || "Confirmed"}</span>
              </p>
              <p className="text-slate-600">
                Assigned Rider: {order.deliveryBoyName || "Express Courier"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Size</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 text-center text-slate-500">{item.size || "Standard"}</td>
                    <td className="py-3 text-center font-bold text-slate-900">{item.quantity || 1}</td>
                    <td className="py-3 text-right text-slate-600">₹{Number(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold">₹{(grandTotal - deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST Inclusive):</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-extrabold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-base text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-8 border-t border-dashed border-slate-200 pt-4 text-[11px] text-slate-400 text-center">
            Thank you for shopping with FreshMart! For returns or questions, please visit FreshMart Customer App.
          </div>
        </div>
      </div>
    </div>
  );
};
