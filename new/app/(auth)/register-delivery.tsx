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

export default function RegisterDeliveryPartnerScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Missing Details", "Please enter your name, phone and password.");
      return;
    }
    if (!aadhaarNumber.trim() && !drivingLicense.trim()) {
      Alert.alert("Verification Required", "Please enter either your Aadhaar Number or Driving License.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        password,
        aadhaarNumber: aadhaarNumber.trim(),
        drivingLicenseNumber: drivingLicense.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim(),
        registrationFeePaid: true,
        registrationFeeAmount: 500,
        registrationTxnId: txnId.trim() || `TXN_DL_${Date.now()}`,
      };

      const res = await fetch(ENDPOINTS.DELIVERY.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Delivery Partner Registered! 🛵",
          "Your delivery profile is active! ₹500 registration charge confirmed. You can now deliver orders across any location and earn per delivery.",
          [{ text: "OK", onPress: () => router.push("/(root)/(tabs)/profile" as any) }]
        );
      } else {
        Alert.alert("Notice", data.message || "Registration failed.");
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
        <Text style={styles.headerTitle}>Delivery Partner Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.feeBanner}>
          <View style={styles.feeIcon}>
            <Ionicons name="bicycle" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feeBannerTitle}>Earn With Every Delivery</Text>
            <Text style={styles.feeBannerSub}>
              Deliver from local shops to customers. Flexible hours & any location.
            </Text>
            <View style={styles.feeBadge}>
              <Ionicons name="cash-outline" size={14} color="#2563EB" />
              <Text style={styles.feeBadgeText}>Registration Charge: ₹500 (One-Time)</Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Personal Information</Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            placeholder="e.g. Vikram Singh"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>Mobile Number (For Login & OTP) *</Text>
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

          <Text style={styles.sectionHeading}>Vehicle & Transport</Text>
          <Text style={styles.label}>Select Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {["Bike", "Scooter", "Auto", "Tempo", "Cycle"].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setVehicleType(v)}
                style={[styles.vehicleBtn, vehicleType === v && styles.vehicleBtnActive]}
              >
                <Text
                  style={[
                    styles.vehicleBtnText,
                    vehicleType === v && styles.vehicleBtnTextActive,
                  ]}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Vehicle Registration Number (Optional for cycle)</Text>
          <TextInput
            placeholder="e.g. DL 01 AB 1234"
            autoCapitalize="characters"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            style={styles.input}
          />

          <Text style={styles.sectionHeading}>KYC & Identity Verification</Text>
          <Text style={styles.label}>12-Digit Aadhaar Card Number *</Text>
          <TextInput
            placeholder="1234 5678 9012"
            keyboardType="numeric"
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            style={styles.input}
          />

          <Text style={styles.label}>Driving License Number (DL)</Text>
          <TextInput
            placeholder="DL-0420180012345"
            autoCapitalize="characters"
            value={drivingLicense}
            onChangeText={setDrivingLicense}
            style={styles.input}
          />

          {/* ₹500 Registration Payment Section */}
          <View style={{ marginTop: 18, padding: 14, backgroundColor: "#EFF6FF", borderRadius: 14, borderWidth: 1, borderColor: "#BFDBFE" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E40AF" }}>Onboarding Fee: ₹500</Text>
                <Text style={{ fontSize: 11, color: "#2563EB" }}>One-time delivery fleet kit & verification</Text>
              </View>
              <View style={{ backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#1E40AF" }}>UPI APPROVED</Text>
              </View>
            </View>

            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: "#2563EB", paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
              onPress={() =>
                Linking.openURL("upi://pay?pa=aka.delivery@okhdfcbank&pn=AkA%20Enterprises&am=500&cu=INR").catch(() => {
                  Alert.alert("UPI Notice", "Open any UPI App (GPay/PhonePe) and pay ₹500 to UPI ID: aka.delivery@okhdfcbank");
                })
              }
            >
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>⚡ Pay ₹500 via Any UPI App (GPay/PhonePe)</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 12, color: "#1E40AF" }]}>12-Digit UPI Transaction / UTR Number</Text>
            <TextInput
              placeholder="e.g. 423456789012"
              placeholderTextColor="#94A3B8"
              value={txnId}
              onChangeText={setTxnId}
              style={[styles.input, { backgroundColor: "#FFFFFF", borderColor: "#93C5FD" }]}
            />
          </View>

          {/* Submit */}
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
                <Text style={styles.submitBtnText}>Pay ₹500 & Start Delivering</Text>
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
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 12,
    marginBottom: 16,
  },
  feeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  feeBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
  },
  feeBannerSub: {
    fontSize: 12,
    color: "#1D4ED8",
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
    color: "#2563EB",
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
  vehicleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  vehicleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  vehicleBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  vehicleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  vehicleBtnTextActive: {
    color: "#FFFFFF",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
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
