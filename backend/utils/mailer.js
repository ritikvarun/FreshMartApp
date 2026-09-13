import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

// ── Helper: send email safely (never crashes server) ─────────
const getAdminEmail = () => {
    const rawEmail = process.env.ADMIN_EMAIL
    if (rawEmail && !rawEmail.includes('example.com') && rawEmail.includes('@')) {
        return rawEmail.trim()
    }
    return 'ritikvarun64@gmail.com'
}

const sendMail = async (options) => {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            console.error('❌ [ShopX Mailer] RESEND_API_KEY is missing in environment variables!')
            return { error: 'RESEND_API_KEY is missing' }
        }

        const resend = new Resend(apiKey)

        console.log(`📨 [ShopX Mailer] Sending email to: ${options.to}, Subject: ${options.subject}`)

        const response = await resend.emails.send({
            from: 'ShopX <onboarding@resend.dev>',
            to: options.to,
            subject: options.subject,
            html: options.html
        })

        if (response.error) {
            console.error(`❌ [ShopX Mailer] Email failed to ${options.to}:`, JSON.stringify(response.error))
        } else {
            console.log(`✅ [ShopX Mailer] Email sent successfully to: ${options.to} (ID: ${response.data?.id})`)
        }
        return response
    } catch (err) {
        console.error(`❌ [ShopX Mailer] Exception in sendMail to ${options.to}:`, err.message)
        return { error: err.message }
    }
}

// ── 1. User: Order Confirmation (Disabled) ───────────────────
export const sendOrderConfirmation = async (userEmail, userName, items, totalAmount, orderId) => {
    return null
}

// ── 2. Admin: New Order Alert ─────────────────────────────────
export const sendAdminOrderAlert = async (orderDetails) => {
    try {
        const adminEmail = getAdminEmail()
        const { userName, userEmail, items, amount, address, paymentMethod, orderId } = orderDetails || {}

        const itemList = Array.isArray(items)
            ? items.map(i => `<li>${i.name || 'Item'} (${i.size || 'Standard'}) × ${i.quantity || 1} — ₹${i.price || 0}</li>`).join('')
            : '<li>Order items recorded</li>'

        const streetStr = (address && typeof address === 'object') ? (address.street || '') : ''
        const cityStr = (address && typeof address === 'object') ? (address.city || '') : ''
        const pinStr = (address && typeof address === 'object') ? (address.pinCode || address.pincode || '') : ''
        const phoneStr = (address && typeof address === 'object') ? (address.phone || 'Not provided') : (address || 'Not provided')
        const displayAddress = (streetStr || cityStr) ? `${streetStr}, ${cityStr} — ${pinStr}` : (typeof address === 'string' ? address : 'Address recorded')

        const formattedTime = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        })

        return await sendMail({
            to: adminEmail,
            subject: `🛒 New Order Received — ₹${amount} — ShopX`,
            html: `
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:#000;padding:24px 32px;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">ShopX Admin</h1>
                    <span style="background:#22c55e;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;display:inline-block;margin-top:8px;">New Order</span>
                </div>
                <div style="padding:32px;">
                    <h2 style="margin:0 0 20px;color:#111;">New Order Alert 🛒</h2>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Customer</p>
                        <p style="margin:0;color:#111;font-weight:600;">${userName || 'Customer'}</p>
                        <p style="margin:0;color:#6b7280;font-size:14px;">${userEmail || 'Email not provided'}</p>
                    </div>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Delivery Address</p>
                        <p style="margin:0;color:#111;">${displayAddress}</p>
                        <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">📞 ${phoneStr}</p>
                    </div>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Items Ordered</p>
                        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;">${itemList}</ul>
                    </div>
                    <div style="padding:16px;background:#000;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#d1d5db;font-weight:600;">Total · ${paymentMethod || 'COD'}</span>
                        <span style="color:#fff;font-weight:700;font-size:20px;">₹${amount}</span>
                    </div>
                    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">⏰ Time (IST): <b>${formattedTime}</b></p>
                    <div style="margin-top:20px;text-align:center;">
                        <a href="${(process.env.ADMIN_URL || (process.env.NODE_ENV === 'production' ? 'https://shopx-admin-ktdc.onrender.com' : 'http://localhost:5174')).replace(/\/$/, '')}/orders"
                           style="background:#000;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
                            View in Admin Panel →
                        </a>
                    </div>
                    <p style="color:#9ca3af;font-size:12px;margin-top:16px;">Order ID: ${orderId || 'N/A'}</p>
                </div>
            </div>`
        })
    } catch (err) {
        console.error("❌ [ShopX Mailer] Error in sendAdminOrderAlert:", err.message)
        return null
    }
}

