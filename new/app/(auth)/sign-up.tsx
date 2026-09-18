import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage("Please accept the Terms of Service to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const res = await register(fullName.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      router.replace("/(root)/(tabs)/profile" as any);
    } else {
      setErrorMessage(res.message || "Registration failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#1A1D26" />
            </TouchableOpacity>

            <View style={styles.logoRow}>
              <View style={styles.logoCircleSmall}>
                <Ionicons name="leaf" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.brandTitleSmall}>FreshMart</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Heading */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Create Account 🌿</Text>
            <Text style={styles.subtitle}>
              Sign up today and get 20% off on your first fresh organic delivery.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#8E94A4"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor="#A0A5B5"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </View>

            {/* Email Address */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#8E94A4"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#A0A5B5"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password (minimum 8 characters)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#8E94A4"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#A0A5B5"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage("");
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#8E94A4"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#8E94A4"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor="#A0A5B5"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage("");
                }}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxActive,
                ]}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSignUp}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Create Account</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Link to Sign In */}
          <View style={styles.bottomLinkRow}>
            <Text style={styles.bottomLinkText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E05315",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitleSmall: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D26",
    marginLeft: 6,
    letterSpacing: -0.3,
  },
  headerTextContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1D26",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#8B92A2",
    marginTop: 6,
    lineHeight: 19,
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1A1D26",
  },
  eyeIcon: {
    padding: 4,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: "#E05315",
    borderColor: "#E05315",
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  termsLink: {
    color: "#E05315",
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E05315",
    height: 52,
    borderRadius: 26,
    shadowColor: "#E05315",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEF0F4",
  },
  dividerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 6,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1D26",
    marginLeft: 8,
  },
  bottomLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomLinkText: {
    fontSize: 13,
    color: "#6B7280",
  },
  signinLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E05315",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
});
