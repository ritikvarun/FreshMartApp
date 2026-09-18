import React from 'react'
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { TbArrowBackUp } from "react-icons/tb";
import { FiImage } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    let navigate = useNavigate()
    let location = useLocation()

    const links = [
        { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
        { path: '/add', label: 'Add Product', icon: <IoIosAddCircleOutline /> },
        { path: '/lists', label: 'Products', icon: <FaRegListAlt /> },
        { path: '/orders', label: 'Orders', icon: <SiTicktick /> },
        { path: '/returns', label: 'Returns', icon: <TbArrowBackUp /> },
        { path: '/banners', label: 'Site Images', icon: <FiImage /> },
    ]

    return (
        <div className='bg-white border-gray-200 z-50 flex
            fixed w-full bottom-0 left-0 border-t flex-row justify-around py-[8px] pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]
            md:shadow-none md:w-[220px] md:min-h-[100vh] md:border-r md:border-t-0 md:top-0 md:pt-[80px] md:flex-col md:py-0 md:justify-start
        '>
            <div className='flex flex-row w-full justify-around md:px-[16px] md:mt-[16px] md:flex-col md:gap-[4px]'>
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <div
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`flex flex-col md:flex-row items-center gap-[4px] md:gap-[12px] px-[12px] md:px-[16px] py-[6px] md:py-[11px] rounded-xl cursor-pointer transition-all duration-150
                                ${isActive
                                    ? 'text-black font-bold md:bg-black md:text-white md:font-medium'
                                    : 'text-gray-400 md:text-gray-600 font-medium md:hover:bg-gray-100'
                                }`}
                        >
                            <div className='text-[22px] md:text-[18px]'>{link.icon}</div>
                            <span className='text-[10px] md:text-[14px]'>{link.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Sidebar
