import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ENDPOINTS } from "../../../config/api";
import { useCart, ProductItem } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ReviewItem {
  _id: string;
  userId?: {
    _id?: string;
    name?: string;
  };
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, cartCount } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState<number>(4.8);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  // Write Review Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const imageScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    loadProductDetails();
    loadProductReviews();
  }, [id]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.PRODUCTS.DETAIL(id!));
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize("Standard");
        }
      } else {
        // Fallback: search in list
        const listRes = await fetch(ENDPOINTS.PRODUCTS.LIST);
        if (listRes.ok) {
          const list = await listRes.json();
          const found = list.find((p: any) => p._id === id || p.id === id);
          if (found) {
            setProduct(found);
            setSelectedSize(found.sizes?.[0] || "Standard");
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load product details", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductReviews = async () => {
    try {
      const res = await fetch(ENDPOINTS.REVIEWS.GET(id!));
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.totalReviews > 0) {
          setAvgRating(data.averageRating || 4.8);
          setTotalReviews(data.totalReviews);
        } else {
          setTotalReviews(0);
        }
      }
    } catch (err) {
      console.warn("Failed to load reviews", err);
    }
  };

  // Compile up to 5 images from product data
  const getImages = (): string[] => {
    if (!product) return [];
    const raw = [
      product.image1,
      product.image2,
      product.image3,
      product.image4,
      product.image5,
    ].filter(Boolean);

    if (raw.length === 0) {
      return ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"];
    }

    // Ensure we provide a rich 5-image gallery experience
    return raw;
  };

  const images = getImages();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeImageIndex && index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    imageScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const item: ProductItem = {
      _id: product._id || product.id,
      name: product.name || "Product",
      price: Number(product.price || 0),
      image1: product.image1 || images[0],
      category: product.category || "General",
      subCategory: product.subCategory,
      sizes: product.sizes || [selectedSize],
      bestseller: product.bestseller,
    };

    await addToCart(item, selectedSize || "Standard");
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/(root)/checkout" as any);
  };

  const submitReview = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert("Sign In Required", "Please sign in to write a review.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/sign-in" as any) },
      ]);
      return;
    }

    if (!commentInput.trim()) {
      Alert.alert("Review Empty", "Please write a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(ENDPOINTS.REVIEWS.ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          rating: ratingInput,
          comment: commentInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Thank You!", "Your review has been submitted.");
        setReviewModalVisible(false);
        setCommentInput("");
        setRatingInput(5);
        loadProductReviews();
      } else {
        Alert.alert("Review Notice", data.message || "Failed to submit review.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not submit review at this time.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={56} color="#9CA3AF" />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundSub}>
          The product you are looking for might have been removed or is temporarily unavailable.
        </Text>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const originalPrice = Math.round(Number(product.price || 0) * 1.3);
  const discountPercent = Math.round(
    ((originalPrice - Number(product.price || 0)) / originalPrice) * 100
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating Top Navigation Bar */}
      <SafeAreaView edges={["top"]} style={styles.floatingHeaderSafeArea}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerRightRow}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#E11D48" : "#111827"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push("/(root)/cart" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-handle-outline" size={20} color="#111827" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main 5-Image Gallery Swiper */}
        <View style={styles.galleryWrapper}>
          <ScrollView
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            style={styles.imageScroller}
          >
            {images.map((imgUri, idx) => (
              <View key={idx} style={styles.imageSlide}>
                <Image
                  source={{ uri: imgUri }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Counter Badge */}
          <View style={styles.imageCountPill}>
            <Ionicons name="images-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.imageCountText}>
              {activeImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* 5 Thumbnails Preview Row */}
        {images.length > 1 && (
          <View style={styles.thumbnailsContainer}>
            {images.map((imgUri, idx) => {
              const isActive = activeImageIndex === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => scrollToImage(idx)}
                  activeOpacity={0.8}
                  style={[
                    styles.thumbWrapper,
                    isActive && styles.thumbWrapperActive,
                  ]}
                >
                  <Image source={{ uri: imgUri }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Product Details Card Body */}
        <View style={styles.bodyCard}>
          {/* Category & Tag Row */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {product.category?.toUpperCase() || "FASHION"}
                {product.subCategory ? ` • ${product.subCategory.toUpperCase()}` : ""}
              </Text>
            </View>

            {product.bestseller && (
              <View style={styles.bestsellerBadge}>
                <Ionicons name="flame" size={12} color="#D97706" style={{ marginRight: 3 }} />
                <Text style={styles.bestsellerText}>BESTSELLER</Text>
              </View>
            )}
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Rating Summary Bar */}
          <View style={styles.ratingBarRow}>
            <View style={styles.starPill}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.starPillText}>{avgRating}</Text>
            </View>
            <Text style={styles.ratingCountText}>
              ({totalReviews > 0 ? `${totalReviews} verified reviews` : "New Arrival"})
            </Text>
          </View>

          {/* Price & Offer Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{product.price}</Text>
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          </View>
          <Text style={styles.taxText}>Inclusive of all applicable taxes</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size Selector Section */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>
                  {product.category?.toLowerCase() === "shoes" ||
                  product.subCategory?.toLowerCase() === "shoes"
                    ? "Select Shoe Size (UK/IND)"
                    : "Select Size"}
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.sizeGuideLink}>Size Guide</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sizesRow}>
                {product.sizes.map((sz: string) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <TouchableOpacity
                      key={sz}
                      onPress={() => setSelectedSize(sz)}
                      activeOpacity={0.8}
                      style={[
                        styles.sizeChip,
                        isSelected && styles.sizeChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeChipText,
                          isSelected && styles.sizeChipTextActive,
                        ]}
                      >
                        {sz}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Product Highlights / Perks */}
          <View style={styles.perksGrid}>
            <View style={styles.perkItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
              <Text style={styles.perkText}>100% Genuine</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="repeat-outline" size={18} color="#059669" />
              <Text style={styles.perkText}>7-Day Returns</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="cube-outline" size={18} color="#059669" />
              <Text style={styles.perkText}>Free Shipping ₹499+</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Product Description</Text>
            <Text style={styles.descriptionText}>
              {product.description ||
                "Crafted with top-quality materials to deliver outstanding comfort, effortless durability, and sleek style. Perfect for everyday wear, casual outings, or special occasions."}
            </Text>
          </View>

          {/* Customer Reviews Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Customer Reviews ({totalReviews})</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.writeReviewLink}>Write a Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReviewsBox}>
                <Ionicons name="chatbubbles-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyReviewsText}>
                  No reviews yet. Be the first to share your thoughts!
                </Text>
                <TouchableOpacity
                  style={styles.firstReviewBtn}
                  onPress={() => setReviewModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.firstReviewBtnText}>Write First Review</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((rev) => (
                  <View key={rev._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUserRow}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>
                            {(rev.userId?.name || "U")[0].toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewUserName}>
                            {rev.userId?.name || "Verified Customer"}
                          </Text>
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={11} color="#059669" />
                            <Text style={styles.verifiedText}>Verified Purchase</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= rev.rating ? "star" : "star-outline"}
                            size={12}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>

                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Success Notification */}
      {addedToast && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>Added to cart successfully!</Text>
        </View>
      )}

      {/* Bottom Sticky Action Bar */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={18} color="#111827" style={{ marginRight: 6 }} />
            <Text style={styles.addToCartBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNow}
            activeOpacity={0.85}
          >
            <Ionicons name="flash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buyNowBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Write Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingSelectLabel}>Select Rating:</Text>
            <View style={styles.ratingSelectorRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatingInput(star)}
                  style={styles.starTouch}
                >
                  <Ionicons
                    name={star <= ratingInput ? "star" : "star-outline"}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingSelectLabel}>Your Review:</Text>
            <TextInput
              placeholder="What did you like or dislike? How was the fit and quality?"
              placeholderTextColor="#9CA3AF"
              value={commentInput}
              onChangeText={setCommentInput}
              multiline
              numberOfLines={4}
              style={styles.reviewTextInput}
            />

            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={submitReview}
              disabled={submittingReview}
              activeOpacity={0.85}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 14,
  },
  notFoundSub: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  backHomeBtn: {
    marginTop: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backHomeBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Floating Header
  floatingHeaderSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#0F172A",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  // Gallery
  scrollContent: {
    paddingBottom: 120,
  },
  galleryWrapper: {
    width: SCREEN_WIDTH,
    height: 410,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  imageScroller: {
    width: SCREEN_WIDTH,
    height: 410,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: 410,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: 410,
  },
  imageCountPill: {
    position: "absolute",
    bottom: 16,
    right: 18,
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  imageCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  // Thumbnails Row
  thumbnailsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  thumbWrapper: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  thumbWrapperActive: {
    borderColor: "#111827",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },

  // Body Card
  bodyCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
    letterSpacing: 0.6,
  },
  bestsellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestsellerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  starPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  starPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  ratingCountText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Price Row
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  discountBadge: {
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#03543F",
    fontSize: 12,
    fontWeight: "800",
  },
  taxText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  // Size Section
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sizeGuideLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    minWidth: 54,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeChipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  sizeChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  sizeChipTextActive: {
    color: "#FFFFFF",
  },

  // Perks
  perksGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 14,
  },
  perkItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  perkText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },

  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginTop: 6,
  },

  // Reviews
  writeReviewLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyReviewsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    marginTop: 6,
  },
  emptyReviewsText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  firstReviewBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
  },
  firstReviewBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  reviewsList: {
    marginTop: 10,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },
  reviewUserName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  verifiedText: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "600",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 19,
  },

  // Toast
  toastContainer: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Bottom Bar
  bottomBarSafeArea: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  addToCartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  addToCartBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  buyNowBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buyNowBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalCloseBtn: {
    padding: 4,
  },
  ratingSelectLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 6,
  },
  ratingSelectorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  starTouch: {
    padding: 4,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: "#111827",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
