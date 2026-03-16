import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, length);
    setCode(digits);
    if (digits.length === length) {
      onComplete?.(digits);
    }
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const boxes = Array.from({ length }, (_, i) => {
    const digit = code[i] || "";
    const isActive = focused && i === Math.min(code.length, length - 1);

    return (
      <TouchableOpacity
        key={i}
        style={[styles.box, isActive && styles.boxActive]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={styles.digit}>{digit}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View>
      <View style={styles.boxRow}>{boxes}</View>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoFocus
      />
    </View>
  );
}

// --- Demo ---

export default function App() {
  const [otpCode, setOtpCode] = useState("");
  const [verified, setVerified] = useState(false);

  const handleComplete = (code: string) => {
    setOtpCode(code);
  };

  const handleVerify = () => {
    if (otpCode.length === 6) {
      setVerified(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to your device
      </Text>

      <View style={{ marginTop: 32 }}>
        <OtpInput length={6} onComplete={handleComplete} />
      </View>

      <TouchableOpacity
        style={[
          styles.verifyButton,
          otpCode.length < 6 && styles.verifyButtonDisabled,
        ]}
        onPress={handleVerify}
        disabled={otpCode.length < 6}
        activeOpacity={0.7}
      >
        <Text style={styles.verifyText}>
          {verified ? "✓ Verified" : "Verify"}
        </Text>
      </TouchableOpacity>

      {verified && (
        <Text style={styles.successText}>Code verified successfully!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
  },
  boxRow: {
    flexDirection: "row",
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  digit: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyButton: {
    marginTop: 32,
    backgroundColor: "#6366f1",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.4,
  },
  verifyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successText: {
    color: "#22c55e",
    fontSize: 14,
    marginTop: 16,
    fontWeight: "600",
  },
});
