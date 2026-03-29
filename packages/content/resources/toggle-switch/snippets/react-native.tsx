import React, { useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
} from "react-native";

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 28;
const THUMB_OFFSET = 2;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET * 2;

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  color?: string;
}

function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  color = "#34C759",
}: ToggleSwitchProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !value;
    Animated.spring(anim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
    onValueChange(next);
  }, [value, disabled, anim, onValueChange]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_OFFSET, THUMB_OFFSET + TRAVEL],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#767577", color],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      disabled={disabled}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View
        style={[styles.track, { backgroundColor: trackColor }]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});

/* ── Demo ─────────────────────────────────────────────── */

export default function App() {
  const [v1, setV1] = React.useState(false);
  const [v2, setV2] = React.useState(true);
  const [v3] = React.useState(false);

  return (
    <View style={demo.container}>
      <Text style={demo.heading}>Toggle Switch</Text>

      <View style={demo.row}>
        <Text style={demo.label}>Default</Text>
        <ToggleSwitch value={v1} onValueChange={setV1} />
      </View>

      <View style={demo.row}>
        <Text style={demo.label}>Custom color</Text>
        <ToggleSwitch value={v2} onValueChange={setV2} color="#6366F1" />
      </View>

      <View style={demo.row}>
        <Text style={demo.label}>Disabled</Text>
        <ToggleSwitch value={v3} onValueChange={() => {}} disabled />
      </View>
    </View>
  );
}

const demo = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 220,
    marginBottom: 24,
  },
  label: {
    color: "#94a3b8",
    fontSize: 16,
  },
});