// ── 3. Admin: New User Registration Alert ─────────────────────
export const sendAdminNewUserAlert = async (userName, userEmail, method = 'Standard') => {
    try {
        const adminEmail = getAdminEmail()
        const formattedTime = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        })

        return await sendMail({
            to: adminEmail,
            subject: `🎉 New User Joined ShopX — ${userName}`,
            html: `
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:#000;padding:24px 32px;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">ShopX Admin</h1>
                    <span style="background:#10b981;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;display:inline-block;margin-top:8px;">New User Registration</span>
                </div>
                <div style="padding:32px;">
                    <h2 style="margin:0 0 20px;color:#111;">New User Joined ShopX 🚀</h2>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:16px;border:1px solid #e5e7eb;">
                        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Customer Info</p>
                        <p style="margin:4px 0;color:#111;font-weight:600;font-size:16px;">👤 ${userName}</p>
                        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📧 <a href="mailto:${userEmail}" style="color:#2563eb;text-decoration:none;">${userEmail}</a></p>
                        <p style="margin:4px 0;color:#6b7280;font-size:13px;">🔑 Signup Method: <b>${method}</b></p>
                        <p style="margin:4px 0;color:#6b7280;font-size:13px;">⏰ Time (IST): <b>${formattedTime}</b></p>
                    </div>
                    <div style="margin-top:20px;text-align:center;">
                        <a href="${(process.env.ADMIN_URL || (process.env.NODE_ENV === 'production' ? 'https://shopx-admin-ktdc.onrender.com' : 'http://localhost:5174')).replace(/\/$/, '')}/users"
                           style="background:#000;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
                            View Users in Admin Panel →
                        </a>
                    </div>
                </div>
                <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ShopX Admin Notification System</p>
                </div>
            </div>`
        })
    } catch (err) {
        console.error("❌ [ShopX Mailer] Error in sendAdminNewUserAlert:", err.message)
        return null
    }
}

// ── 4. User: Order Status Update (Disabled) ─────────────────
export const sendStatusUpdate = async (userEmail, userName, orderStatus, orderId) => {
    return null
}

// ── 5. User: Return/Replacement Request Confirmation (Disabled) ──
export const sendReturnRequestEmail = async (userEmail, userName, details) => {
    return null
}

// ── 6. Admin: Return Alert ────────────────────────────────────
export const sendAdminReturnAlert = async (adminEmail, { userName, userEmail, itemName, reason, description, actionType, refundMethod, refundDetails, returnId }) => {
    try {
        const targetEmail = adminEmail && !adminEmail.includes('example.com') && adminEmail.includes('@') ? adminEmail.trim() : getAdminEmail()

        return await sendMail({
            to: targetEmail,
            subject: `↩️ New ${actionType} Request — ${itemName} — ShopX`,
            html: `
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:#000;padding:24px 32px;">
                    <h1 style="color:#fff;margin:0;font-size:22px;">ShopX Admin</h1>
                    <span style="background:#ef4444;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;display:inline-block;margin-top:8px;">${actionType} Request</span>
                </div>
                <div style="padding:32px;">
                    <h2 style="margin:0 0 20px;color:#111;">↩️ New ${actionType} Request</h2>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Customer</p>
                        <p style="margin:0;color:#111;font-weight:600;">${userName}</p>
                        <p style="margin:0;color:#6b7280;font-size:14px;">${userEmail}</p>
                    </div>
                    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Item</p>
                        <p style="margin:0;color:#111;font-weight:600;">${itemName}</p>
                        <p style="margin:0;color:#374151;font-size:14px;">Reason: ${reason}</p>
                        ${description ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${description}</p>` : ''}
                    </div>
                    ${actionType === 'Refund' ? `
                    <div style="background:#fef3c7;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#92400e;text-transform:uppercase;font-weight:600;">Refund Preference (${refundMethod})</p>
                        ${refundMethod === 'UPI' 
                            ? `<p style="margin:0;color:#111;font-size:14px;"><b>UPI ID:</b> ${refundDetails?.upiId || ''}</p>` 
                            : `<p style="margin:0;color:#111;font-size:14px;"><b>Account Name:</b> ${refundDetails?.accountName || ''}<br/><b>Acct No:</b> ${refundDetails?.accountNo || ''}<br/><b>IFSC:</b> ${refundDetails?.ifsc || ''}</p>`
                        }
                    </div>` : `
                    <div style="background:#ede9fe;padding:16px;border-radius:8px;margin-bottom:12px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#5b21b6;text-transform:uppercase;font-weight:600;">Action Required</p>
                        <p style="margin:0;color:#111;font-size:14px;">Customer requested a <b>Replacement</b>.</p>
                    </div>
                    `}
                    <div style="margin-top:20px;text-align:center;">
                        <a href="${(process.env.ADMIN_URL || (process.env.NODE_ENV === 'production' ? 'https://shopx-admin-ktdc.onrender.com' : 'http://localhost:5174')).replace(/\/$/, '')}/returns"
                           style="background:#000;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
                            View Returns Panel →
                        </a>
                    </div>
                    <p style="color:#9ca3af;font-size:12px;margin-top:16px;">Return ID: ${returnId}</p>
                </div>
            </div>`
        })
    } catch (err) {
        console.error("❌ [ShopX Mailer] Error in sendAdminReturnAlert:", err.message)
        return null
    }
}

// ── 7. User: Return Status Update (Disabled) ─────────────────
export const sendReturnStatusEmail = async (userEmail, userName, details) => {
    return null
}
