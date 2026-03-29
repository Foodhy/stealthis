import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

/* ── Types ────────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant: ToastVariant) => void;
}

/* ── Variant styles ───────────────────────────────────── */

const VARIANT: Record<ToastVariant, { bg: string; icon: string }> = {
  success: { bg: "#16a34a", icon: "\u2713" },
  error: { bg: "#dc2626", icon: "\u2717" },
  warning: { bg: "#d97706", icon: "\u26A0" },
  info: { bg: "#2563eb", icon: "\u2139" },
};

const AUTO_DISMISS = 3500;

/* ── Single toast ─────────────────────────────────────── */

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => dismiss(), AUTO_DISMISS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(toast.id));
  }, [toast.id, onDismiss, translateY, opacity]);

  const v = VARIANT[toast.variant];

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: v.bg, transform: [{ translateY }], opacity }]}
    >
      <Text style={styles.icon}>{v.icon}</Text>
      <Text style={styles.message}>{toast.message}</Text>
      <TouchableOpacity onPress={dismiss} hitSlop={8}>
        <Text style={styles.close}>{"\u2717"}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ── Provider ─────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={remove} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/* ── Styles ───────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
    fontWeight: "700",
  },
  message: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  close: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginLeft: 8,
  },
});

/* ── Demo ─────────────────────────────────────────────── */

function DemoContent() {
  const { show } = useToast();

  const buttons: { label: string; variant: ToastVariant; color: string }[] = [
    { label: "Success", variant: "success", color: "#16a34a" },
    { label: "Error", variant: "error", color: "#dc2626" },
    { label: "Warning", variant: "warning", color: "#d97706" },
    { label: "Info", variant: "info", color: "#2563eb" },
  ];

  return (
    <View style={demo.container}>
      <Text style={demo.heading}>Toast System</Text>
      {buttons.map((b) => (
        <TouchableOpacity
          key={b.variant}
          style={[demo.btn, { backgroundColor: b.color }]}
          onPress={() => show(`This is a ${b.variant} toast!`, b.variant)}
        >
          <Text style={demo.btnText}>Show {b.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
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
  btn: {
    width: 200,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
