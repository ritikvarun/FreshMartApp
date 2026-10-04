import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  // Entrance animations
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Ambient halo pulse animation
  const pulse = useRef(new Animated.Value(1)).current;

  // Loading bar animation
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle breathing pulse on the outer glow
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    // Loading bar progress
    Animated.timing(progress, {
      toValue: 1,
      duration: 1900,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Navigate to home tabs
    const timer = setTimeout(() => {
      router.replace("/(root)/(tabs)");
    }, 2200);

    return () => {
      clearTimeout(timer);
      pulseAnim.stop();
    };
  }, [router, scale, opacity, pulse, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Decorative background ambient glows */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      {/* Center Brand Content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {/* Pulsing Outer Halo */}
        <Animated.View
          style={[
            styles.outerHalo,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          {/* Middle Ambient Ring */}
          <View style={styles.middleRing}>
            {/* Main Circular Logo Container */}
            <View style={styles.circleLogoWrap}>
              <Image
                source={require("../assets/images/aka-circle.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Brand Name & Tagline */}
        <View style={styles.textContainer}>
          <Text style={styles.brandTitle}>AKA STORE</Text>
          <Text style={styles.tagline}>PREMIUM SHOPPING & LIFESTYLE</Text>
        </View>
      </Animated.View>

      {/* Bottom Modern Progress & Status */}
      <View style={styles.bottomContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.statusText}>Starting your shopping experience...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bgGlowTop: {
    position: "absolute",
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(245, 158, 11, 0.04)",
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(245, 158, 11, 0.03)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(245, 158, 11, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  middleRing: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: "rgba(245, 158, 11, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleLogoWrap: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: "#000000",
    borderWidth: 2.5,
    borderColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 16,
  },
  logoImage: {
    width: 148,
    height: 148,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 26,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  tagline: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
    letterSpacing: 2.2,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 44,
    left: 40,
    right: 40,
    alignItems: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    letterSpacing: 0.4,
  },
});
