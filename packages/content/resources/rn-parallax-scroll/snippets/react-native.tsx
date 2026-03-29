import React, { useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text, View, type ViewStyle } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ------------------------------------------------------------------ */
/*  ParallaxScrollView                                                 */
/* ------------------------------------------------------------------ */

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function ParallaxScrollView({ children, style }: ParallaxScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      style={[styles.scrollView, style]}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
      showsVerticalScrollIndicator={false}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            scrollY,
          });
        }
        return child;
      })}
    </Animated.ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  ParallaxLayer                                                      */
/* ------------------------------------------------------------------ */

interface ParallaxLayerProps {
  speed?: number;
  offset?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  scrollY?: Animated.Value;
}

function ParallaxLayer({ speed = 0.5, offset = 0, children, style, scrollY }: ParallaxLayerProps) {
  if (!scrollY) {
    return <View style={style}>{children}</View>;
  }

  const translateY = scrollY.interpolate({
    inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT, SCREEN_HEIGHT * 2],
    outputRange: [
      -SCREEN_HEIGHT * speed + offset,
      offset,
      SCREEN_HEIGHT * speed + offset,
      SCREEN_HEIGHT * 2 * speed + offset,
    ],
  });

  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/* ------------------------------------------------------------------ */
/*  ParallaxImage                                                      */
/* ------------------------------------------------------------------ */

interface ParallaxImageProps {
  uri: string;
  height: number;
  speed?: number;
  style?: ViewStyle;
  scrollY?: Animated.Value;
}

function ParallaxImage({ uri, height, speed = 0.4, style, scrollY }: ParallaxImageProps) {
  const imageHeight = height * 1.4;

  const translateY = scrollY
    ? scrollY.interpolate({
        inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
        outputRange: [-SCREEN_HEIGHT * speed, 0, SCREEN_HEIGHT * speed],
        extrapolate: "clamp",
      })
    : new Animated.Value(0);

  return (
    <View style={[{ height, overflow: "hidden" }, style]}>
      <Animated.Image
        source={{ uri }}
        style={[
          {
            width: SCREEN_WIDTH,
            height: imageHeight,
            position: "absolute",
            top: -(imageHeight - height) / 2,
            transform: [{ translateY }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo components                                                    */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80";
const CARD_IMAGE_1 = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80";
const CARD_IMAGE_2 = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";

function ContentCard({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      <ParallaxScrollView>
        {/* Hero section with parallax background */}
        <ParallaxLayer speed={0.3} style={styles.heroContainer}>
          <ParallaxImage uri={PLACEHOLDER_IMAGE} height={SCREEN_HEIGHT * 0.5} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Parallax Scroll</Text>
            <Text style={styles.heroSubtitle}>Layered elements at different speeds</Text>
          </View>
        </ParallaxLayer>

        {/* Content section 1 */}
        <ParallaxLayer speed={0.8} style={styles.section}>
          <ContentCard
            title="Depth & Motion"
            description="Background layers move slower than foreground content, creating a natural sense of depth as you scroll."
            color="#6366f1"
          />
          <ContentCard
            title="Configurable Speed"
            description="Each layer accepts a speed prop: 0 for fixed, 0.5 for half-speed, 1 for normal, and 2 for double speed."
            color="#f59e0b"
          />
        </ParallaxLayer>

        {/* Parallax image divider */}
        <ParallaxLayer speed={0.4}>
          <ParallaxImage uri={CARD_IMAGE_1} height={200} speed={0.3} />
        </ParallaxLayer>

        {/* Content section 2 */}
        <ParallaxLayer speed={0.9} style={styles.section}>
          <ContentCard
            title="Smooth Performance"
            description="Uses the native Animated driver for 60fps interpolation — no JS thread bottleneck."
            color="#10b981"
          />
        </ParallaxLayer>

        {/* Parallax image divider */}
        <ParallaxLayer speed={0.4}>
          <ParallaxImage uri={CARD_IMAGE_2} height={200} speed={0.3} />
        </ParallaxLayer>

        {/* Content section 3 */}
        <ParallaxLayer speed={1} style={styles.section}>
          <ContentCard
            title="Composable Layers"
            description="Stack as many ParallaxLayer components as you need. Mix images, text, and custom components at different depths."
            color="#ef4444"
          />
        </ParallaxLayer>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Scroll up to see the effect</Text>
        </View>
      </ParallaxScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: SCREEN_HEIGHT * 0.5,
    position: "relative",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#475569",
    fontSize: 14,
  },
});
