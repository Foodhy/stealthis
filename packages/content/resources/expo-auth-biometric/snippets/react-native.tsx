import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AuthStatus = "idle" | "checking" | "ready" | "authenticating" | "success" | "failed";

interface HardwareInfo {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const AUTH_TYPE_LABELS: Record<number, string> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: "Fingerprint",
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: "Face ID",
  [LocalAuthentication.AuthenticationType.IRIS]: "Iris",
};

function getAuthTypeLabel(types: LocalAuthentication.AuthenticationType[]): string {
  if (types.length === 0) return "Biometric";
  return types.map((t) => AUTH_TYPE_LABELS[t] ?? "Biometric").join(" / ");
}

/* ------------------------------------------------------------------ */
/*  Lock Icon (animated)                                               */
/* ------------------------------------------------------------------ */

function LockIcon({ unlocked }: { unlocked: boolean }) {
  const animValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: unlocked ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [unlocked, animValue]);

  const shackleTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  return (
    <Animated.View style={[styles.lockContainer, { transform: [{ scale }] }]}>
      {/* Shackle */}
      <Animated.View
        style={[
          styles.lockShackle,
          unlocked && styles.lockShackleOpen,
          { transform: [{ translateY: shackleTranslateY }] },
        ]}
      />
      {/* Body */}
      <View style={[styles.lockBody, unlocked && styles.lockBodySuccess]}>
        <Text style={styles.lockKeyhole}>{unlocked ? "\u2713" : "\u2022"}</Text>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  BiometricAuth Component                                            */
/* ------------------------------------------------------------------ */

interface BiometricAuthProps {
  onAuthenticated?: () => void;
}

function BiometricAuth({ onAuthenticated }: BiometricAuthProps) {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* -- Check hardware on mount -- */
  const checkHardware = useCallback(async () => {
    setStatus("checking");
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setHardwareInfo({ hasHardware, isEnrolled, supportedTypes });

      if (!hasHardware) {
        setErrorMessage("This device does not support biometric authentication.");
        setStatus("failed");
      } else if (!isEnrolled) {
        setErrorMessage(
          "No biometrics enrolled. Please set up Face ID, Touch ID, or fingerprint in device settings."
        );
        setStatus("failed");
      } else {
        setStatus("ready");
      }
    } catch {
      setErrorMessage("Unable to check biometric hardware.");
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    checkHardware();
  }, [checkHardware]);

  /* -- Authenticate -- */
  const authenticate = useCallback(async () => {
    setStatus("authenticating");
    setErrorMessage(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to continue",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setStatus("success");
        onAuthenticated?.();
      } else {
        setErrorMessage(
          result.error === "user_cancel"
            ? "Authentication cancelled."
            : "Authentication failed. Please try again."
        );
        setStatus("failed");
      }
    } catch {
      setErrorMessage("Authentication failed. Please try again.");
      setStatus("failed");
    }
  }, [onAuthenticated]);

  /* -- Status label -- */
  const statusLabel =
    status === "idle" || status === "checking"
      ? "Checking device capabilities\u2026"
      : status === "ready"
        ? "Authenticate to continue"
        : status === "authenticating"
          ? "Waiting for authentication\u2026"
          : status === "success"
            ? "Authentication successful"
            : errorMessage ?? "Authentication failed";

  const authTypeLabel = hardwareInfo
    ? getAuthTypeLabel(hardwareInfo.supportedTypes)
    : "Biometric";

  return (
    <View style={styles.card}>
      {/* Lock icon */}
      <LockIcon unlocked={status === "success"} />

      {/* Status message */}
      <Text
        style={[
          styles.statusText,
          status === "success" && styles.statusSuccess,
          status === "failed" && styles.statusFailed,
        ]}
      >
        {statusLabel}
      </Text>

      {/* Supported types badge */}
      {hardwareInfo && hardwareInfo.supportedTypes.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{authTypeLabel} available</Text>
        </View>
      )}

      {/* Action buttons */}
      {status === "checking" && <ActivityIndicator color="#818cf8" style={{ marginTop: 16 }} />}

      {status === "ready" && (
        <Pressable style={styles.button} onPress={authenticate}>
          <Text style={styles.buttonText}>Authenticate</Text>
        </Pressable>
      )}

      {status === "failed" && (
        <Pressable
          style={[styles.button, styles.retryButton]}
          onPress={() => {
            if (!hardwareInfo?.hasHardware || !hardwareInfo?.isEnrolled) {
              checkHardware();
            } else {
              authenticate();
            }
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      )}

      {status === "success" && (
        <View style={styles.successBadge}>
          <Text style={styles.successBadgeText}>Access Granted</Text>
        </View>
      )}
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
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "#334155",
  },
  /* Lock */
  lockContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  lockShackle: {
    width: 36,
    height: 28,
    borderWidth: 4,
    borderColor: "#94a3b8",
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: -2,
  },
  lockShackleOpen: {
    borderColor: "#34d399",
    transform: [{ translateX: 6 }],
  },
  lockBody: {
    width: 52,
    height: 40,
    backgroundColor: "#475569",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBodySuccess: {
    backgroundColor: "#059669",
  },
  lockKeyhole: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  /* Status */
  statusText: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 8,
  },
  statusSuccess: {
    color: "#34d399",
    fontWeight: "600",
  },
  statusFailed: {
    color: "#f87171",
  },
  /* Badge */
  badge: {
    backgroundColor: "#312e81",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  badgeText: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "500",
  },
  /* Button */
  button: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  /* Success */
  successBadge: {
    backgroundColor: "#064e3b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  successBadgeText: {
    color: "#6ee7b7",
    fontSize: 14,
    fontWeight: "600",
  },
});

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Authentication</Text>
      <BiometricAuth onAuthenticated={() => console.log("Authenticated!")} />
    </View>
  );
}
