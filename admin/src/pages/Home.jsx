import React, { useState, useContext, useEffect } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { FiPackage, FiShoppingBag, FiArrowRight, FiUser, FiClock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { serverUrl } = useContext(authDataContext)
    const navigate = useNavigate()

    const fetchCounts = async () => {
        setLoading(true)
        try {
            const products = await axios.get(`${serverUrl}/api/product/list`, {}, { withCredentials: true })
            if (Array.isArray(products.data)) setTotalProducts(products.data.length)

            const orders = await axios.post(`${serverUrl}/api/order/list`, {}, { withCredentials: true })
            if (Array.isArray(orders.data)) {
                setTotalOrders(orders.data.length)
                // Take the 5 most recent orders
                const sorted = [...orders.data].reverse().slice(0, 5)
                setRecentOrders(sorted)
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCounts()
    }, [])

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                {/* Page header */}
                <div className='mb-[32px] flex items-center justify-between'>
                    <div>
                        <h1 className='text-[26px] font-bold text-gray-900'>Admin Dashboard</h1>
                        <p className='text-gray-400 text-[14px] mt-[4px]'>Overview of store activity and latest customer orders</p>
                    </div>
                </div>

                {/* Stat cards */}
                <div className='flex flex-wrap gap-[20px] mb-[32px]'>
                    <div 
                        onClick={() => navigate('/lists')}
                        className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[24px] flex items-center gap-[20px] min-w-[240px] flex-1 cursor-pointer hover:shadow-md transition-all'
                    >
                        <div className='w-[52px] h-[52px] bg-gray-100 rounded-xl flex items-center justify-center'>
                            <FiShoppingBag className='w-[24px] h-[24px] text-gray-700' />
                        </div>
                        <div>
                            <p className='text-[13px] text-gray-400 font-medium'>Total Products</p>
                            <p className='text-[34px] font-bold text-gray-900 leading-tight'>{totalProducts}</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/orders')}
                        className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[24px] flex items-center gap-[20px] min-w-[240px] flex-1 cursor-pointer hover:shadow-md transition-all'
                    >
                        <div className='w-[52px] h-[52px] bg-gray-100 rounded-xl flex items-center justify-center'>
                            <FiPackage className='w-[24px] h-[24px] text-gray-700' />
                        </div>
                        <div>
                            <p className='text-[13px] text-gray-400 font-medium'>Total Orders</p>
                            <p className='text-[34px] font-bold text-gray-900 leading-tight'>{totalOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Customer Orders Section */}
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[24px]'>
                    <div className='flex items-center justify-between pb-[16px] border-b border-gray-100 mb-[16px]'>
                        <div>
                            <h2 className='text-[18px] font-bold text-gray-900'>Recent Customer Orders</h2>
                            <p className='text-[13px] text-gray-400 mt-[2px]'>Customers who placed orders recently</p>
                        </div>
                        <button
                            onClick={() => navigate('/orders')}
                            className='flex items-center gap-[6px] text-[13px] font-semibold text-black hover:text-gray-700 transition-colors'
                        >
                            <span>View All Orders</span>
                            <FiArrowRight className='w-[14px] h-[14px]' />
                        </button>
                    </div>

                    {loading ? (
                        <p className='text-gray-400 text-center py-[24px] text-[14px]'>Loading orders...</p>
                    ) : recentOrders.length === 0 ? (
                        <p className='text-gray-400 text-center py-[24px] text-[14px]'>No customer orders yet.</p>
                    ) : (
                        <div className='flex flex-col divide-y divide-gray-100'>
                            {recentOrders.map((order, idx) => {
                                const customerName = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'Customer'
                                const customerEmail = order.address?.email || 'N/A'
                                const city = order.address?.city || ''

                                return (
                                    <div key={order._id || idx} className='py-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]'>
                                        <div className='flex items-center gap-[12px]'>
                                            <div className='w-[38px] h-[38px] rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-[14px] shrink-0'>
                                                {customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='text-[14px] font-bold text-gray-900'>{customerName}</p>
                                                <p className='text-[12px] text-gray-400'>{customerEmail} {city && `· ${city}`}</p>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-[16px]'>
                                            <div className='text-right'>
                                                <p className='text-[15px] font-bold text-gray-900'>₹{order.amount}</p>
                                                <span className='text-[11px] text-gray-400 block'>{order.paymentMethod}</span>
                                            </div>

                                            <span className='text-[12px] font-semibold px-[10px] py-[4px] rounded-lg bg-gray-100 text-gray-700'>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Home
