import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type BarColor = "default" | "success" | "warning" | "error";

const COLOR_MAP: Record<BarColor, string> = {
  default: "#818cf8",
  success: "#34d399",
  warning: "#fbbf24",
  error: "#f87171",
};

interface ProgressBarProps {
  value?: number;
  color?: BarColor;
  indeterminate?: boolean;
  height?: number;
  label?: string;
}

function ProgressBar({
  value = 0,
  color = "default",
  indeterminate = false,
  height = 8,
  label,
}: ProgressBarProps) {
  const fillWidth = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(indeterminateAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(fillWidth, {
        toValue: Math.min(100, Math.max(0, value)),
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [value, indeterminate, fillWidth, indeterminateAnim]);

  const barColor = COLOR_MAP[color];

  if (indeterminate) {
    const translateX = indeterminateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 300],
    });

    return (
      <View style={styles.barWrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.track, { height }]}>
          <Animated.View
            style={[
              styles.indeterminateFill,
              {
                height,
                backgroundColor: barColor,
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      </View>
    );
  }

  const width = fillWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.barWrapper}>
      <View style={styles.labelRow}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={[styles.percentage, { color: barColor }]}>{value}%</Text>
      </View>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              height,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Progress</Text>
      <Text style={styles.subheader}>Animated progress indicators</Text>

      <View style={styles.demos}>
        <ProgressBar value={72} color="default" label="Upload" height={10} />
        <ProgressBar value={100} color="success" label="Complete" height={10} />
        <ProgressBar value={45} color="warning" label="Storage" height={10} />
        <ProgressBar value={88} color="error" label="CPU Usage" height={10} />
        <ProgressBar indeterminate color="default" label="Loading..." height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  subheader: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 32,
  },
  demos: {
    gap: 24,
  },
  barWrapper: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  percentage: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 999,
  },
  indeterminateFill: {
    width: 120,
    borderRadius: 999,
  },
});
