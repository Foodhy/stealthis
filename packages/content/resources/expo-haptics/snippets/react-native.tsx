import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

interface HapticButton {
  label: string;
  description: string;
  color: string;
  flashColor: string;
  onPress: () => void;
}

function HapticCard({ button }: { button: HapticButton }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [flashing, setFlashing] = useState(false);

  const handlePress = () => {
    button.onPress();
    setFlashing(true);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setFlashing(false), 200);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: flashing ? button.flashColor : "#1e293b",
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[styles.cardIndicator, { backgroundColor: button.color }]}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>{button.label}</Text>
          <Text style={styles.cardDesc}>{button.description}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function App() {
  const impactButtons: HapticButton[] = [
    {
      label: "Light",
      description: "Subtle tap — good for small UI elements",
      color: "#38bdf8",
      flashColor: "#0c4a6e",
      onPress: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    },
    {
      label: "Medium",
      description: "Standard tap — buttons and toggles",
      color: "#6366f1",
      flashColor: "#312e81",
      onPress: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    },
    {
      label: "Heavy",
      description: "Strong tap — confirmations and emphasis",
      color: "#a78bfa",
      flashColor: "#4c1d95",
      onPress: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    },
  ];

  const notificationButtons: HapticButton[] = [
    {
      label: "Success",
      description: "Positive outcome — task completed",
      color: "#34d399",
      flashColor: "#064e3b",
      onPress: () =>
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ),
    },
    {
      label: "Warning",
      description: "Caution — requires attention",
      color: "#fbbf24",
      flashColor: "#78350f",
      onPress: () =>
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        ),
    },
    {
      label: "Error",
      description: "Failure — something went wrong",
      color: "#f87171",
      flashColor: "#7f1d1d",
      onPress: () =>
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        ),
    },
  ];

  const selectionButtons: HapticButton[] = [
    {
      label: "Selection",
      description: "Micro-tap — pickers, sliders, segment controls",
      color: "#e2e8f0",
      flashColor: "#334155",
      onPress: () => Haptics.selectionAsync(),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Haptic Feedback</Text>
      <Text style={styles.subtitle}>
        Tap each button to feel the haptic pattern
      </Text>

      <Text style={styles.sectionTitle}>Impact</Text>
      {impactButtons.map((btn) => (
        <HapticCard key={btn.label} button={btn} />
      ))}

      <Text style={styles.sectionTitle}>Notification</Text>
      {notificationButtons.map((btn) => (
        <HapticCard key={btn.label} button={btn} />
      ))}

      <Text style={styles.sectionTitle}>Selection</Text>
      {selectionButtons.map((btn) => (
        <HapticCard key={btn.label} button={btn} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  cardIndicator: {
    width: 6,
    height: 36,
    borderRadius: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: "#94a3b8",
  },
});
