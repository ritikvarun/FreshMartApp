import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/shopX.png"
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

function Nav() {
    let navigate = useNavigate()
    let { serverUrl } = useContext(authDataContext)
    let { logout } = useContext(adminDataContext)

    const logOut = async () => {
        try {
            await logout()
            toast.success("Logged out successfully")
            navigate("/login")
        } catch (error) {
            console.log(error)
            toast.error("LogOut Failed")
        }
    }

    return (
        <div className='w-full h-[64px] bg-white border-b border-gray-200 z-[60] fixed top-0 flex items-center justify-between px-[30px] shadow-sm'>
            <div className='flex items-center gap-[10px] cursor-pointer' onClick={() => navigate("/")}>
                <img src={logo} alt="ShopX" className='w-[130px]' />
                <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full'>Admin</span>
            </div>
            <button
                onClick={logOut}
                className='text-[13px] font-semibold bg-black text-white px-[18px] py-[8px] rounded-full hover:bg-gray-800 transition-all duration-200'
            >
                Log Out
            </button>
        </div>
    )
}

export default Nav
