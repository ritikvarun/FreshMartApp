# FreshMartApp 🛒🌿

A modern Fresh Grocery & E-Commerce full-stack application built with **React Native Expo** and **Node.js/Express MongoDB Backend**.

---

## 📁 Project Structure

- **`new/`**: React Native Expo mobile frontend
  - Modern shopping UI: Home, Wishlist (Saved), Explore (Search), Profile
  - Full Authentication UI: Sign In & Sign Up
  - Floating pill custom bottom tab navigation
  - Vector icons, custom pastel cards, rich imagery
- **`backend/`**: Express.js REST API & MongoDB Database
  - JWT Authentication (`/api/auth`)
  - Product catalog & listing (`/api/product`)
  - Cart management (`/api/cart`)
  - Orders & Returns (`/api/order`, `/api/return`)

---

## 🚀 Getting Started

### 1. Mobile App (Frontend)
```bash
cd new
npm install
npx expo start --go
```

### 2. Backend Server
```bash
cd backend
npm install
# Configure MONGODB_URL in .env
npm run dev
```
