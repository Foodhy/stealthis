import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const VELOCITY_THRESHOLD = 1.5;
const DISMISS_FRACTION = 0.6;

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: number[];
  children?: React.ReactNode;
}

function BottomSheetModal({
  visible,
  onClose,
  snapPoints = [0.5],
  children,
}: BottomSheetModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const currentSnap = useRef(0);
  const [modalVisible, setModalVisible] = useState(false);

  const sortedSnaps = [...snapPoints].sort((a, b) => a - b);

  const snapToPoint = useCallback(
    (fraction: number) => {
      const toValue = SCREEN_HEIGHT * (1 - fraction);
      Animated.spring(translateY, {
        toValue,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    },
    [translateY]
  );

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const currentOffset =
          SCREEN_HEIGHT * (1 - sortedSnaps[currentSnap.current] ?? sortedSnaps[0]);
        const newY = currentOffset + gestureState.dy;
        const clamped = Math.max(SCREEN_HEIGHT * (1 - sortedSnaps[sortedSnaps.length - 1]), newY);
        translateY.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.vy > VELOCITY_THRESHOLD) {
          dismiss();
          return;
        }

        const currentPos = SCREEN_HEIGHT * (1 - sortedSnaps[currentSnap.current]) + gestureState.dy;
        const currentFraction = 1 - currentPos / SCREEN_HEIGHT;

        if (currentFraction < sortedSnaps[0] * DISMISS_FRACTION) {
          dismiss();
          return;
        }

        let closestIndex = 0;
        let closestDistance = Math.abs(currentFraction - sortedSnaps[0]);
        for (let i = 1; i < sortedSnaps.length; i++) {
          const distance = Math.abs(currentFraction - sortedSnaps[i]);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }

        currentSnap.current = closestIndex;
        snapToPoint(sortedSnaps[closestIndex]);
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      currentSnap.current = 0;
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT * (1 - sortedSnaps[0]),
            tension: 80,
            friction: 12,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (modalVisible) {
      dismiss();
    }
  }, [visible]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

/* ── Demo App ──────────────────────────────────────────────── */

const ITEMS = [
  { id: "1", label: "Account settings", icon: "\u2699\uFE0F" },
  { id: "2", label: "Notifications", icon: "\uD83D\uDD14" },
  { id: "3", label: "Appearance", icon: "\uD83C\uDFA8" },
  { id: "4", label: "Privacy", icon: "\uD83D\uDD12" },
  { id: "5", label: "Help & support", icon: "\u2753" },
  { id: "6", label: "About", icon: "\u2139\uFE0F" },
];

export default function App() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <View style={appStyles.screen}>
      <Text style={appStyles.heading}>Bottom Sheet Demo</Text>
      <Text style={appStyles.sub}>
        Drag the handle, flick down, or tap the backdrop to dismiss.
      </Text>

      <Pressable style={appStyles.button} onPress={() => setSheetOpen(true)}>
        <Text style={appStyles.buttonText}>Open Sheet</Text>
      </Pressable>

      <BottomSheetModal
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        snapPoints={[0.5, 0.9]}
      >
        <Text style={appStyles.sheetTitle}>Settings</Text>
        {ITEMS.map((item) => (
          <Pressable key={item.id} style={appStyles.row}>
            <Text style={appStyles.rowIcon}>{item.icon}</Text>
            <Text style={appStyles.rowLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </BottomSheetModal>
    </View>
  );
}

const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  heading: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  sub: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 260,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sheetTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  rowIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  rowLabel: {
    color: "#e2e8f0",
    fontSize: 16,
  },
});
