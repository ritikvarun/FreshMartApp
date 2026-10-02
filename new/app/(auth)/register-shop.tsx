import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ENDPOINTS } from "../../config/api";

export default function RegisterShopScreen() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Kirana & Grocery");
  const [idType, setIdType] = useState<"gst" | "aadhaar">("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Delhi NCR");
  const [pinCode, setPinCode] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feePaidSuccess, setFeePaidSuccess] = useState(true); // ₹500 fee

  const handleSubmit = async () => {
    if (!shopName.trim() || !ownerName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in shop name, owner name, phone and password.");
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert(
        "Verification Required",
        `Please provide your ${idType === "gst" ? "GST Number" : "Aadhaar Number"} for merchant onboarding.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: shopName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        password,
        category,
        gstNumber: idType === "gst" ? idNumber.trim() : "",
        aadhaarNumber: idType === "aadhaar" ? idNumber.trim() : "",
        address: {
          street: street.trim(),
          city: city.trim(),
          pinCode: pinCode.trim(),
        },
        registrationFeePaid: feePaidSuccess,
        registrationFeeAmount: 500,
        registrationTxnId: txnId.trim() || `TXN_SH_${Date.now()}`,
      };

      const res = await fetch(ENDPOINTS.SHOPS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Registration Successful! 🎉",
          "Your shop has been onboarded! ₹500 registration charge received. You can now login and list your materials.",
          [{ text: "Go to Shops", onPress: () => router.push("/(root)/shops" as any) }]
        );
      } else {
        Alert.alert("Registration Notice", data.message || "Could not register shop.");
      }
    } catch (err: any) {
      Alert.alert("Network Error", "Could not reach server: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Partner Onboarding</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.feeBanner}>
          <View style={styles.feeIcon}>
            <Ionicons name="storefront" size={24} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feeBannerTitle}>Register Your Shop / Store</Text>
            <Text style={styles.feeBannerSub}>
              Sell fresh veggies, fruits, daily milk & kirana groceries to local customers.
            </Text>
            <View style={styles.feeBadge}>
              <Ionicons name="cash-outline" size={14} color="#059669" />
              <Text style={styles.feeBadgeText}>Registration Charge: ₹500 (One-Time)</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Shop & Owner Details</Text>

          <Text style={styles.label}>Shop / Business Name *</Text>
          <TextInput
            placeholder="e.g. Gupta Daily Kirana Store"
            value={shopName}
            onChangeText={setShopName}
            style={styles.input}
          />

          <Text style={styles.label}>Proprietor / Owner Name *</Text>
          <TextInput
            placeholder="e.g. Ramesh Sharma"
            value={ownerName}
            onChangeText={setOwnerName}
            style={styles.input}
          />

          <Text style={styles.label}>Mobile Number (For WhatsApp & Login) *</Text>
          <TextInput
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />

          <Text style={styles.label}>Create Password *</Text>
          <TextInput
            placeholder="Minimum 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Text style={styles.label}>Business Category</Text>
          <View style={styles.categoryRow}>
            {["Kirana & Grocery", "Fruits & Vegetables", "Dairy & Bakery", "Supermarket"].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
              >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Verification with Aadhaar or GST */}
          <Text style={styles.sectionHeading}>KYC & Legal Verification</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setIdType("aadhaar")}
              style={[styles.toggleBtn, idType === "aadhaar" && styles.toggleBtnActive]}
            >
              <Text
                style={[styles.toggleBtnText, idType === "aadhaar" && styles.toggleBtnTextActive]}
              >
                Aadhaar Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIdType("gst")}
              style={[styles.toggleBtn, idType === "gst" && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleBtnText, idType === "gst" && styles.toggleBtnTextActive]}>
                GST Number
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            {idType === "gst" ? "15-Digit GSTIN Number *" : "12-Digit Aadhaar Number *"}
          </Text>
          <TextInput
            placeholder={idType === "gst" ? "07AAAAA0000A1Z5" : "1234 5678 9012"}
            value={idNumber}
            onChangeText={setIdNumber}
            style={styles.input}
          />

          {/* Address */}
          <Text style={styles.sectionHeading}>Shop Location & Address</Text>
          <Text style={styles.label}>Shop Street / Market Address</Text>
          <TextInput
            placeholder="Shop No. 12, Main Mandi Road"
            value={street}
            onChangeText={setStreet}
            style={styles.input}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City / State</Text>
              <TextInput value={city} onChangeText={setCity} style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PIN Code</Text>
              <TextInput
                placeholder="110001"
                keyboardType="numeric"
                value={pinCode}
                onChangeText={setPinCode}
                style={styles.input}
              />
            </View>
          </View>

          {/* ₹500 Registration Payment Section */}
          <View style={{ marginTop: 18, padding: 14, backgroundColor: "#F0FDF4", borderRadius: 14, borderWidth: 1, borderColor: "#BBF7D0" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#166534" }}>Onboarding Fee: ₹500</Text>
                <Text style={{ fontSize: 11, color: "#15803D" }}>One-time merchant verification charge</Text>
              </View>
              <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#166534" }}>UPI APPROVED</Text>
              </View>
            </View>

            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: "#059669", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
              onPress={() =>
                Linking.openURL("upi://pay?pa=aka.merchant@okhdfcbank&pn=AkA%20Enterprises&am=500&cu=INR").catch(() => {
                  Alert.alert("UPI Notice", "Open any UPI App (GPay/PhonePe) and pay ₹500 to UPI ID: aka.merchant@okhdfcbank");
                })
              }
            >
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>⚡ Pay ₹500 via Any UPI App (GPay/PhonePe)</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 12, color: "#166534" }]}>12-Digit UPI Transaction / UTR Number</Text>
            <TextInput
              placeholder="e.g. 423456789012"
              placeholderTextColor="#94A3B8"
              value={txnId}
              onChangeText={setTxnId}
              style={[styles.input, { backgroundColor: "#FFFFFF", borderColor: "#86EFAC" }]}
            />
          </View>

          {/* Submit Button with Fee Confirmation */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.submitBtnInner}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Pay ₹500 & Register Shop</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  feeBanner: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
    marginBottom: 16,
  },
  feeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  feeBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  feeBannerSub: {
    fontSize: 12,
    color: "#047857",
    marginTop: 2,
    lineHeight: 16,
  },
  feeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  feeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catBtnActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  catBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  catBtnTextActive: {
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleBtnTextActive: {
    color: "#111827",
    fontWeight: "700",
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  submitBtn: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
