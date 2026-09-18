import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import AdminContext from './context/AdminContext.jsx'

// Automatically attach admin Authorization header if token exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  if (token && token !== "undefined" && token !== "null") {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthContext>
    <AdminContext>
    <App />
    </AdminContext>
  </AuthContext>
  </BrowserRouter>
 
)
