import React, { useState, useEffect } from "react";
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
  Image,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

interface BannerSlot {
  id: string;
  badge: string;
  title: string;
  discount: string;
  offText?: string;
  btnText: string;
  categoryFilter?: string;
  bgColor?: string;
  accentColor?: string;
  imageUrl: string;
}

const CATEGORIES = ["All", "Men", "Women", "Kids", "Shoes", "Accessories"];

export default function AdminBannersScreen() {
  const { adminToken } = useAdminAuth();
  const [banners, setBanners] = useState<BannerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  // Edit modal / Photo options state
  const [activeSlotModal, setActiveSlotModal] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.SETTINGS.GET_BANNERS);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBannerField = (index: number, field: keyof BannerSlot, value: string) => {
    const updated = [...banners];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setBanners(updated);
  };

  // Gallery Picker
  const pickFromGallery = async (slotIndex: number) => {
    setActiveSlotModal(null);
    setShowUrlInput(false);
    setTimeout(async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Photo library permission is needed.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          updateBannerField(slotIndex, "imageUrl", result.assets[0].uri);
        }
      } catch (err: any) {
        Alert.alert("Picker Error", err.message || "Failed to pick image");
      }
    }, 150);
  };

  // Camera Picker
  const takePhotoWithCamera = async (slotIndex: number) => {
    setActiveSlotModal(null);
    setShowUrlInput(false);
    setTimeout(async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Camera permission is needed.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          updateBannerField(slotIndex, "imageUrl", result.assets[0].uri);
        }
      } catch (err: any) {
        Alert.alert("Camera Error", err.message || "Failed to take photo");
      }
    }, 150);
  };

  const applyUrl = (slotIndex: number) => {
    if (!urlInput.trim()) {
      Alert.alert("Invalid URL", "Please enter a valid image URL");
      return;
    }
    updateBannerField(slotIndex, "imageUrl", urlInput.trim());
    setUrlInput("");
    setShowUrlInput(false);
    setActiveSlotModal(null);
  };

  // Save Banner to Backend
  const saveBannerSlot = async (index: number) => {
    const banner = banners[index];
    if (!banner) return;

    setSavingIndex(index);
    try {
      const formData = new FormData();
      formData.append("slotIndex", String(index));
      formData.append("title", banner.title || `Banner ${index + 1}`);
      formData.append("badge", banner.badge || "SPECIAL OFFER");
      formData.append("discount", banner.discount || "30%");
      formData.append("offText", banner.offText || "OFF");
      formData.append("btnText", banner.btnText || "Shop Now");
      formData.append("categoryFilter", banner.categoryFilter || "All");

      // Check if image is a local file URI or remote URL
      if (
        banner.imageUrl &&
        (banner.imageUrl.startsWith("file://") ||
          banner.imageUrl.startsWith("content://") ||
          banner.imageUrl.startsWith("ph://"))
      ) {
        const filename = banner.imageUrl.split("/").pop() || `banner_${index + 1}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: banner.imageUrl,
          name: filename,
          type,
        } as any);
      } else {
        formData.append("imageUrl", banner.imageUrl || "");
      }

      const res = await fetch(ENDPOINTS.SETTINGS.UPDATE_BANNER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", `Banner #${index + 1} updated successfully!`);
        if (data.banners) {
          setBanners(data.banners);
        }
      } else {
        Alert.alert("Error", data.message || "Failed to update banner");
      }
    } catch (err: any) {
      console.error("Update banner error:", err);
      Alert.alert("Error", "Network error while saving banner");
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Promotional Banners</Text>
          <Text style={styles.headerSubtitle}>
            Manage 5 auto-scrolling banners on the customer app
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchBanners}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05315" />
          <Text style={styles.loadingText}>Loading banners...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {banners.map((banner, index) => {
            const isSaving = savingIndex === index;
            return (
              <View key={banner.id || index} style={styles.bannerCard}>
                {/* Slot Header */}
                <View style={styles.slotHeader}>
                  <View style={styles.slotBadge}>
                    <Text style={styles.slotBadgeText}>SLOT {index + 1} OF 5</Text>
                  </View>
                  <Text style={styles.slotTitlePreview} numberOfLines={1}>
                    {banner.title || "Untitled Banner"}
                  </Text>
                </View>

                {/* Banner Image Preview / Picker Box */}
                <View style={styles.imagePreviewContainer}>
                  {banner.imageUrl ? (
                    <Image
                      source={{ uri: banner.imageUrl }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImageBox}>
                      <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                      <Text style={styles.noImageText}>No image selected</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.changePhotoBtn}
                    onPress={() => {
                      setActiveSlotModal(index);
                      setShowUrlInput(false);
                      setUrlInput("");
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="camera" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.changePhotoBtnText}>
                      {banner.imageUrl ? "Change Photo" : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Editable Fields */}
                <View style={styles.formFields}>
                  {/* Headline Title */}
                  <Text style={styles.inputLabel}>BANNER HEADLINE / TITLE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Urban Streetwear"
                    placeholderTextColor="#9CA3AF"
                    value={banner.title}
                    onChangeText={(val) => updateBannerField(index, "title", val)}
                  />

                  {/* Badge & Discount Row */}
                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>TOP BADGE TEXT</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. SUMMER DROP '26"
                        placeholderTextColor="#9CA3AF"
                        value={banner.badge}
                        onChangeText={(val) => updateBannerField(index, "badge", val)}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.inputLabel}>DISCOUNT / OFFER</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. 40%"
                        placeholderTextColor="#9CA3AF"
                        value={banner.discount}
                        onChangeText={(val) => updateBannerField(index, "discount", val)}
                      />
                    </View>
                  </View>

                  {/* Button Text */}
                  <Text style={styles.inputLabel}>BUTTON LABEL</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Shop Collection"
                    placeholderTextColor="#9CA3AF"
                    value={banner.btnText}
                    onChangeText={(val) => updateBannerField(index, "btnText", val)}
                  />

                  {/* Link Category Filter */}
                  <Text style={styles.inputLabel}>TARGET CATEGORY (ON CLICK)</Text>
                  <View style={styles.categoryChipsRow}>
                    {CATEGORIES.map((cat) => {
                      const isSel = (banner.categoryFilter || "All").toLowerCase() === cat.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.categoryChip, isSel && styles.categoryChipActive]}
                          onPress={() => updateBannerField(index, "categoryFilter", cat)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSel && styles.categoryChipTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Save Button for this Slot */}
                <TouchableOpacity
                  style={[styles.saveSlotBtn, isSaving && { opacity: 0.7 }]}
                  onPress={() => saveBannerSlot(index)}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.saveSlotBtnText}>Save Banner #{index + 1}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Photo Picker Modal */}
      {activeSlotModal !== null && (
        <Modal
          visible={activeSlotModal !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveSlotModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Photo Option</Text>
                <TouchableOpacity onPress={() => setActiveSlotModal(null)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => pickFromGallery(activeSlotModal)}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Ionicons name="images" size={22} color="#4F46E5" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.modalOptionSubtitle}>Pick an existing banner from device</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => takePhotoWithCamera(activeSlotModal)}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="camera" size={22} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Take Photo with Camera</Text>
                  <Text style={styles.modalOptionSubtitle}>Capture new photo instantly</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => setShowUrlInput(!showUrlInput)}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="link" size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Paste Image URL</Text>
                  <Text style={styles.modalOptionSubtitle}>Use hosted image link</Text>
                </View>
              </TouchableOpacity>

              {showUrlInput && (
                <View style={styles.urlInputBox}>
                  <TextInput
                    style={styles.urlTextInput}
                    placeholder="https://example.com/banner.jpg"
                    placeholderTextColor="#9CA3AF"
                    value={urlInput}
                    onChangeText={setUrlInput}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.applyUrlBtn}
                    onPress={() => applyUrl(activeSlotModal)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.applyUrlBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  slotBadge: {
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  slotTitlePreview: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    maxWidth: "60%",
  },
  imagePreviewContainer: {
    width: "100%",
    height: 155,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
    marginBottom: 16,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  noImageBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    fontWeight: "500",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  changePhotoBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  formFields: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#E05315",
    borderColor: "#E05315",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  saveSlotBtn: {
    backgroundColor: "#111827",
    height: 46,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  saveSlotBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalOptionSubtitle: {
    fontSize: 11.5,
    color: "#6B7280",
    marginTop: 2,
  },
  urlInputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  urlTextInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#111827",
  },
  applyUrlBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  applyUrlBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
