import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

export default function Footer() {
  return (
    <View style={styles.container}>
      {/* 4 Trust Perks Grid */}
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

      {/* Clean Mobile App Brand Signoff */}
      <View style={styles.brandSignoff}>
        <View style={styles.brandBadge}>
          <Ionicons name="basket" size={15} color="#E05315" />
          <Text style={styles.brandBadgeText}>FreshMart</Text>
        </View>

        <Text style={styles.taglineText}>Eat Fresh • Live Healthy</Text>

        <Text style={styles.craftedText}>
          India's trusted fresh grocery store • Crafted with 💚
        </Text>

        <Text style={styles.copyrightText}>
          © 2026 FreshMart Inc.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 4,
    paddingBottom: 28,
  },
  perksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 24,
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
  brandSignoff: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF0F5",
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E05315",
    marginLeft: 5,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 4,
  },
  craftedText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 6,
  },
  copyrightText: {
    fontSize: 10,
    color: "#CBD5E1",
    fontWeight: "500",
  },
});
