import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

export default function AdminReturnsScreen() {
  const { adminToken } = useAdminAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ENDPOINTS.RETURNS.ALL, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReturns([...data].reverse());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch returns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [adminToken]);

  const handleUpdateReturn = async (returnId: string, status: string) => {
    try {
      const res = await fetch(ENDPOINTS.RETURNS.UPDATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ returnId, status }),
      });

      if (res.ok) {
        Alert.alert("Success", `Return status updated to ${status}.`);
        fetchReturns();
      } else {
        Alert.alert("Error", "Could not update return status.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Return Requests</Text>
          <Text style={styles.headerSub}>{returns.length} customer return requests</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchReturns}>
          <Ionicons name="refresh-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loaderText}>Loading Returns...</Text>
        </View>
      ) : returns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#000000" />
          <Text style={styles.emptyTitle}>No Pending Returns</Text>
          <Text style={styles.emptySub}>All customer return requests are up to date.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {returns.map((ret) => (
            <View key={ret._id} style={styles.returnCard}>
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>Order #{ret.orderId?.slice(-6)?.toUpperCase()}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{ret.status || "Pending"}</Text>
                </View>
              </View>

              <Text style={styles.reasonText}>
                <Text style={{ fontWeight: "700" }}>Reason: </Text>
                {ret.reason || "Product quality issue"}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleUpdateReturn(ret._id, "Approved")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleUpdateReturn(ret._id, "Rejected")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={16} color="#000000" />
                  <Text style={[styles.actionBtnText, { color: "#000000" }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  returnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000000",
  },
  statusBadge: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  reasonText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 12,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: "#000000",
  },
  rejectBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
