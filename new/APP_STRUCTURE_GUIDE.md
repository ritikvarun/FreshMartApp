# 📱 React Native Expo: Folder Structure & Architecture Guide 🚀
*(Special Guide for Web Developers transitioning to React Native Expo)*

---

## 🎯 Quick Intro: Web Dev vs Expo Router
Agar aapne **React / Next.js (App Router)** use kiya hai, toh Expo Router bilkul wahi cheez hai:
* **File-Based Routing:** Jo file banayenge, wahi screen/route banega.
* **Layouts (`_layout.tsx`):** Header, Navigation, aur Providers ko wrap karne ke liye.
* **Route Groups `(name)`:** URL clean rakhne aur alag-alag navigation rules set karne ke liye.

---

## 📂 Complete Folder Structure Map

```text
📁 app/
│
├── 📄 _layout.tsx         👉 [Global Layout] Pure app ke common providers (SafeAreaProvider, Styles)
│                             aur main Stack Navigation.
│
├── 📄 index.tsx           👉 [App Entry Gate] App open hote hi pehle yahan aati hai.
│                             Decision leti hai: User ko Auth (Login) bhejna hai ya Home par.
│
├── 📁 (auth)/             👉 [Authentication Group] (Sign In / Sign Up screens)
│   ├── 📄 _layout.tsx     👉 Stack layout (bina bottom bar ke, smooth slide animations)
│   ├── 📄 sign-in.tsx     👉 Login Screen (`/sign-in`)
│   └── 📄 sign-up.tsx     👉 Registration Screen (`/sign-up`)
│
└── 📁 (root)/             👉 [Main App Area] (Login ke baad user yahan rehta hai)
    ├── 📄 _layout.tsx     👉 Root Stack Navigator
    └── 📁 (tabs)/         👉 [Bottom Navigation Bar] (Floating pill bar)
        ├── 📄 _layout.tsx 👉 Tabs configuration (Icons, Active colors, Pill styling)
        ├── 📄 index.tsx   👉 Home Screen (Header, Search, Categories, Products, Footer)
        ├── 📄 saved.tsx   👉 Wishlist / Favorites Screen
        ├── 📄 search.tsx  👉 Search & Filter Screen
        └── 📄 profile.tsx 👉 User Profile & Settings Screen
```

---

## 🔍 Detail Explanation: Har Cheez Kaise Kaam Karti Hai?

### 1. Brackets `( )` wale folders kya hain? (Route Groups)
* **Normal folder:** `app/about/index.tsx` ka URL banega `/about`.
* **Bracket folder:** `app/(auth)/sign-in.tsx` ka URL banega `/sign-in` (isme `(auth)` URL me gayab rehta hai).
* **Fayda:** Isse aap screens ko alag categories me baant sakte hain bina URL ko kharab kiye, aur har group ko alag layout de sakte hain.

---

### 2. Mobile ke 2 Main Navigation Systems:

#### A. Tab Navigation (`(tabs)`)
* Mobile screen ke neeche jo floating/fixed bar hoti hai (Home, Saved, Search, Profile).
* Inme page reload nahi hota, tabs turant swap hote hain.
* Code control: `app/(root)/(tabs)/_layout.tsx`.

#### B. Stack Navigation (`<Stack />`)
* Taash ke patton (cards) ki tarah ek screen ke upar doosri screen slide hokar aati hai.
* Jab aap kisi product card par click karenge, toh nayi screen upar aayegi aur top par back button `<--` automatic mil jata hai.

---

### 3. Entry Gate: `app/index.tsx`

Abhi is file me yeh likha hai:
```tsx
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(root)/(tabs)" />;
}
```
**Future Auth Logic:**
Jab aap login flow ready karenge, toh yahan check karenge ki user logged in hai ya nahi:
```tsx
import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false; // Token ya Clerk user check

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(root)/(tabs)" />;
}
```

---

### 4. Future Development: "Nayi Screen kahan banayein?" (Cheat-Sheet)

| Screen jo aapko banani hai | File ka Path | Kyun wahan? |
| :--- | :--- | :--- |
| **Naya Bottom Tab (e.g. Cart)** | `app/(root)/(tabs)/cart.tsx` | Taaki neeche floating bottom tab bar dikhta rahe |
| **Product Details Screen** | `app/(root)/product/[id].tsx` | Full-screen aani chahiye, neeche tab bar hide hona chahiye |
| **Checkout / Payment Screen** | `app/(root)/checkout.tsx` | Form submission screen (Full width, no tabs) |
| **Order History Screen** | `app/(root)/orders.tsx` | User orders ki detail list |
| **Forgot Password Screen** | `app/(auth)/forgot-password.tsx` | Auth group ka part hai |

---

### 5. Expo Go Commands Reference

* **Expo Go dev server start karne ke liye:**
  ```bash
  cd new
  npx expo start --go
  ```
* **QR code scan karein** apne Android phone me **Expo Go** app se.

---

*Keep building and happy coding! 🌿🛒*
