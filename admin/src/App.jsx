import React, { useContext } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import Returns from './pages/Returns'
import Banners from './pages/Banners'
import Login from './pages/Login'
import { adminDataContext } from './context/AdminContext'
import { ToastContainer } from 'react-toastify';

function ProtectedAdminRoute({ children }) {
  const { adminData, loading } = useContext(adminDataContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className='w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-gray-50 gap-[12px]'>
        <div className='w-[36px] h-[36px] border-4 border-black border-t-transparent rounded-full animate-spin'></div>
        <span className='text-[13px] font-semibold text-gray-500'>Loading Admin Panel...</span>
      </div>
    )
  }

  if (!adminData) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function App() {
  const { adminData, loading } = useContext(adminDataContext)

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route 
          path='/login' 
          element={!loading && adminData ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route path='/' element={<ProtectedAdminRoute><Home /></ProtectedAdminRoute>} />
        <Route path='/add' element={<ProtectedAdminRoute><Add /></ProtectedAdminRoute>} />
        <Route path='/lists' element={<ProtectedAdminRoute><Lists /></ProtectedAdminRoute>} />
        <Route path='/list' element={<ProtectedAdminRoute><Lists /></ProtectedAdminRoute>} />
        <Route path='/orders' element={<ProtectedAdminRoute><Orders /></ProtectedAdminRoute>} />
        <Route path='/order' element={<ProtectedAdminRoute><Orders /></ProtectedAdminRoute>} />
        <Route path='/returns' element={<ProtectedAdminRoute><Returns /></ProtectedAdminRoute>} />
        <Route path='/return' element={<ProtectedAdminRoute><Returns /></ProtectedAdminRoute>} />
        <Route path='/banners' element={<ProtectedAdminRoute><Banners /></ProtectedAdminRoute>} />
        <Route path='/banner' element={<ProtectedAdminRoute><Banners /></ProtectedAdminRoute>} />
        <Route path='*' element={<ProtectedAdminRoute><Home /></ProtectedAdminRoute>} />
      </Routes>
    </>
  )
}

export default App
