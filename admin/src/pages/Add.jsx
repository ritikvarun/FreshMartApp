import React, { useContext, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import upload from '../assets/upload image.jpg'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'

function Add() {
    let [image1, setImage1] = useState(false)
    let [image2, setImage2] = useState(false)
    let [image3, setImage3] = useState(false)
    let [image4, setImage4] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("Men")
    const [price, setPrice] = useState("")
    const [subCategory, setSubCategory] = useState("TopWear")
    const [bestseller, setBestSeller] = useState(false)
    const [sizes, setSizes] = useState([])
    const [loading, setLoading] = useState(false)
    let { serverUrl } = useContext(authDataContext)

    const handleAddProduct = async (e) => {
        setLoading(true)
        e.preventDefault()
        if (!image1) {
            toast.error("Primary product image (Image 1) is required"); setLoading(false); return
        }
        if (!name || !description || !price) {
            toast.error("All fields are required"); setLoading(false); return
        }
        if (sizes.length === 0) {
            toast.error("Select at least one size"); setLoading(false); return
        }
        try {
            let formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("category", category)
            formData.append("subCategory", subCategory)
            formData.append("bestseller", bestseller)
            formData.append("sizes", JSON.stringify(sizes))
            formData.append("image1", image1)
            formData.append("image2", image2 || image1)
            formData.append("image3", image3 || image1)
            formData.append("image4", image4 || image1)
            let result = await axios.post(serverUrl + "/api/product/addproduct", formData, { withCredentials: true })
            toast.success("Product Added Successfully!")
            if (result.data) {
                setName(""); setDescription(""); setImage1(false); setImage2(false)
                setImage3(false); setImage4(false); setPrice(""); setBestSeller(false)
                setCategory("Men"); setSubCategory("TopWear"); setSizes([])
            }
        } catch (error) {
            console.error("Add product error:", error)
            const errMsg = error.response?.data?.message || error.message || "Add Product Failed"
            toast.error(errMsg)
        }
        setLoading(false)
    }

    const inputClass = 'w-full h-[44px] rounded-xl px-[14px] text-gray-800 text-[14px] placeholder-gray-300 outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50 border border-gray-200'
    const labelClass = 'text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-[6px] block'
    const sizeBtn = (size) => {
        const active = sizes.includes(size)
        return (
            <button
                type='button'
                key={size}
                onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                className={`w-[50px] h-[44px] rounded-xl text-[14px] font-semibold border transition-all
                    ${active ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'}`}
            >
                {size}
            </button>
        )
    }

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gray-50'>
            <Nav />
            <Sidebar />

            <div className='md:ml-[220px] pt-[64px] pb-[100px] md:pb-[32px] p-[16px] md:p-[32px]'>
                <div className='mb-[28px]'>
                    <h1 className='text-[26px] font-bold text-gray-900'>Add Product</h1>
                    <p className='text-gray-400 text-[14px] mt-[4px]'>Fill in the details to add a new product</p>
                </div>

                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-[32px] max-w-[760px]'>
                    <form onSubmit={handleAddProduct} className='flex flex-col gap-[24px]'>

                        {/* Images */}
                        <div>
                            <div className='flex items-center justify-between mb-[6px]'>
                                <label className={labelClass + ' mb-0'}>Product Images (Image 1 Required · 2-4 Optional)</label>
                                <span className='text-[11px] text-gray-400'>Supports PNG, JPG, WEBP</span>
                            </div>
                            <div className='flex gap-[14px] flex-wrap'>
                                {[
                                    [image1, setImage1, 'image1', 'Main *'],
                                    [image2, setImage2, 'image2', 'Image 2'],
                                    [image3, setImage3, 'image3', 'Image 3'],
                                    [image4, setImage4, 'image4', 'Image 4'],
                                ].map(([img, setImg, id, label]) => (
                                    <div key={id} className='flex flex-col items-center gap-[4px]'>
                                        <label htmlFor={id} className='cursor-pointer'>
                                            <div className={`w-[90px] h-[90px] rounded-xl border-2 overflow-hidden transition-all relative
                                                ${img ? 'border-black ring-2 ring-black/10' : 'border-dashed border-gray-300 hover:border-gray-500 bg-gray-50'}`}>
                                                <img
                                                    src={img ? URL.createObjectURL(img) : upload}
                                                    alt=""
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <input type="file" id={id} accept="image/*" hidden onChange={(e) => setImg(e.target.files[0])} />
                                        </label>
                                        <span className='text-[11px] font-medium text-gray-500'>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className={labelClass}>Product Name</label>
                            <input type="text" placeholder='e.g. Classic White Shirt' className={inputClass} onChange={(e) => setName(e.target.value)} value={name} required />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Product Description</label>
                            <textarea placeholder='Write product description...' className='w-full h-[100px] rounded-xl px-[14px] py-[10px] text-gray-800 text-[14px] placeholder-gray-300 outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50 border border-gray-200 resize-none' onChange={(e) => setDescription(e.target.value)} value={description} required />
                        </div>

                        {/* Category & SubCategory */}
                        <div className='flex gap-[20px] flex-wrap'>
                            <div className='flex-1 min-w-[160px]'>
                                <label className={labelClass}>Category</label>
                                <select className={inputClass} onChange={(e) => setCategory(e.target.value)} value={category}>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                            <div className='flex-1 min-w-[160px]'>
                                <label className={labelClass}>Sub-Category</label>
                                <select className={inputClass} onChange={(e) => setSubCategory(e.target.value)} value={subCategory}>
                                    <option value="TopWear">TopWear</option>
                                    <option value="BottomWear">BottomWear</option>
                                    <option value="WinterWear">WinterWear</option>
                                    <option value="Shoes">Shoes</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className={labelClass}>Price (₹)</label>
                            <input type="number" placeholder='e.g. 1999' className={inputClass} onChange={(e) => setPrice(e.target.value)} value={price} required />
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className={labelClass}>Sizes</label>
                            <div className='flex gap-[10px] flex-wrap'>
                                {['S', 'M', 'L', 'XL', 'XXL'].map(sizeBtn)}
                            </div>
                        </div>

                        {/* Bestseller */}
                        <div className='flex items-center gap-[10px]'>
                            <input type="checkbox" id='bestseller' className='w-[18px] h-[18px] accent-black cursor-pointer' onChange={() => setBestSeller(prev => !prev)} checked={bestseller} />
                            <label htmlFor='bestseller' className='text-[14px] font-medium text-gray-700 cursor-pointer'>Mark as Bestseller</label>
                        </div>

                        {/* Submit */}
                        <button
                            type='submit'
                            className='w-fit px-[32px] h-[46px] rounded-xl bg-black text-white font-semibold text-[14px] flex items-center justify-center gap-[8px] hover:bg-gray-800 transition-all'
                        >
                            {loading ? <Loading /> : 'Add Product'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Add
