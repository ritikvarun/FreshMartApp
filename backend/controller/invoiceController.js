import mongoose from "mongoose"
import Order from "../model/orderModel.js"
import PDFDocument from 'pdfkit'

export const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid order ID" })
        }

        // Find the order
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        // Create a PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers to force download
        res.setHeader('Content-disposition', `attachment; filename=Invoice-${orderId}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // ── Invoice UI ── //

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text("ShopX", { align: 'left' });
        doc.fontSize(10).font('Helvetica').text("ShopX Official Retail", { align: 'left' });
        doc.fontSize(10).text("Support: ritikvarun64@gmail.com", { align: 'left' });

        doc.moveDown();
        doc.fontSize(18).font('Helvetica-Bold').text("TAX INVOICE", { align: 'center' });
        doc.moveDown();

        // Order Details
        const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        doc.fontSize(11).font('Helvetica-Bold').text(`Order ID: #${order._id}`);
        doc.font('Helvetica').text(`Date: ${dateStr}`);
        doc.text(`Payment Method: ${order.paymentMethod || 'COD'}`);
        doc.text(`Payment Status: ${order.payment ? 'Paid' : 'Pending/COD'}`);
        doc.moveDown();

        // Customer Details
        const addr = order.address || {};
        const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || 'Valued Customer';
        const street = addr.street || '';
        const cityStatePin = [addr.city, addr.state, addr.pinCode || addr.pincode || addr.zipcode].filter(Boolean).join(', ');
        const phone = addr.phone ? `Phone: ${addr.phone}` : '';

        doc.font('Helvetica-Bold').text("Billed To:");
        doc.font('Helvetica').text(customerName);
        if (street) doc.text(street);
        if (cityStatePin) doc.text(cityStatePin);
        if (phone) doc.text(phone);
        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Size', 300, tableTop);
        doc.text('Qty', 380, tableTop);
        doc.text('Price (INR)', 440, tableTop);
        
        doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();
        
        // Table Rows
        let y = tableTop + 25;
        doc.font('Helvetica');
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach(item => {
            doc.text(item.name || 'Product', 50, y, { width: 240 });
            doc.text(item.size || '-', 300, y);
            doc.text((item.quantity || 1).toString(), 380, y);
            doc.text(`Rs. ${item.price || 0}`, 440, y);
            y += 20;
        });

        doc.moveTo(50, y).lineTo(520, y).stroke();
        y += 15;

        // Total
        doc.font('Helvetica-Bold').text("Total:", 360, y);
        doc.text(`Rs. ${order.amount || 0}`, 440, y);

        // Footer
        doc.moveDown(4);
        doc.font('Helvetica').fontSize(10).text("Thank you for shopping with ShopX. If you have any questions, please contact support.", { align: 'center' });

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error("Invoice Error:", error)
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to generate invoice" })
        }
    }
}
