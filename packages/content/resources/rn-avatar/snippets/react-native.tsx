import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageSourcePropType,
  type ViewStyle,
  type TextStyle,
} from "react-native";

// --- Types ---

type AvatarSize = "sm" | "md" | "lg" | "xl";
type StatusType = "online" | "offline" | "busy";

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: StatusType;
  color?: string;
}

interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
}

// --- Constants ---

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 15,
  lg: 18,
  xl: 24,
};

const STATUS_SIZES: Record<AvatarSize, number> = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
};

const STATUS_COLORS: Record<StatusType, string> = {
  online: "#22c55e",
  offline: "#94a3b8",
  busy: "#ef4444",
};

// --- Helpers ---

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

// --- Avatar ---

function Avatar({
  src,
  name,
  size = "md",
  status,
  color = "#6366f1",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const dim = SIZES[size];
  const fontSize = FONT_SIZES[size];
  const statusDim = STATUS_SIZES[size];
  const showImage = !!src && !imgError;

  return (
    <View style={[styles.avatarWrapper, { width: dim, height: dim }]}>
      {showImage ? (
        <Image
          source={{ uri: src }}
          style={[
            styles.image,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
          onError={() => setImgError(true)}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: color,
            },
          ]}
        >
          <Text style={[styles.initialsText, { fontSize }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {status && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDim,
              height: statusDim,
              borderRadius: statusDim / 2,
              backgroundColor: STATUS_COLORS[status],
              borderWidth: statusDim > 10 ? 2.5 : 2,
            },
          ]}
        />
      )}
    </View>
  );
}

// --- AvatarGroup ---

function AvatarGroup({ avatars, max = 3, size = "md" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const dim = SIZES[size];
  const fontSize = FONT_SIZES[size] - 2;
  const overlap = -(dim * 0.3);

  return (
    <View style={styles.groupContainer}>
      {visible.map((avatar, i) => (
        <View
          key={i}
          style={[
            styles.groupItem,
            { marginLeft: i === 0 ? 0 : overlap, zIndex: visible.length - i },
          ]}
        >
          <View style={[styles.groupRing, { borderRadius: (dim + 4) / 2 }]}>
            <Avatar {...avatar} size={size} />
          </View>
        </View>
      ))}

      {overflow > 0 && (
        <View
          style={[
            styles.groupItem,
            { marginLeft: overlap, zIndex: 0 },
          ]}
        >
          <View
            style={[
              styles.overflowCircle,
              {
                width: dim,
                height: dim,
                borderRadius: dim / 2,
              },
            ]}
          >
            <Text style={[styles.overflowText, { fontSize }]}>
              +{overflow}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// --- Demo App ---

export default function App() {
  const groupAvatars: AvatarProps[] = [
    { name: "Alice Morgan", src: "https://picsum.photos/seed/a1/200" },
    { name: "Bob Chen", src: "https://picsum.photos/seed/b2/200" },
    { name: "Carol Davis", src: "https://picsum.photos/seed/c3/200" },
    { name: "Dan Wilson", color: "#8b5cf6" },
    { name: "Eve Taylor", color: "#ec4899" },
  ];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Avatar</Text>

      {/* Size variants with initials */}
      <Text style={styles.label}>Sizes</Text>
      <View style={styles.row}>
        <Avatar name="Amy Lin" size="sm" color="#8b5cf6" />
        <Avatar name="Amy Lin" size="md" color="#8b5cf6" />
        <Avatar name="Amy Lin" size="lg" color="#8b5cf6" />
        <Avatar name="Amy Lin" size="xl" color="#8b5cf6" />
      </View>

      {/* Image avatar */}
      <Text style={styles.label}>With Image</Text>
      <View style={styles.row}>
        <Avatar
          name="John Doe"
          src="https://picsum.photos/seed/jd/200"
          size="lg"
        />
        <Avatar
          name="Jane Smith"
          src="https://picsum.photos/seed/js/200"
          size="lg"
        />
      </View>

      {/* Status indicators */}
      <Text style={styles.label}>Status</Text>
      <View style={styles.row}>
        <Avatar name="Online User" size="lg" color="#6366f1" status="online" />
        <Avatar name="Offline User" size="lg" color="#6366f1" status="offline" />
        <Avatar name="Busy User" size="lg" color="#6366f1" status="busy" />
      </View>

      {/* Avatar group */}
      <Text style={styles.label}>Group</Text>
      <AvatarGroup avatars={groupAvatars} max={3} size="lg" />
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
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  initialsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderColor: "#0f172a",
  },
  groupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupItem: {
    position: "relative",
  },
  groupRing: {
    padding: 2,
    backgroundColor: "#0f172a",
  },
  overflowCircle: {
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
});
