import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PerkItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
}

const PERKS: PerkItem[] = [
  {
    id: "1",
    icon: "flash",
    title: "Fast Delivery",
    subtitle: "Under 30 mins delivery",
    iconBg: "#EBF8F2",
    iconColor: "#10B981",
  },
  {
    id: "2",
    icon: "leaf",
    title: "100% Organic",
    subtitle: "Farm-fresh daily harvest",
    iconBg: "#FFF4EE",
    iconColor: "#E05315",
  },
  {
    id: "3",
    icon: "shield-checkmark",
    title: "Safe Payment",
    subtitle: "100% secure checkout",
    iconBg: "#EEF4FF",
    iconColor: "#3B82F6",
  },
  {
    id: "4",
    icon: "headset",
    title: "24/7 Support",
    subtitle: "Instant help whenever needed",
    iconBg: "#F5F3FF",
    iconColor: "#8B5CF6",
  },
];

const QUICK_LINKS = [
  { id: "1", label: "About Us" },
  { id: "2", label: "Help Center" },
  { id: "3", label: "Return Policy" },
  { id: "4", label: "Privacy Policy" },
  { id: "5", label: "Terms of Service" },
];

const SOCIALS: { id: string; icon: keyof typeof Ionicons.glyphMap; name: string }[] = [
  { id: "1", icon: "logo-instagram", name: "Instagram" },
  { id: "2", icon: "logo-whatsapp", name: "WhatsApp" },
  { id: "3", icon: "logo-twitter", name: "Twitter" },
  { id: "4", icon: "mail-outline", name: "Email" },
];

export default function Footer() {
  const handleLinkPress = (label: string) => {
    Alert.alert(label, `Navigating to ${label}...`, [{ text: "OK" }]);
  };

  return (
    <View style={styles.container}>
      {/* 4 Perks Grid */}
      <View style={styles.perksGrid}>
        {PERKS.map((perk) => (
          <View key={perk.id} style={styles.perkCard}>
            <View style={[styles.perkIconWrapper, { backgroundColor: perk.iconBg }]}>
              <Ionicons name={perk.icon} size={20} color={perk.iconColor} />
            </View>
            <View style={styles.perkTextContainer}>
              <Text style={styles.perkTitle}>{perk.title}</Text>
              <Text style={styles.perkSubtitle}>{perk.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Brand & Mission Banner */}
      <View style={styles.brandCard}>
        <View style={styles.brandHeader}>
          <View style={styles.brandBadge}>
            <Ionicons name="basket" size={16} color="#E05315" />
            <Text style={styles.brandBadgeText}>FreshMart</Text>
          </View>
          <Text style={styles.brandTagline}>Eat Fresh • Live Healthy</Text>
        </View>

        <Text style={styles.brandDesc}>
          Bringing farm-fresh vegetables, organic fruits, and daily essentials
          straight to your door with care and quality.
        </Text>

        {/* Quick Links Chips */}
        <View style={styles.linksContainer}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkChip}
              onPress={() => handleLinkPress(link.label)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkChipText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Icons Row */}
        <View style={styles.socialRow}>
          {SOCIALS.map((social) => (
            <TouchableOpacity
              key={social.id}
              style={styles.socialBtn}
              onPress={() => handleLinkPress(social.name)}
              activeOpacity={0.75}
            >
              <Ionicons name={social.icon} size={18} color="#4A5060" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Copyright & Info Footer */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyrightText}>
          © 2026 FreshMart Inc. All rights reserved.
        </Text>
        <Text style={styles.loveText}>
          Crafted with 💚 for fresh lifestyles
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    paddingTop: 8,
  },
  perksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 20,
  },
  perkCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F2F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  perkIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  perkTextContainer: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D26",
    marginBottom: 3,
  },
  perkSubtitle: {
    fontSize: 11,
    color: "#8E94A4",
    lineHeight: 15,
  },
  brandCard: {
    backgroundColor: "#F9FAFC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF0F5",
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E05315",
    marginLeft: 5,
  },
  brandTagline: {
    fontSize: 11,
    color: "#8E94A4",
    fontWeight: "600",
  },
  brandDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  linkChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  linkChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EAECEF",
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bottomBar: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 3,
  },
  loveText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
