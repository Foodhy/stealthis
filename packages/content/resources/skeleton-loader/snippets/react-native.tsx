import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Text } from "react-native";

/* ── Skeleton primitives ──────────────────────────────── */

interface SkeletonBaseProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBase({
  width = "100%",
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonBaseProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#334155",
          opacity,
        },
        style,
      ]}
    />
  );
}

/* ── Presets ───────────────────────────────────────────── */

function SkeletonLine({
  width = "100%",
  height = 14,
  style,
}: SkeletonBaseProps) {
  return (
    <SkeletonBase width={width} height={height} borderRadius={4} style={style} />
  );
}

function SkeletonCircle({ size = 48, style }: { size?: number; style?: object }) {
  return (
    <SkeletonBase width={size} height={size} borderRadius={size / 2} style={style} />
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBase width="100%" height={140} borderRadius={10} />
      <View style={{ padding: 14, gap: 10 }}>
        <SkeletonLine width="60%" height={16} />
        <SkeletonLine width="100%" />
        <SkeletonLine width="80%" />
      </View>
    </View>
  );
}

const Skeleton = {
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
};

/* ── Demo ─────────────────────────────────────────────── */

export default function App() {
  return (
    <View style={demo.container}>
      <Text style={demo.heading}>Skeleton Loader</Text>

      {/* Card skeleton */}
      <Text style={demo.sectionTitle}>Card skeleton</Text>
      <Skeleton.Card />

      {/* Custom layout */}
      <Text style={[demo.sectionTitle, { marginTop: 28 }]}>
        Custom layout
      </Text>
      <View style={demo.customRow}>
        <Skeleton.Circle size={52} />
        <View style={{ flex: 1, marginLeft: 14, gap: 8 }}>
          <Skeleton.Line width="50%" height={16} />
          <Skeleton.Line width="90%" />
          <Skeleton.Line width="70%" />
        </View>
      </View>

      <View style={[demo.customRow, { marginTop: 16 }]}>
        <Skeleton.Circle size={52} />
        <View style={{ flex: 1, marginLeft: 14, gap: 8 }}>
          <Skeleton.Line width="40%" height={16} />
          <Skeleton.Line width="100%" />
          <Skeleton.Line width="60%" />
        </View>
      </View>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
  },
});

const demo = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
