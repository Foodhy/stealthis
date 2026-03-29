import React, { useState, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, type ViewStyle, type TextStyle } from "react-native";

// --- Types ---

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

interface ChipProps {
  label: string;
  onPress?: () => void;
  onDismiss?: () => void;
  icon?: ReactNode;
  selected?: boolean;
}

// --- Constants ---

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "#334155", text: "#e2e8f0" },
  success: { bg: "#166534", text: "#bbf7d0" },
  warning: { bg: "#854d0e", text: "#fef08a" },
  error: { bg: "#991b1b", text: "#fecaca" },
  info: { bg: "#1e40af", text: "#bfdbfe" },
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: "#94a3b8",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  info: "#3b82f6",
};

// --- Badge ---

function Badge({ label, variant = "default", size = "md", dot = false }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const isSmall = size === "sm";

  if (dot) {
    return (
      <View style={styles.dotRow}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: DOT_COLORS[variant],
              width: isSmall ? 6 : 8,
              height: isSmall ? 6 : 8,
              borderRadius: isSmall ? 3 : 4,
            },
          ]}
        />
        <Text style={[styles.dotLabel, { fontSize: isSmall ? 11 : 13 }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: isSmall ? 4 : 6,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// --- Chip ---

function Chip({ label, onPress, onDismiss, icon, selected = false }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      {icon && <View style={styles.chipIcon}>{icon}</View>}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={6} style={styles.chipDismiss}>
          <Text style={styles.chipDismissText}>✕</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// --- Simple Icon (for demo) ---

function CircleIcon({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
  );
}

// --- Demo App ---

export default function App() {
  const [chips, setChips] = useState([
    { label: "React Native", selected: true, dismissible: false },
    { label: "TypeScript", selected: false, dismissible: false },
    { label: "Expo", selected: false, dismissible: true },
    { label: "Navigation", selected: true, dismissible: true },
    { label: "Animation", selected: false, dismissible: true },
  ]);

  const toggleChip = (index: number) => {
    setChips((prev) => prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c)));
  };

  const dismissChip = (index: number) => {
    setChips((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Badge</Text>

      {/* Badge variants */}
      <Text style={styles.label}>Variants</Text>
      <View style={styles.row}>
        <Badge label="Default" variant="default" />
        <Badge label="Success" variant="success" />
        <Badge label="Warning" variant="warning" />
        <Badge label="Error" variant="error" />
        <Badge label="Info" variant="info" />
      </View>

      {/* Small badges */}
      <Text style={styles.label}>Small</Text>
      <View style={styles.row}>
        <Badge label="New" variant="info" size="sm" />
        <Badge label="Beta" variant="warning" size="sm" />
        <Badge label="3" variant="error" size="sm" />
      </View>

      {/* Dot badges */}
      <Text style={styles.label}>Dot Mode</Text>
      <View style={styles.row}>
        <Badge label="Online" variant="success" dot />
        <Badge label="Away" variant="warning" dot />
        <Badge label="Offline" variant="default" dot />
        <Badge label="Error" variant="error" dot />
      </View>

      {/* Chips */}
      <Text style={[styles.heading, { marginTop: 32 }]}>Chip</Text>
      <Text style={styles.label}>Interactive Chips</Text>
      <View style={styles.chipRow}>
        {chips.map((chip, i) => (
          <Chip
            key={chip.label}
            label={chip.label}
            selected={chip.selected}
            onPress={() => toggleChip(i)}
            onDismiss={chip.dismissible ? () => dismissChip(i) : undefined}
            icon={chip.selected ? <CircleIcon color="#818cf8" /> : undefined}
          />
        ))}
      </View>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    paddingTop: 60,
  },
  heading: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  badge: {
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {},
  dotLabel: {
    color: "#cbd5e1",
    fontWeight: "500",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: "#1e1b4b",
    borderColor: "#6366f1",
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#c7d2fe",
  },
  chipIcon: {
    marginRight: 2,
  },
  chipDismiss: {
    marginLeft: 2,
    padding: 2,
  },
  chipDismissText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
