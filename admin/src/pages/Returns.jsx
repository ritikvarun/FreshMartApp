import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { adminDataContext } from '../context/AdminContext'
import { authDataContext } from '../context/AuthContext'
import { RiCheckLine, RiCloseLine } from 'react-icons/ri'
import { FiPackage } from 'react-icons/fi'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'

const statusColors = {
    Pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
}

function Returns() {
    const { serverUrl } = useContext(authDataContext)
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [noteInputs, setNoteInputs] = useState({})

    const fetchReturns = async () => {
        try {
            const { data } = await axios.get(serverUrl + '/api/return/all', { withCredentials: true })
            if (Array.isArray(data)) {
                setReturns(data)
            } else {
                setReturns([])
                console.warn("Returns data is not an array:", data)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (returnId, status) => {
        try {
            await axios.post(serverUrl + '/api/return/update', {
                returnId,
                status,
                adminNote: noteInputs[returnId] || ''
            }, { withCredentials: true })
            fetchReturns()
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => { fetchReturns() }, [])

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                <div className='max-w-[900px] mx-auto'>
                <div className='mb-[28px]'>
                    <h1 className='text-[22px] font-bold text-gray-900'>Return Requests</h1>
                    <p className='text-gray-400 text-[13px] mt-[2px]'>{returns.length} total requests</p>
                </div>

                {loading ? (
                    <div className='text-center py-[60px] text-gray-400'>Loading...</div>
                ) : returns.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-[80px] bg-white rounded-2xl border border-gray-200'>
                        <FiPackage className='w-[40px] h-[40px] text-gray-300 mb-[12px]' />
                        <p className='text-gray-500 font-medium'>No return requests yet</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-[14px]'>
                        {returns.map((ret) => (
                            <div key={ret._id} className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[20px]'>
                                <div className='flex flex-col sm:flex-row gap-[16px]'>
                                    {/* Image */}
                                    {ret.itemImage && (
                                        <img src={ret.itemImage} alt={ret.itemName} className='w-[80px] h-[80px] rounded-xl object-cover border border-gray-100 flex-shrink-0' />
                                    )}
                                    {/* Info */}
                                    <div className='flex-1'>
                                        <div className='flex flex-wrap items-center gap-[8px] mb-[6px]'>
                                            <h3 className='text-[15px] font-bold text-gray-900'>{ret.itemName}</h3>
                                            <span className={`text-[11px] font-semibold px-[8px] py-[2px] rounded-full border ${statusColors[ret.status]}`}>
                                                {ret.status}
                                            </span>
                                        </div>
                                        <div className='flex flex-wrap gap-[8px] mb-[8px]'>
                                            {ret.itemSize && <span className='text-[12px] bg-gray-100 text-gray-500 px-[8px] py-[2px] rounded-full'>Size: {ret.itemSize}</span>}
                                            {ret.itemPrice && <span className='text-[12px] bg-gray-100 text-gray-500 px-[8px] py-[2px] rounded-full'>₹{ret.itemPrice}</span>}
                                        </div>
                                        <p className='text-[13px] text-gray-700'><b>Reason:</b> {ret.reason}</p>
                                        {ret.description && <p className='text-[12px] text-gray-500 mt-[2px]'>{ret.description}</p>}
                                        <p className='text-[11px] text-gray-400 mt-[6px]'>
                                            Requested: {new Date(ret.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {ret.resolvedAt && ` · Resolved: ${new Date(ret.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        </p>
                                        
                                        {/* Action Type Information */}
                                        {ret.actionType === 'Replace' ? (
                                            <div className='mt-[12px] bg-purple-50 border border-purple-100 rounded-xl p-[12px]'>
                                                <p className='text-[12px] font-bold text-purple-800 uppercase'>Replacement Required 🔄</p>
                                                <p className='text-[12px] text-purple-900 mt-[2px]'>Customer wants an exchange/replacement instead of a refund.</p>
                                            </div>
                                        ) : ret.refundMethod && (
                                            <div className='mt-[12px] bg-blue-50 border border-blue-100 rounded-xl p-[12px]'>
                                                <p className='text-[11px] font-bold text-blue-800 uppercase mb-[4px]'>Refund Info ({ret.refundMethod})</p>
                                                {ret.refundMethod === 'UPI' ? (
                                                    <p className='text-[13px] text-blue-900'><b>UPI ID:</b> {ret.refundDetails?.upiId}</p>
                                                ) : (
                                                    <div className='text-[13px] text-blue-900'>
                                                        <p><b>Name:</b> {ret.refundDetails?.accountName}</p>
                                                        <p><b>A/c No:</b> {ret.refundDetails?.accountNo}</p>
                                                        <p><b>IFSC:</b> {ret.refundDetails?.ifsc}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Admin action */}
                                {ret.status === 'Pending' && (
                                    <div className='mt-[16px] pt-[16px] border-t border-gray-100'>
                                        <input
                                            type="text"
                                            placeholder='Note to customer (optional)...'
                                            value={noteInputs[ret._id] || ''}
                                            onChange={(e) => setNoteInputs(prev => ({ ...prev, [ret._id]: e.target.value }))}
                                            className='w-full h-[40px] rounded-xl border border-gray-200 px-[12px] text-[13px] outline-none focus:ring-2 focus:ring-gray-200 mb-[10px]'
                                        />
                                        <div className='flex gap-[8px]'>
                                            <button
                                                onClick={() => updateStatus(ret._id, 'Approved')}
                                                className='flex items-center gap-[6px] px-[16px] py-[8px] bg-green-600 text-white text-[13px] font-semibold rounded-xl hover:bg-green-700 transition-all'
                                            >
                                                <RiCheckLine size={15} /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(ret._id, 'Rejected')}
                                                className='flex items-center gap-[6px] px-[16px] py-[8px] bg-red-500 text-white text-[13px] font-semibold rounded-xl hover:bg-red-600 transition-all'
                                            >
                                                <RiCloseLine size={15} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {ret.adminNote && ret.status !== 'Pending' && (
                                    <div className='mt-[12px] pt-[12px] border-t border-gray-100'>
                                        <p className='text-[12px] text-gray-500'><b>Admin note:</b> {ret.adminNote}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    )
}

export default Returns
