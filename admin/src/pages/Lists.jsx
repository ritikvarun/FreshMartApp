import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'

function Lists() {
    let [list, setList] = useState([])
    let { serverUrl } = useContext(authDataContext)

    const fetchList = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/product/list")
            setList(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const removeList = async (id) => {
        try {
            let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true })
            if (result.data) {
                toast.success("Product removed")
                fetchList()
            }
        } catch (error) {
            toast.error("Failed to remove product")
        }
    }

    useEffect(() => { fetchList() }, [])

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                <div className='mb-[28px]'>
                    <h1 className='text-[26px] font-bold text-gray-900'>All Products</h1>
                    <p className='text-gray-400 text-[14px] mt-[4px]'>{list.length} products listed</p>
                </div>

                {list.length === 0 ? (
                    <div className='bg-white rounded-2xl border border-gray-200 p-[40px] text-center text-gray-400 text-[15px]'>
                        No products found. Add your first product!
                    </div>
                ) : (
                    <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                        {/* Table header */}
                        <div className='grid grid-cols-[80px_1fr_120px_100px_60px] gap-[16px] px-[24px] py-[12px] bg-gray-50 border-b border-gray-200'>
                            <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Image</span>
                            <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Name</span>
                            <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Category</span>
                            <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Price</span>
                            <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Del</span>
                        </div>

                        {list.map((item, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-[80px_1fr_120px_100px_60px] gap-[16px] px-[24px] py-[14px] items-center
                                    ${index !== list.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                            >
                                <img src={item.image1} alt="" className='w-[56px] h-[56px] rounded-xl object-cover border border-gray-200' />
                                <span className='text-[14px] font-medium text-gray-800 truncate'>{item.name}</span>
                                <span className='text-[13px] text-gray-500'>
                                    <span className='bg-gray-100 px-[10px] py-[3px] rounded-full'>{item.category}</span>
                                </span>
                                <span className='text-[14px] font-semibold text-gray-800'>₹{item.price}</span>
                                <button
                                    onClick={() => removeList(item._id)}
                                    className='w-[34px] h-[34px] rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all'
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Lists
