import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Pulse hook                                                         */
/* ------------------------------------------------------------------ */

function usePulse(): Animated.Value {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return anim;
}

/* ------------------------------------------------------------------ */
/*  Base skeleton shape                                                */
/* ------------------------------------------------------------------ */

interface BaseProps {
  style?: ViewStyle;
}

function SkeletonBase({ style }: BaseProps) {
  const opacity = usePulse();
  return <Animated.View style={[styles.base, style, { opacity }]} />;
}

/* ------------------------------------------------------------------ */
/*  Skeleton.Line                                                      */
/* ------------------------------------------------------------------ */

interface LineProps {
  width?: DimensionValue;
  height?: number;
}

function Line({ width = "100%", height = 16 }: LineProps) {
  return (
    <SkeletonBase
      style={{ width, height, borderRadius: height / 2 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton.Circle                                                    */
/* ------------------------------------------------------------------ */

interface CircleProps {
  size?: number;
}

function Circle({ size = 48 }: CircleProps) {
  return (
    <SkeletonBase
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton.Rect                                                      */
/* ------------------------------------------------------------------ */

interface RectProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

function Rect({ width = "100%", height = 100, borderRadius = 8 }: RectProps) {
  return <SkeletonBase style={{ width, height, borderRadius }} />;
}

/* ------------------------------------------------------------------ */
/*  Skeleton.Card                                                      */
/* ------------------------------------------------------------------ */

function Card() {
  return (
    <View style={styles.card}>
      {/* Avatar row */}
      <View style={styles.cardRow}>
        <Circle size={44} />
        <View style={styles.cardMeta}>
          <Line width="50%" height={14} />
          <Line width="30%" height={12} />
        </View>
      </View>
      {/* Body lines */}
      <View style={styles.cardBody}>
        <Line width="100%" />
        <Line width="92%" />
        <Line width="60%" />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton namespace                                                 */
/* ------------------------------------------------------------------ */

const Skeleton = {
  Line,
  Circle,
  Rect,
  Card,
};

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      {/* Preset card */}
      <Skeleton.Card />

      <View style={styles.spacer} />

      {/* Custom skeleton layout */}
      <View style={styles.custom}>
        <Skeleton.Rect width={80} height={80} borderRadius={12} />
        <View style={styles.customLines}>
          <Skeleton.Line width="60%" height={14} />
          <Skeleton.Line width="90%" />
          <Skeleton.Line width="40%" height={12} />
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  base: {
    backgroundColor: "#374151",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardMeta: {
    flex: 1,
    gap: 6,
  },
  cardBody: {
    marginTop: 16,
    gap: 8,
  },
  spacer: {
    height: 24,
  },
  custom: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  customLines: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
});
