import React, { useContext, useState } from 'react'
import logo from '../assets/shopX.png'
import { IoEyeOutline, IoEye } from "react-icons/io5";
import axios from 'axios'
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
    let [show, setShow] = useState(false)
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let { serverUrl } = useContext(authDataContext)
    let { getAdmin } = useContext(adminDataContext)
    let navigate = useNavigate()
    let location = useLocation()
    const [loading, setLoading] = useState(false)

    const from = location.state?.from?.pathname || "/"

    const AdminLogin = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
            const result = await axios.post(serverUrl + '/api/auth/adminlogin', { email, password }, { withCredentials: true })
            if (result.data?.token) {
                localStorage.setItem("adminToken", result.data.token)
            }
            toast.success("Admin Login Successful")
            await getAdmin()
            navigate(from, { replace: true })
        } catch (error) {
            toast.error("Admin Login Failed")
        }
        setLoading(false)
    }

    return (
        <div className='w-[100vw] h-[100vh] bg-gray-50 flex items-center justify-center'>
            <div className='w-[92%] max-w-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>

                {/* Header */}
                <div className='flex flex-col items-center pt-[36px] pb-[10px] gap-[8px]'>
                    <img src={logo} alt="ShopX" className='w-[110px]' />
                    <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full'>Admin Panel</span>
                    <h1 className='text-gray-900 text-[20px] font-bold mt-[4px]'>Admin Login</h1>
                    <p className='text-gray-400 text-[13px]'>Sign in to manage your store</p>
                </div>

                {/* Form */}
                <div className='px-[32px] pb-[32px] pt-[20px]'>
                    <form onSubmit={AdminLogin} className='flex flex-col gap-[14px]'>
                        <div>
                            <label className='text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-[6px] block'>Email</label>
                            <input
                                type="email"
                                placeholder='admin@shopx.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full h-[46px] rounded-xl px-[16px] text-gray-800 text-[14px] placeholder-gray-300 outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50'
                                style={{ border: '1px solid #e5e7eb' }}
                                required
                            />
                        </div>

                        <div>
                            <label className='text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-[6px] block'>Password</label>
                            <div className='relative'>
                                <input
                                    type={show ? "text" : "password"}
                                    placeholder='••••••••'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full h-[46px] rounded-xl px-[16px] pr-[46px] text-gray-800 text-[14px] placeholder-gray-300 outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50'
                                    style={{ border: '1px solid #e5e7eb' }}
                                    required
                                />
                                <button type='button' onClick={() => setShow(p => !p)}
                                    className='absolute right-[14px] top-[50%] translate-y-[-50%] text-gray-400 hover:text-gray-700'>
                                    {show ? <IoEye size={18} /> : <IoEyeOutline size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full h-[46px] rounded-xl font-semibold text-[15px] text-white flex items-center justify-center mt-[4px] bg-black hover:bg-gray-800 transition-all disabled:opacity-60'
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
