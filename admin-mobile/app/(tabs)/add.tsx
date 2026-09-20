import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ENDPOINTS } from "../../config/api";

const CATEGORIES = ["Men", "Women", "Kids", "Shoes", "Accessories", "Unisex", "Grocery", "Beauty"];
const SUB_CATEGORIES = ["TopWear", "BottomWear", "WinterWear", "Shoes", "Accessories"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11", "12"];
const ACCESSORY_SIZES = ["Free Size", "Standard", "One Size", "S", "M", "L"];

export default function AdminAddProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { adminToken } = useAdminAuth();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("TopWear");
  const [sizeType, setSizeType] = useState<"clothing" | "shoes" | "accessories">("clothing");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L"]);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.category) {
      setCategory(params.category);
      if (params.category.toLowerCase() === "shoes") {
        setSubCategory("Shoes");
        setSizeType("shoes");
        setSelectedSizes(["7", "8", "9", "10"]);
      } else if (params.category.toLowerCase() === "accessories") {
        setSubCategory("Accessories");
        setSizeType("accessories");
        setSelectedSizes(["Free Size"]);
      }
    }
  }, [params.category]);

  // 5 Photo Slots System
  const [images, setImages] = useState<string[]>(["", "", "", "", ""]);
  const [activeSlotModal, setActiveSlotModal] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const updateImageSlot = (slotIndex: number, urlOrUri: string) => {
    const updated = [...images];
    updated[slotIndex] = urlOrUri.trim();
    setImages(updated);
  };

  const removeImageSlot = (slotIndex: number) => {
    const updated = [...images];
    updated[slotIndex] = "";
    setImages(updated);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Gallery Picker
  const pickFromGallery = async (slotIndex: number) => {
    setActiveSlotModal(null);
    setShowUrlInput(false);
    setTimeout(async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Photo library permission is needed to choose product photos from your device."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          updateImageSlot(slotIndex, result.assets[0].uri);
        }
      } catch (err: any) {
        console.error("Gallery picker error:", err);
        Alert.alert("Picker Error", err.message || "Failed to pick image from gallery");
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
          Alert.alert(
            "Permission Required",
            "Camera permission is needed to take product photos."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          updateImageSlot(slotIndex, result.assets[0].uri);
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        Alert.alert("Camera Error", err.message || "Failed to capture photo");
      }
    }, 150);
  };

  const handleAddProduct = async () => {
    if (!images[0]) {
      Alert.alert("Required", "Primary product photo (Slot 1) is required! Please upload an image.");
      return;
    }
    if (!name.trim() || !description.trim() || !price.trim()) {
      Alert.alert("Missing Fields", "Please enter Product Title, Description, and Price.");
      return;
    }
    if (selectedSizes.length === 0) {
      Alert.alert("Size Required", "Please select at least one available size.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price.trim());
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", String(bestseller));
      formData.append("sizes", JSON.stringify(selectedSizes));

      // Append all 5 slots (supporting direct device files or URLs)
      images.forEach((imgUri, index) => {
        const fieldName = `image${index + 1}`;
        if (imgUri && imgUri.trim()) {
          const cleanUri = imgUri.trim();
          if (cleanUri.startsWith("http://") || cleanUri.startsWith("https://")) {
            formData.append(fieldName, cleanUri);
          } else {
            const filename = cleanUri.split("/").pop() || `photo_${index + 1}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? match[1].toLowerCase() : "jpg";
            const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

            formData.append(fieldName, {
              uri: cleanUri,
              name: filename,
              type: mimeType,
            } as any);
          }
        }
      });

      const res = await fetch(ENDPOINTS.PRODUCTS.ADD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      Alert.alert(
        "Product Added! 🎉",
        `"${name}" has been published to the catalog.`,
        [
          {
            text: "View Inventory",
            onPress: () => router.push("/(tabs)/products"),
          },
          {
            text: "Add Another",
            style: "cancel",
            onPress: () => {
              setName("");
              setDescription("");
              setPrice("");
              setCategory("Men");
              setSubCategory("TopWear");
              setSelectedSizes(["M", "L"]);
              setBestseller(false);
              setImages(["", "", "", "", ""]);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error Adding Product", err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <Text style={styles.headerSubtitle}>E-Commerce Fashion & Lifestyle Store</Text>
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => {
            // Quick Demo auto-fill for fast testing
            setName("Premium Relaxed Fit Cotton Shirt");
            setDescription("Crafted from 100% breathable organic combed cotton with double-stitched durability and minimalist collar design.");
            setPrice("1499");
            setCategory("Men");
            setSubCategory("TopWear");
            setSelectedSizes(["M", "L", "XL"]);
            setBestseller(true);
            setImages([
              "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
              "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
              "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
              "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
            ]);
          }}
        >
          <Ionicons name="sparkles-outline" size={16} color="#111827" />
          <Text style={styles.demoFillText}>Auto-Fill</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 5 Photo Upload Slots */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Product Images</Text>
              <Text style={styles.sectionSubtitle}>
                Slot 1 is Main thumbnail · Slots 2–5 for alternate angles
              </Text>
            </View>
            <View style={styles.imageCounterBadge}>
              <Text style={styles.imageCounterText}>
                {images.filter(Boolean).length}/5 Added
              </Text>
            </View>
          </View>

          <View style={styles.slotsRow}>
            {[
              { slot: 0, label: "Main *", req: true },
              { slot: 1, label: "Angle 2", req: false },
              { slot: 2, label: "Angle 3", req: false },
              { slot: 3, label: "Angle 4", req: false },
              { slot: 4, label: "Angle 5", req: false },
            ].map(({ slot, label, req }) => {
              const currentImg = images[slot];
              return (
                <View key={slot} style={styles.slotContainer}>
                  <TouchableOpacity
                    style={[
                      styles.slotBox,
                      currentImg ? styles.slotBoxFilled : styles.slotBoxEmpty,
                    ]}
                    onPress={() => {
                      setUrlInput(currentImg || "");
                      setActiveSlotModal(slot);
                    }}
                    activeOpacity={0.8}
                  >
                    {currentImg ? (
                      <Image source={{ uri: currentImg }} style={styles.slotImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.slotPlaceholder}>
                        <Ionicons name="camera-outline" size={20} color="#9CA3AF" />
                        <Text style={styles.slotPlaceholderText}>Upload</Text>
                      </View>
                    )}

                    {currentImg ? (
                      <TouchableOpacity
                        style={styles.deleteSlotBtn}
                        onPress={() => removeImageSlot(slot)}
                      >
                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    ) : null}
                  </TouchableOpacity>
                  <Text
                    style={[styles.slotLabel, req && styles.slotLabelReq]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2. General Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Classic Linen Casual Shirt"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe styling, fabric, fit, occasion..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="1499"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Sub-Category</Text>
              <TextInput
                style={styles.input}
                placeholder="TopWear"
                value={subCategory}
                onChangeText={setSubCategory}
              />
            </View>
          </View>
        </View>

        {/* 3. Category Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => {
                    setCategory(cat);
                    if (cat === "Accessories") {
                      setSubCategory("Accessories");
                      setSizeType("accessories");
                      setSelectedSizes(["Free Size"]);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Sub-Category Quick Picks */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Popular Sub-Categories</Text>
          <View style={styles.chipRow}>
            {SUB_CATEGORIES.map((sub) => {
              const isSelected = subCategory === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subChip, isSelected && styles.subChipActive]}
                  onPress={() => {
                    setSubCategory(sub);
                    if (sub === "Shoes") {
                      setSizeType("shoes");
                      setSelectedSizes(["7", "8", "9", "10"]);
                    } else if (sub === "Accessories") {
                      setSizeType("accessories");
                      setSelectedSizes(["Free Size"]);
                    } else if (sizeType === "shoes" || sizeType === "accessories") {
                      setSizeType("clothing");
                      setSelectedSizes(["M", "L", "XL"]);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.subChipText, isSelected && styles.subChipTextActive]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Available Sizes (Apparel vs Shoes vs Accessories) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Available Sizes *</Text>
              <Text style={styles.sectionSubtitle}>
                {sizeType === "shoes"
                  ? "Shoe number sizes"
                  : sizeType === "accessories"
                  ? "Accessories sizes"
                  : "Clothing sizes"}
              </Text>
            </View>

            {/* Switcher Tab */}
            <View style={styles.sizeTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.sizeTypeBtn,
                  sizeType === "clothing" && styles.sizeTypeBtnActive,
                ]}
                onPress={() => {
                  setSizeType("clothing");
                  setSelectedSizes(["M", "L"]);
                }}
              >
                <Text
                  style={[
                    styles.sizeTypeBtnText,
                    sizeType === "clothing" && styles.sizeTypeBtnTextActive,
                  ]}
                >
                  👕 Apparel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sizeTypeBtn,
                  sizeType === "shoes" && styles.sizeTypeBtnActive,
                ]}
                onPress={() => {
                  setSizeType("shoes");
                  setSelectedSizes(["7", "8", "9", "10"]);
                }}
              >
                <Text
                  style={[
                    styles.sizeTypeBtnText,
                    sizeType === "shoes" && styles.sizeTypeBtnTextActive,
                  ]}
                >
                  👟 Shoes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sizeTypeBtn,
                  sizeType === "accessories" && styles.sizeTypeBtnActive,
                ]}
                onPress={() => {
                  setSizeType("accessories");
                  setSelectedSizes(["Free Size"]);
                }}
              >
                <Text
                  style={[
                    styles.sizeTypeBtnText,
                    sizeType === "accessories" && styles.sizeTypeBtnTextActive,
                  ]}
                >
                  ⌚ Acc.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Size Pills Row */}
          <View style={styles.sizesRow}>
            {(sizeType === "shoes"
              ? SHOE_SIZES
              : sizeType === "accessories"
              ? ACCESSORY_SIZES
              : CLOTHING_SIZES
            ).map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBox, isSelected && styles.sizeBoxActive]}
                  onPress={() => toggleSize(size)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.sizeText, isSelected && styles.sizeTextActive]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Size Addition */}
          <View style={styles.customSizeRow}>
            <TextInput
              style={styles.customSizeInput}
              placeholder={
                sizeType === "shoes"
                  ? "Add other shoe size (e.g. 6.5, 10.5)..."
                  : sizeType === "accessories"
                  ? "Add custom accessory size (e.g. Free Size, Adjustable)..."
                  : "Add custom size (e.g. Free Size, 4XL)..."
              }
              value={customSizeInput}
              onChangeText={setCustomSizeInput}
            />
            <TouchableOpacity
              style={styles.addCustomSizeBtn}
              onPress={() => {
                const trimmed = customSizeInput.trim();
                if (!trimmed) return;
                if (!selectedSizes.includes(trimmed)) {
                  setSelectedSizes([...selectedSizes, trimmed]);
                }
                setCustomSizeInput("");
              }}
            >
              <Text style={styles.addCustomSizeBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Sizes Summary */}
          <Text style={styles.selectedSizesSummary}>
            Active Sizes: {selectedSizes.length > 0
              ? [...selectedSizes]
                  .sort((a, b) => {
                    const numA = parseFloat(a);
                    const numB = parseFloat(b);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.localeCompare(b);
                  })
                  .join(", ")
              : "None selected"}
          </Text>
        </View>

        {/* 6. Bestseller Switch */}
        <View style={[styles.card, styles.switchCard]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Mark as Bestseller</Text>
            <Text style={styles.switchSubtitle}>
              Featured on home page hero carousel and top trending picks
            </Text>
          </View>
          <Switch
            value={bestseller}
            onValueChange={setBestseller}
            trackColor={{ false: "#E5E7EB", true: "#111827" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* 7. Submit Action Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleAddProduct}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="bag-check-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Publish E-Commerce Product</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Upload Image Modal */}
      <Modal
        visible={activeSlotModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setActiveSlotModal(null);
          setShowUrlInput(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Upload Slot {activeSlotModal !== null ? activeSlotModal + 1 : 1}
                  {activeSlotModal === 0 ? " (Main Photo *)" : " Photo"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Apne phone se direct photo upload karein
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => {
                  setActiveSlotModal(null);
                  setShowUrlInput(false);
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Current Selected Image (if any) */}
            {activeSlotModal !== null && images[activeSlotModal] ? (
              <View style={styles.currentPhotoContainer}>
                <Image
                  source={{ uri: images[activeSlotModal] }}
                  style={styles.currentPhotoThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.currentPhotoStatus}>Photo Selected ✓</Text>
                  <Text style={styles.currentPhotoHint} numberOfLines={1}>
                    {images[activeSlotModal].split("/").pop()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => {
                    removeImageSlot(activeSlotModal);
                    setActiveSlotModal(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Main Option 1: Gallery */}
            <TouchableOpacity
              style={styles.uploadOptionBtnPrimary}
              onPress={() => activeSlotModal !== null && pickFromGallery(activeSlotModal)}
              activeOpacity={0.85}
            >
              <View style={styles.uploadOptionIconCircle}>
                <Ionicons name="images" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.uploadOptionTitlePrimary}>Choose from Phone Gallery</Text>
                <Text style={styles.uploadOptionSubPrimary}>Phone gallery se photo select karein</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Main Option 2: Camera */}
            <TouchableOpacity
              style={styles.uploadOptionBtnSecondary}
              onPress={() => activeSlotModal !== null && takePhotoWithCamera(activeSlotModal)}
              activeOpacity={0.85}
            >
              <View style={[styles.uploadOptionIconCircle, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="camera" size={22} color="#111827" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.uploadOptionTitleSecondary}>Take Photo with Camera</Text>
                <Text style={styles.uploadOptionSubSecondary}>Camera se nayi photo kheechein</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Optional URL Toggle */}
            <TouchableOpacity
              style={styles.urlToggleBtn}
              onPress={() => setShowUrlInput(!showUrlInput)}
            >
              <Ionicons name="link-outline" size={16} color="#6B7280" />
              <Text style={styles.urlToggleText}>
                {showUrlInput ? "Hide Link Option" : "Ya image URL / link paste karein"}
              </Text>
              <Ionicons
                name={showUrlInput ? "chevron-up" : "chevron-down"}
                size={14}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showUrlInput && (
              <View style={styles.urlInputBox}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://... (paste image link)"
                  placeholderTextColor="#9CA3AF"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.urlSaveBtn}
                  onPress={() => {
                    if (activeSlotModal !== null && urlInput.trim()) {
                      updateImageSlot(activeSlotModal, urlInput.trim());
                    }
                    setActiveSlotModal(null);
                    setShowUrlInput(false);
                  }}
                >
                  <Text style={styles.urlSaveBtnText}>Apply URL</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCancelFullBtn}
              onPress={() => {
                setActiveSlotModal(null);
                setShowUrlInput(false);
              }}
            >
              <Text style={styles.modalCancelFullText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  imageCounterBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  slotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    justifyContent: "space-between",
  },
  slotContainer: {
    flex: 1,
    alignItems: "center",
  },
  slotBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  slotBoxEmpty: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
  },
  slotBoxFilled: {
    borderWidth: 2,
    borderColor: "#111827",
  },
  slotImage: {
    width: "100%",
    height: "100%",
  },
  slotPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  slotPlaceholderText: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 2,
  },
  deleteSlotBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },
  slotLabelReq: {
    color: "#111827",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  subChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  subChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  subChipTextActive: {
    color: "#FFFFFF",
  },
  helperText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  sizeBox: {
    minWidth: 42,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeBoxActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  sizeTextActive: {
    color: "#FFFFFF",
  },
  sizeTypeSelector: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  sizeTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sizeTypeBtnActive: {
    backgroundColor: "#111827",
  },
  sizeTypeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  sizeTypeBtnTextActive: {
    color: "#FFFFFF",
  },
  customSizeRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  customSizeInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#111827",
  },
  addCustomSizeBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  addCustomSizeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  selectedSizesSummary: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 40,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  currentPhotoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    marginTop: 8,
  },
  currentPhotoThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  currentPhotoStatus: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  currentPhotoHint: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
  },
  removePhotoBtn: {
    padding: 6,
  },
  uploadOptionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadOptionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOptionTitlePrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  uploadOptionSubPrimary: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  uploadOptionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  uploadOptionTitleSecondary: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  uploadOptionSubSecondary: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  urlToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  urlToggleText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  urlInputBox: {
    marginBottom: 12,
  },
  modalInput: {
    height: 44,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#111827",
  },
  urlSaveBtn: {
    backgroundColor: "#374151",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  urlSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalCancelFullBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelFullText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
});
