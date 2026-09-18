import React, { useState, useContext, useEffect, useMemo } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { FiPackage, FiPhone, FiMail, FiMapPin, FiSearch, FiCalendar, FiCreditCard } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { toast } from 'react-toastify'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const { serverUrl } = useContext(authDataContext)

    const fetchAllOrders = async () => {
        setLoading(true)
        try {
            const result = await axios.post(serverUrl + '/api/order/list', {}, { withCredentials: true })
            if (Array.isArray(result.data)) {
                setOrders(result.data.reverse())
            } else {
                setOrders([])
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast.error("Failed to load orders")
        }
        setLoading(false)
    }

    const statusHandler = async (e, orderId) => {
        const newStatus = e.target.value
        try {
            const result = await axios.post(
                serverUrl + '/api/order/status', 
                { orderId, status: newStatus }, 
                { withCredentials: true }
            )
            if (result.data) {
                toast.success(`Order status updated to: ${newStatus}`)
                await fetchAllOrders()
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Failed to update order status")
        }
    }

    useEffect(() => { 
        fetchAllOrders() 
    }, [])

    const statusColors = {
        'Order Placed': 'bg-blue-50 text-blue-700 border-blue-200',
        'Packing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
        'Out for delivery': 'bg-orange-50 text-orange-700 border-orange-200',
        'Delivered': 'bg-green-50 text-green-700 border-green-200',
    }

    // Filtered orders based on search and status
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter

            const searchLower = searchTerm.toLowerCase().trim()
            if (!searchLower) return matchesStatus

            const firstName = order.address?.firstName || ''
            const lastName = order.address?.lastName || ''
            const fullName = `${firstName} ${lastName}`.toLowerCase()
            const email = (order.address?.email || '').toLowerCase()
            const phone = (order.address?.phone || '').toLowerCase()
            const orderId = (order._id || '').toLowerCase()
            const city = (order.address?.city || '').toLowerCase()

            const matchesSearch = fullName.includes(searchLower) ||
                email.includes(searchLower) ||
                phone.includes(searchLower) ||
                orderId.includes(searchLower) ||
                city.includes(searchLower)

            return matchesStatus && matchesSearch
        })
    }, [orders, searchTerm, statusFilter])

    const formatIST = (timestamp) => {
        if (!timestamp) return 'N/A'
        try {
            return new Date(timestamp).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        } catch (e) {
            return new Date(timestamp).toLocaleDateString()
        }
    }

    const cleanPhone = (phone) => {
        if (!phone) return ''
        const digits = phone.toString().replace(/[^0-9]/g, '')
        return digits.length === 10 ? `91${digits}` : digits
    }

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] mb-[24px]'>
                    <div>
                        <h1 className='text-[26px] font-bold text-gray-900'>Customer Orders</h1>
                        <p className='text-gray-500 text-[14px] mt-[4px]'>
                            View details of who ordered, contact customers, and track deliveries.
                        </p>
                    </div>
                    <div className='flex items-center gap-[10px]'>
                        <span className='bg-black text-white px-[14px] py-[6px] rounded-full text-[13px] font-semibold'>
                            {orders.length} Total Orders
                        </span>
                        <button
                            onClick={fetchAllOrders}
                            className='bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-[14px] py-[6px] rounded-full text-[13px] font-medium transition-all shadow-sm'
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[16px] mb-[20px] flex flex-col md:flex-row gap-[12px] items-center justify-between'>
                    <div className='relative w-full md:w-[360px]'>
                        <FiSearch className='absolute left-[14px] top-[14px] text-gray-400 w-[16px] h-[16px]' />
                        <input
                            type='text'
                            placeholder='Search by customer name, email, phone, or ID...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full h-[42px] pl-[38px] pr-[14px] rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-800 outline-none focus:ring-2 focus:ring-black/10'
                        />
                    </div>

                    <div className='flex items-center gap-[8px] flex-wrap w-full md:w-auto'>
                        {['All', 'Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-[12px] py-[6px] rounded-xl text-[12px] font-semibold border transition-all
                                    ${statusFilter === status 
                                        ? 'bg-black text-white border-black shadow-sm' 
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className='bg-white rounded-2xl border border-gray-200 p-[48px] text-center text-gray-400 text-[15px] shadow-sm'>
                        Loading customer orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className='bg-white rounded-2xl border border-gray-200 p-[48px] text-center text-gray-400 text-[15px] shadow-sm'>
                        {searchTerm || statusFilter !== 'All' ? 'No orders match your filter.' : 'No orders yet.'}
                    </div>
                ) : (
                    <div className='flex flex-col gap-[16px]'>
                        {filteredOrders.map((order, index) => {
                            const customerName = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'Customer'
                            const customerEmail = order.address?.email || ''
                            const customerPhone = order.address?.phone || ''
                            const street = order.address?.street || ''
                            const city = order.address?.city || ''
                            const state = order.address?.state || ''
                            const pinCode = order.address?.pinCode || order.address?.pincode || ''
                            const fullAddress = [street, city, state, pinCode].filter(Boolean).join(', ')

                            const whatsappNumber = cleanPhone(customerPhone)
                            const whatsappUrl = whatsappNumber 
                                ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${customerName}, thank you for ordering with ShopX! Your order #${order._id.slice(-6)} is being processed.`)}`
                                : null

                            return (
                                <div 
                                    key={order._id || index} 
                                    className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[20px] transition-all hover:shadow-md'
                                >
                                    {/* Top Bar: Order ID + Date + Amount */}
                                    <div className='flex flex-wrap items-center justify-between pb-[14px] border-b border-gray-100 gap-[10px] mb-[16px]'>
                                        <div className='flex items-center gap-[10px] flex-wrap'>
                                            <span className='font-mono text-[12px] bg-gray-100 text-gray-800 px-[10px] py-[4px] rounded-lg font-semibold'>
                                                ID: #{order._id.slice(-8)}
                                            </span>
                                            <span className='flex items-center gap-[4px] text-[12px] text-gray-500'>
                                                <FiCalendar className='w-[13px] h-[13px]' />
                                                {formatIST(order.date)}
                                            </span>
                                        </div>

                                        <div className='flex items-center gap-[12px]'>
                                            <div className='text-right'>
                                                <span className='text-[18px] font-bold text-gray-900'>₹{order.amount}</span>
                                                <span className='text-[11px] text-gray-400 block'>
                                                    {order.paymentMethod} · {order.payment ? '✓ Paid' : '⏳ Unpaid'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Grid: Customer Info | Ordered Items | Delivery Address | Actions */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] items-start'>
                                        
                                        {/* 1. Customer Information */}
                                        <div className='bg-gray-50/80 rounded-xl p-[14px] border border-gray-100 flex flex-col gap-[8px]'>
                                            <div className='flex items-center gap-[8px]'>
                                                <div className='w-[32px] h-[32px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[13px]'>
                                                    {customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className='text-[14px] font-bold text-gray-900 leading-tight'>{customerName}</p>
                                                    <span className='text-[11px] text-gray-400'>Customer</span>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            {customerEmail ? (
                                                <a 
                                                    href={`mailto:${customerEmail}?subject=ShopX Order #${order._id.slice(-6)}`}
                                                    className='flex items-center gap-[6px] text-[12px] text-blue-600 hover:text-blue-800 break-all transition-colors'
                                                    title='Send email to customer'
                                                >
                                                    <FiMail className='w-[13px] h-[13px] shrink-0' />
                                                    <span>{customerEmail}</span>
                                                </a>
                                            ) : (
                                                <p className='text-[12px] text-gray-400 flex items-center gap-[6px]'>
                                                    <FiMail className='w-[13px] h-[13px]' />
                                                    <span>No email provided</span>
                                                </p>
                                            )}

                                            {/* Phone & WhatsApp */}
                                            {customerPhone ? (
                                                <div className='flex items-center gap-[8px] mt-[2px] flex-wrap'>
                                                    <a 
                                                        href={`tel:${customerPhone}`} 
                                                        className='flex items-center gap-[4px] text-[12px] font-semibold text-gray-700 hover:text-black bg-white px-[8px] py-[4px] rounded-lg border border-gray-200 shadow-2xs'
                                                        title='Call customer'
                                                    >
                                                        <FiPhone className='w-[12px] h-[12px]' />
                                                        <span>{customerPhone}</span>
                                                    </a>
                                                    {whatsappUrl && (
                                                        <a 
                                                            href={whatsappUrl} 
                                                            target='_blank' 
                                                            rel='noreferrer' 
                                                            className='flex items-center gap-[4px] text-[11px] font-semibold text-green-700 hover:bg-green-100 bg-green-50 px-[8px] py-[4px] rounded-lg border border-green-200 transition-colors'
                                                            title='Chat on WhatsApp'
                                                        >
                                                            <FaWhatsapp className='w-[13px] h-[13px]' />
                                                            <span>WhatsApp</span>
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className='text-[12px] text-gray-400'>No phone provided</p>
                                            )}
                                        </div>

                                        {/* 2. Items Ordered */}
                                        <div>
                                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-[8px] flex items-center gap-[4px]'>
                                                <FiPackage className='w-[13px] h-[13px]' />
                                                Items ({order.items?.length || 0})
                                            </p>
                                            <div className='flex flex-col gap-[6px] max-h-[140px] overflow-y-auto pr-[4px]'>
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className='flex items-start justify-between text-[13px] gap-[8px]'>
                                                        <div className='flex-1'>
                                                            <span className='font-semibold text-gray-800'>{item.name}</span>
                                                            <span className='ml-[6px] text-[10px] font-medium bg-gray-100 text-gray-600 px-[6px] py-[1px] rounded'>
                                                                Size: {item.size}
                                                            </span>
                                                        </div>
                                                        <span className='text-gray-500 font-mono text-[12px] shrink-0'>
                                                            ×{item.quantity} · ₹{item.price * item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. Delivery Address */}
                                        <div>
                                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-[8px] flex items-center gap-[4px]'>
                                                <FiMapPin className='w-[13px] h-[13px]' />
                                                Delivery Address
                                            </p>
                                            <p className='text-[13px] text-gray-700 leading-relaxed'>
                                                {fullAddress || 'Address details not specified'}
                                            </p>
                                            {pinCode && (
                                                <span className='inline-block mt-[4px] text-[11px] font-semibold bg-gray-100 text-gray-600 px-[6px] py-[2px] rounded'>
                                                    PIN: {pinCode}
                                                </span>
                                            )}
                                        </div>

                                        {/* 4. Status Dropdown & Download Bill */}
                                        <div className='flex flex-col gap-[8px]'>
                                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-[2px] flex items-center gap-[4px]'>
                                                <FiCreditCard className='w-[13px] h-[13px]' />
                                                Order Status
                                            </p>
                                            <select
                                                value={order.status}
                                                onChange={(e) => statusHandler(e, order._id)}
                                                className={`h-[38px] px-[12px] rounded-xl text-[13px] font-semibold border outline-none cursor-pointer transition-all
                                                    ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                                            >
                                                <option value="Order Placed">Order Placed</option>
                                                <option value="Packing">Packing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Out for delivery">Out for delivery</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>

                                            <button 
                                                onClick={() => window.open(serverUrl + "/api/order/invoice/" + order._id, "_blank")}
                                                className='h-[36px] bg-gray-900 hover:bg-black text-white text-[12px] font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-[6px]'
                                            >
                                                <span>Download Invoice / Bill</span>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders
