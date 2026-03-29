import React, { useRef, useCallback, useEffect } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

/* ------------------------------------------------------------------ */
/*  Spring Presets                                                     */
/* ------------------------------------------------------------------ */

interface SpringConfig {
  tension: number;
  friction: number;
  useNativeDriver: boolean;
}

const SpringPresets: Record<string, SpringConfig> = {
  bouncy: { tension: 180, friction: 6, useNativeDriver: true },
  gentle: { tension: 40, friction: 10, useNativeDriver: true },
  wobbly: { tension: 120, friction: 4, useNativeDriver: true },
  stiff: { tension: 300, friction: 20, useNativeDriver: true },
};

/* ------------------------------------------------------------------ */
/*  useSpring hook                                                     */
/* ------------------------------------------------------------------ */

function useSpring(initialValue = 0) {
  const value = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (toValue: number, config?: Partial<SpringConfig>) => {
      Animated.spring(value, {
        toValue,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
        ...config,
      }).start();
    },
    [value]
  );

  return { value, animate };
}

/* ------------------------------------------------------------------ */
/*  SpringBox                                                          */
/* ------------------------------------------------------------------ */

interface SpringBoxProps {
  preset: keyof typeof SpringPresets;
  label: string;
  color: string;
  style?: ViewStyle;
}

function SpringBox({ preset, label, color, style }: SpringBoxProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const active = useRef(false);

  const config = SpringPresets[preset];

  const handlePress = () => {
    const to = active.current ? 0 : 1;
    active.current = !active.current;

    Animated.parallel([
      Animated.spring(scale, { toValue: to === 1 ? 1.2 : 1, ...config }),
      Animated.spring(translateY, { toValue: to === 1 ? -20 : 0, ...config }),
      Animated.spring(rotate, { toValue: to, ...config }),
    ]).start();
  };

  const rotateInterpolation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.box,
          { backgroundColor: color },
          {
            transform: [{ scale }, { translateY }, { rotate: rotateInterpolation }],
          },
          style,
        ]}
      >
        <Text style={styles.boxLabel}>{label}</Text>
        <Text style={styles.presetLabel}>{preset}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  PulseBox — looping scale animation                                 */
/* ------------------------------------------------------------------ */

function PulseBox({ color, label }: { color: string; label: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.15,
          tension: 60,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  return (
    <Animated.View style={[styles.box, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={styles.presetLabel}>pulse (loop)</Text>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  ElasticSlideIn — slides in from the right with elastic spring      */
/* ------------------------------------------------------------------ */

function ElasticSlideIn({ color, label }: { color: string; label: string }) {
  const translateX = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  return (
    <Animated.View style={[styles.box, { backgroundColor: color, transform: [{ translateX }] }]}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={styles.presetLabel}>elastic slide-in</Text>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spring Animations</Text>
      <Text style={styles.subtitle}>Tap each box to trigger its spring</Text>

      <View style={styles.column}>
        <SpringBox preset="bouncy" label="Bounce" color="#6366f1" />
        <SpringBox preset="wobbly" label="Wobble" color="#f59e0b" />
        <PulseBox label="Pulse" color="#10b981" />
        <ElasticSlideIn label="Elastic" color="#ef4444" />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 32,
  },
  column: {
    gap: 20,
    alignItems: "center",
  },
  box: {
    width: 200,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  boxLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  presetLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
});
