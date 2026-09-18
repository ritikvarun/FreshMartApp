import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiUploadCloud, FiImage } from 'react-icons/fi'

function Banners() {
    const { serverUrl } = useContext(authDataContext)
    const [settings, setSettings] = useState({})
    const [loadingKey, setLoadingKey] = useState(null)

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/setting`, { withCredentials: true })
            setSettings(data)
        } catch (error) {
            console.log(error)
            toast.error("Failed to load settings")
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleUpload = async (e, key) => {
        const file = e.target.files[0]
        if (!file) return

        setLoadingKey(key)
        const formData = new FormData()
        formData.append('key', key)
        formData.append('image', file)

        try {
            const { data } = await axios.post(`${serverUrl}/api/setting/update-image`, formData, { withCredentials: true })
            toast.success("Image updated successfully!")
            // Update local state to reflect new image instantly
            setSettings(prev => ({ ...prev, [key]: data.setting.value }))
        } catch (error) {
            console.log(error)
            toast.error("Failed to update image")
        }
        setLoadingKey(null)
    }

    const imageSlots = [
        { key: 'homeBanner1', title: 'Home Banner 1 (Limited Offer)' },
        { key: 'homeBanner2', title: 'Home Banner 2 (New Arrivals)' },
        { key: 'homeBanner3', title: 'Home Banner 3 (Top Picks)' },
        { key: 'homeBanner4', title: 'Home Banner 4 (Sale Live)' },
        { key: 'aboutBanner', title: 'About Us Image' }
    ]

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                <div className='max-w-[1000px] mx-auto'>
                    <div className='mb-[28px]'>
                        <h1 className='text-[26px] font-bold text-gray-900'>Site Images & Banners</h1>
                        <p className='text-gray-400 text-[14px] mt-[4px]'>Customize your storefront images in real-time</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]'>
                        {imageSlots.map((slot) => (
                            <div key={slot.key} className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[20px] flex flex-col'>
                                <h3 className='font-bold text-gray-900 mb-[12px] text-[15px]'>{slot.title}</h3>
                                
                                <div className='relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-[16px] flex items-center justify-center group'>
                                    {settings[slot.key] ? (
                                        <img src={settings[slot.key]} alt={slot.title} className='w-full h-full object-cover' />
                                    ) : (
                                        <div className='flex flex-col items-center text-gray-400'>
                                            <FiImage size={28} className='mb-2' />
                                            <span className='text-[12px] font-medium'>No image uploaded</span>
                                        </div>
                                    )}
                                    
                                    {/* Upload overlay */}
                                    <label className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm'>
                                        {loadingKey === slot.key ? (
                                            <span className='font-bold animate-pulse'>Uploading...</span>
                                        ) : (
                                            <>
                                                <FiUploadCloud size={24} className='mb-1' />
                                                <span className='font-semibold text-[13px]'>Upload New Image</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            accept='image/*' 
                                            className='hidden' 
                                            onChange={(e) => handleUpload(e, slot.key)}
                                            disabled={loadingKey === slot.key}
                                        />
                                    </label>
                                </div>
                                
                                <p className='text-[11px] text-gray-400 mt-auto bg-gray-50 p-2 rounded-lg'>
                                    Key: <code className='text-gray-600 font-bold'>{slot.key}</code>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banners
