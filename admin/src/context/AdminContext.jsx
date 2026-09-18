import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'

export const adminDataContext = createContext()
function AdminContext({children}) {
    let [adminData,setAdminData] = useState(null)
    let [loading,setLoading] = useState(true)
    let {serverUrl} = useContext(authDataContext)


    const getAdmin = async () => {
      try {
           const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
           if (!token) {
             setAdminData(null)
             setLoading(false)
             return
           }
           let result = await axios.get(serverUrl + "/api/user/getadmin", {
             withCredentials: true,
             headers: { Authorization: `Bearer ${token}` }
           })

      setAdminData(result.data)
      setLoading(false)
      } catch (error) {
        if (error.response?.status === 401) {
          setAdminData(null)
          localStorage.removeItem("adminToken")
          localStorage.removeItem("token")
        } else {
          console.log("getAdmin error:", error.response?.data || error.message)
        }
        setLoading(false)
      }
    }

    const logout = async () => {
      try {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("token")
        setAdminData(null)
        await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
      } catch (error) {
        console.log("admin logout error:", error)
      } finally {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("token")
        setAdminData(null)
      }
    }

    useEffect(()=>{
     getAdmin()
    },[])


    let value = {
      adminData,setAdminData,getAdmin,logout,loading
    }
  return (
    <div>
      <adminDataContext.Provider value={value}>
        {children}
      </adminDataContext.Provider>
    </div>
  )
}

export default AdminContext