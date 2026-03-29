import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

interface LikeButtonProps {
  liked: boolean;
  onToggle: () => void;
  size?: number;
}

const PARTICLE_COUNT = 6;

function LikeButton({ liked, onToggle, size = 48 }: LikeButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const handlePress = () => {
    if (!liked) {
      // Scale spring
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          useNativeDriver: true,
          tension: 300,
          friction: 6,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();

      // Particle burst
      const angles = Array.from(
        { length: PARTICLE_COUNT },
        (_, i) => (i * 2 * Math.PI) / PARTICLE_COUNT
      );
      particles.forEach((p, i) => {
        const angle = angles[i];
        const dist = size * 0.8;
        p.opacity.setValue(1);
        p.translateX.setValue(0);
        p.translateY.setValue(0);
        p.scale.setValue(1);
        Animated.parallel([
          Animated.timing(p.translateX, {
            toValue: Math.cos(angle) * dist,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(p.translateY, {
            toValue: Math.sin(angle) * dist,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Unlike: gentle scale
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
      ]).start();
    }
    onToggle();
  };

  const heartSize = size * 0.6;
  const particleSize = size * 0.2;

  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: "center", justifyContent: "center" }}>
      {/* Particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            opacity: p.opacity,
            transform: [
              { translateX: p.translateX },
              { translateY: p.translateY },
              { scale: p.scale },
            ],
          }}
        >
          <Text style={{ fontSize: particleSize }}>❤️</Text>
        </Animated.View>
      ))}

      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Text style={{ fontSize: heartSize, color: liked ? "#ef4444" : "#64748b" }}>
            {liked ? "❤️" : "🤍"}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// --- Demo ---

export default function App() {
  const [liked1, setLiked1] = useState(false);
  const [liked2, setLiked2] = useState(true);
  const [liked3, setLiked3] = useState(false);
  const [count1, setCount1] = useState(42);
  const [count2, setCount2] = useState(128);
  const [count3, setCount3] = useState(7);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Like Button</Text>

      <View style={styles.row}>
        <View style={styles.likeColumn}>
          <LikeButton
            liked={liked1}
            onToggle={() => {
              setLiked1(!liked1);
              setCount1((c) => (liked1 ? c - 1 : c + 1));
            }}
            size={36}
          />
          <Text style={styles.count}>{count1}</Text>
          <Text style={styles.sizeLabel}>Small</Text>
        </View>

        <View style={styles.likeColumn}>
          <LikeButton
            liked={liked2}
            onToggle={() => {
              setLiked2(!liked2);
              setCount2((c) => (liked2 ? c - 1 : c + 1));
            }}
            size={48}
          />
          <Text style={styles.count}>{count2}</Text>
          <Text style={styles.sizeLabel}>Medium</Text>
        </View>

        <View style={styles.likeColumn}>
          <LikeButton
            liked={liked3}
            onToggle={() => {
              setLiked3(!liked3);
              setCount3((c) => (liked3 ? c - 1 : c + 1));
            }}
            size={64}
          />
          <Text style={styles.count}>{count3}</Text>
          <Text style={styles.sizeLabel}>Large</Text>
        </View>
      </View>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  likeColumn: {
    alignItems: "center",
  },
  count: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  sizeLabel: {
    color: "#475569",
    fontSize: 12,
    marginTop: 4,
  },
});
