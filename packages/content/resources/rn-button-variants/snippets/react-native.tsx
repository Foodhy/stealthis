import React, { useRef, useCallback } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from "react-native";

type Variant = "solid" | "outline" | "ghost" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

const SIZES: Record<Size, { height: number; paddingH: number; fontSize: number; radius: number }> =
  {
    sm: { height: 32, paddingH: 12, fontSize: 13, radius: 8 },
    md: { height: 44, paddingH: 20, fontSize: 15, radius: 10 },
    lg: { height: 52, paddingH: 28, fontSize: 17, radius: 12 },
  };

async function triggerHaptic() {
  try {
    const Haptics = await import("expo-haptics");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // expo-haptics not available — no-op
  }
}

export function Button({
  variant = "solid",
  size = "md",
  color = "#6366f1",
  loading = false,
  disabled = false,
  haptic = false,
  onPress,
  children,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  const animateIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const animateOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    if (haptic) triggerHaptic();
    onPress?.();
  }, [isDisabled, haptic, onPress]);

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      height: variant === "icon" ? s.height : s.height,
      paddingHorizontal: variant === "icon" ? 0 : s.paddingH,
      borderRadius: variant === "icon" ? s.height / 2 : s.radius,
      width: variant === "icon" ? s.height : undefined,
      justifyContent: "center",
      alignItems: "center",
    },
  ];

  if (variant === "solid") {
    containerStyle.push({ backgroundColor: color });
  } else if (variant === "outline") {
    containerStyle.push({
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: color,
    });
  } else if (variant === "ghost") {
    containerStyle.push({ backgroundColor: "transparent" });
  } else if (variant === "icon") {
    containerStyle.push({ backgroundColor: color + "18" });
  }

  if (isDisabled) {
    containerStyle.push({ opacity: 0.5 });
  }

  const textColor = variant === "solid" ? "#ffffff" : color;

  const textStyle: TextStyle = {
    fontSize: s.fontSize,
    fontWeight: "600",
    color: textColor,
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        disabled={isDisabled}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : typeof children === "string" ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

// — Demo App —
import { View, Alert } from "react-native";

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: 24,
      }}
    >
      <Button variant="solid" onPress={() => Alert.alert("Solid pressed")}>
        Solid Button
      </Button>
      <Button variant="outline" onPress={() => Alert.alert("Outline pressed")}>
        Outline Button
      </Button>
      <Button variant="ghost" onPress={() => Alert.alert("Ghost pressed")}>
        Ghost Button
      </Button>
      <Button variant="solid" color="#ef4444" loading>
        Loading…
      </Button>
      <Button variant="solid" disabled>
        Disabled
      </Button>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button variant="solid" size="sm">
          SM
        </Button>
        <Button variant="solid" size="md">
          MD
        </Button>
        <Button variant="solid" size="lg">
          LG
        </Button>
      </View>
      <Button variant="icon" size="lg" onPress={() => Alert.alert("Icon!")}>
        <Text style={{ fontSize: 20 }}>♥</Text>
      </Button>
    </View>
  );
}
