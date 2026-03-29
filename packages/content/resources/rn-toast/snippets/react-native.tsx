import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

// ── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

interface ToastEntry extends Required<Pick<ToastConfig, "message" | "variant" | "duration">> {
  id: number;
  action?: ToastAction;
  translateY: Animated.Value;
  opacity: Animated.Value;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
}

// ── Variant config ───────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: string; iconColor: string }> = {
  success: { bg: "#065f46", icon: "\u2713", iconColor: "#34d399" },
  error: { bg: "#7f1d1d", icon: "\u2717", iconColor: "#f87171" },
  warning: { bg: "#78350f", icon: "\u26A0", iconColor: "#fbbf24" },
  info: { bg: "#1e3a5f", icon: "\u2139", iconColor: "#60a5fa" },
};

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

// ── Single toast ─────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  index,
  onDismiss,
}: {
  toast: ToastEntry;
  index: number;
  onDismiss: (id: number) => void;
}) {
  const { bg, icon, iconColor } = VARIANT_STYLES[toast.variant];
  const topOffset = 8 + index * 72;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bg,
          top: topOffset,
          transform: [{ translateY: toast.translateY }],
          opacity: toast.opacity,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.action && (
          <Pressable
            onPress={() => {
              toast.action!.onPress();
              onDismiss(toast.id);
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{toast.action.label}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (!toast) return prev;

      Animated.parallel([
        Animated.timing(toast.translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toast.opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      });

      return prev;
    });
  }, []);

  const show = useCallback(
    (config: ToastConfig) => {
      const id = ++idCounter.current;
      const translateY = new Animated.Value(-100);
      const opacity = new Animated.Value(0);
      const duration = config.duration ?? 3000;

      const entry: ToastEntry = {
        id,
        message: config.message,
        variant: config.variant ?? "info",
        duration,
        action: config.action,
        translateY,
        opacity,
      };

      setToasts((prev) => [...prev, entry]);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast, i) => (
          <ToastItem key={toast.id} toast={toast} index={i} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ── Demo app ─────────────────────────────────────────────────────────────────

function DemoButton({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: color }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function DemoScreen() {
  const { show } = useToast();

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Toast Notifications</Text>
      <Text style={styles.subtitle}>Tap a button to trigger a toast</Text>

      <View style={styles.buttonGrid}>
        <DemoButton
          label="Success"
          color="#065f46"
          onPress={() => show({ message: "Item saved successfully!", variant: "success" })}
        />
        <DemoButton
          label="Error"
          color="#7f1d1d"
          onPress={() =>
            show({
              message: "Something went wrong. Please try again.",
              variant: "error",
              duration: 5000,
            })
          }
        />
        <DemoButton
          label="Warning"
          color="#78350f"
          onPress={() =>
            show({
              message: "Your session will expire in 5 minutes.",
              variant: "warning",
              action: { label: "Extend", onPress: () => {} },
            })
          }
        />
        <DemoButton
          label="Info"
          color="#1e3a5f"
          onPress={() => show({ message: "A new version is available.", variant: "info" })}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DemoScreen />
    </ToastProvider>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 40,
  },
  buttonGrid: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: "700",
  },
  message: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  actionText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
});
