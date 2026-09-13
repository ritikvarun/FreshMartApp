# React Native Expo: Tabs Navigation Guide 🚀

Yeh guide aapko **Native Tabs** aur **Standard Tabs** ke beech ka difference samjhane ke liye banayi gayi hai, taaki aap asani se seekh sakein ki Android development ke dauran kaunsa tareeqa kab use karna chahiye.

---

## 📌 Context: Kya Problem Thi?
Pehle code mein `expo-router/unstable-native-tabs` ka use kiya ja raha tha. Isme icons display nahi ho rahe the kyunki:
* Isme use hone wala `sf` prop **SF Symbols** ke liye hai, jo sirf iOS (iPhone/iPad) par kaam karta hai.
* Android par icons lane ke liye custom native assets loading ya `getImageSourceSync` method ki zaroorat padti hai, jo **Expo Go** app ke saath seedhe compatible nahi hai (iske liye native build banana padta hai).

Isiliye humne ise badal kar **Standard Tabs** aur **Ionicons** par switch kiya, jo bina kisi problem ke har phone par perfectly chalta hai.

---

## 🆚 Comparison: Native Tabs vs Standard Tabs

| Feature | `unstable-native-tabs` (Native Tabs) | `expo-router` (Standard Tabs) |
| :--- | :--- | :--- |
| **Status** | 🧪 Alpha / Experimental (SDK 54+) | 🟢 Fully Stable (Recommended) |
| **Uper ka Control** | Pure Native OS UI (iOS/Android native controller) | Custom React Component (JavaScript-controlled) |
| **Icons support** | 🍎 iOS: SF Symbols <br> 🤖 Android: Complex configuration required | 🌎 Dono platforms par standard Vector Icons (`@expo/vector-icons`) support karta hai |
| **Expo Go compatibility** | ⚠️ Limited (Kayi features crash ya blank ho sakte hain) | ⚡ 100% Compatible |
| **Custom Styling** | Limited (Android/iOS ke standards ke hisab se) | Highly Customizable (CSS/Stylesheets easily apply hote hain) |

---

## 🛠️ Code Comparison: Kaise Badla Code?

### 1. Purana Tarika (Native Tabs - Experimental)
Is code mein icons native engine se load ho rahe the jo Android par fail ho gaya:

```tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" /> {/* ❌ SF Symbols sirf iOS par chalte hain */}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### 2. Naya Tarika (Standard Tabs - Stable & Recommended)
Isme standard React Navigation ka `Tabs` component use kiya gaya hai jo `@expo/vector-icons` se direct icons leta hai:

```tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons"; // Standard Vector Icons

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF", headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            // ✅ focused check karke active/inactive state change karte hain
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 💡 Android Learners Ke Liye Best Practices

1. **Stable API First:** Hamesha pehle stable API (`Tabs`, `Stack`, `Link`) ka use karein. Experimental (`unstable-`) features production apps ke liye nahi hote aur unme debugging resources bohot kam hote hain.
2. **Use Vector Icons:** React Native mein icons ke liye hamesha `@expo/vector-icons` ka use karein. Isme **Ionicons**, **FontAwesome**, **MaterialIcons**, etc., sab pehle se installed aate hain.
3. **Expo Go Limits:** Yaad rakhein ki Expo Go sirf React aur Javascript based packages ko run kar sakta hai. Agar aapko native configurations (jaise deep integrations, custom OS views) use karne hain, toh aapko Dev Client run karna padega (`npx expo run:android`).

---

## 📂 Kis File Me Change Hua?
Aap changes ko dekhne ke liye is file ko check kar sakte hain:
* 👉 [app/(root)/(tabs)/_layout.tsx](file:///c:/Users/This%20PC/Desktop/Rect%20Native%20Expo/new/app/(root)/(tabs)/_layout.tsx)

*Happy Coding! Seekhte raho aur aage badhte raho!* 💻🔥
