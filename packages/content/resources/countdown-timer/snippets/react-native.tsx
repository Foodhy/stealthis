import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from "react-native";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const scaleY = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      scaleY.setValue(0.6);
      Animated.spring(scaleY, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 12,
      }).start();
    }
  }, [value]);

  const display = String(value).padStart(2, "0");

  return (
    <View style={styles.digitColumn}>
      <Animated.View style={[styles.digitBox, { transform: [{ scaleY }] }]}>
        <Text style={styles.digitText}>{display}</Text>
      </Animated.View>
      <Text style={styles.digitLabel}>{label}</Text>
    </View>
  );
}

function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    const interval = setInterval(() => {
      const tl = getTimeLeft(targetDate);
      setTimeLeft(tl);
      if (
        !completedRef.current &&
        tl.days === 0 &&
        tl.hours === 0 &&
        tl.minutes === 0 &&
        tl.seconds === 0
      ) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <View style={styles.timerRow}>
      <FlipDigit value={timeLeft.days} label="Days" />
      <Text style={styles.colon}>:</Text>
      <FlipDigit value={timeLeft.hours} label="Hours" />
      <Text style={styles.colon}>:</Text>
      <FlipDigit value={timeLeft.minutes} label="Minutes" />
      <Text style={styles.colon}>:</Text>
      <FlipDigit value={timeLeft.seconds} label="Seconds" />
    </View>
  );
}

// --- Demo ---

export default function App() {
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  const [fiveMinDone, setFiveMinDone] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Countdown Timer</Text>

      <Text style={styles.sectionLabel}>Event in 3 days</Text>
      <CountdownTimer targetDate={threeDaysFromNow} />

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>
        5-minute countdown {fiveMinDone ? "(Done!)" : ""}
      </Text>
      <CountdownTimer
        targetDate={fiveMinutesFromNow}
        onComplete={() => setFiveMinDone(true)}
      />
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "600",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  digitColumn: {
    alignItems: "center",
  },
  digitBox: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 64,
    alignItems: "center",
  },
  digitText: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  digitLabel: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 6,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 1,
  },
  colon: {
    color: "#64748b",
    fontSize: 28,
    fontWeight: "700",
    marginHorizontal: 6,
    marginBottom: 20,
  },
  divider: {
    width: 200,
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 32,
  },
});
