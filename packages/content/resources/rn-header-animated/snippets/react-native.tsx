import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnimatedHeaderProps {
  title: string;
  imageUri: string;
  children: React.ReactNode;
  headerHeight?: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COMPACT_HEIGHT = 60;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 44;

/* ------------------------------------------------------------------ */
/*  AnimatedHeader                                                     */
/* ------------------------------------------------------------------ */

function AnimatedHeader({
  title,
  imageUri,
  children,
  headerHeight = 200,
}: AnimatedHeaderProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const scrollRange = headerHeight - COMPACT_HEIGHT;

  /* ---------- interpolations ---------- */

  // Parallax: image moves at half speed
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0, -scrollRange / 2],
    extrapolate: "clamp",
  });

  // Scale up image when pulling down (over-scroll)
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolateRight: "clamp",
  });

  // Fade out large title
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.6, scrollRange],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Fade in compact header
  const compactOpacity = scrollY.interpolate({
    inputRange: [scrollRange * 0.7, scrollRange],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Overlay darkens as header collapses
  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0.25, 0.7],
    extrapolate: "clamp",
  });

  /* ---------- render ---------- */

  return (
    <View style={styles.container}>
      {/* Large header (sits behind scroll content) */}
      <Animated.View
        style={[
          styles.headerBackground,
          { height: headerHeight },
        ]}
      >
        <Animated.Image
          source={{ uri: imageUri }}
          style={[
            styles.headerImage,
            {
              height: headerHeight + 50,
              transform: [
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            },
          ]}
        />

        {/* Dark overlay */}
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
        />

        {/* Large title */}
        <Animated.View
          style={[
            styles.titleContainer,
            { opacity: titleOpacity },
          ]}
        >
          <Text style={styles.largeTitle}>{title}</Text>
        </Animated.View>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {children}
      </Animated.ScrollView>

      {/* Compact sticky header */}
      <Animated.View
        style={[
          styles.compactHeader,
          {
            height: COMPACT_HEIGHT + STATUS_BAR_HEIGHT,
            paddingTop: STATUS_BAR_HEIGHT,
            opacity: compactOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.compactTitle}>{title}</Text>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

function ListItem({ index }: { index: number }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listIcon}>
        <Text style={styles.listIconText}>{index + 1}</Text>
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>Item {index + 1}</Text>
        <Text style={styles.listSubtitle}>
          Tap to explore more details about this item
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const items = Array.from({ length: 20 }, (_, i) => i);

  return (
    <AnimatedHeader
      title="Explore"
      imageUri="https://picsum.photos/800/400"
      headerHeight={200}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Popular</Text>
        {items.map((i) => (
          <ListItem key={i} index={i} />
        ))}
      </View>
    </AnimatedHeader>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  /* Header */
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 1,
  },
  headerImage: {
    width: SCREEN_WIDTH,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
  },
  titleContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
  },

  /* Compact header */
  compactHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },

  /* Content */
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 16,
  },

  /* List items */
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  listIconText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  listSubtitle: {
    color: "#64748b",
    fontSize: 13,
  },
});
