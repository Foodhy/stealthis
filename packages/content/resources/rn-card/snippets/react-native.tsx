import React, { useRef, type ReactNode } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Variant = "elevated" | "outlined" | "filled";

interface CardProps {
  variant?: Variant;
  onPress?: () => void;
  style?: ViewStyle;
  children?: ReactNode;
}

interface HeaderProps {
  imageUri: string;
  height?: number;
  overlay?: boolean;
  children?: ReactNode;
}

interface BodyProps {
  children?: ReactNode;
  style?: ViewStyle;
}

interface FooterProps {
  children?: ReactNode;
  style?: ViewStyle;
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                       */
/* -------------------------------------------------------------------------- */

function Card({ variant = "elevated", onPress, style, children }: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const variantStyle: ViewStyle =
    variant === "elevated"
      ? styles.elevated
      : variant === "outlined"
        ? styles.outlined
        : styles.filled;

  const cardContent = (
    <View style={[styles.card, variantStyle, style]}>{children}</View>
  );

  if (!onPress) return cardContent;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[styles.card, variantStyle, style]}>{children}</View>
      </Animated.View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card.Header                                                                */
/* -------------------------------------------------------------------------- */

function Header({
  imageUri,
  height = 180,
  overlay = false,
  children,
}: HeaderProps) {
  return (
    <View style={[styles.header, { height }]}>
      <Image
        source={{ uri: imageUri }}
        style={[StyleSheet.absoluteFillObject, styles.headerImage]}
        resizeMode="cover"
      />
      {overlay && <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />}
      {children && <View style={styles.headerContent}>{children}</View>}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card.Body                                                                  */
/* -------------------------------------------------------------------------- */

function Body({ children, style }: BodyProps) {
  return <View style={[styles.body, style]}>{children}</View>;
}

/* -------------------------------------------------------------------------- */
/*  Card.Footer                                                                */
/* -------------------------------------------------------------------------- */

function Footer({ children, style }: FooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

/* -------------------------------------------------------------------------- */
/*  Compound exports                                                           */
/* -------------------------------------------------------------------------- */

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

/* -------------------------------------------------------------------------- */
/*  Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  } as ViewStyle,

  elevated: {
    backgroundColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  } as ViewStyle,

  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  } as ViewStyle,

  filled: {
    backgroundColor: "rgba(255,255,255,0.08)",
  } as ViewStyle,

  header: {
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  } as ViewStyle,

  headerImage: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  } as ImageStyle,

  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
  } as ViewStyle,

  headerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  } as ViewStyle,

  body: {
    padding: 16,
  } as ViewStyle,

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  } as ViewStyle,
});

/* -------------------------------------------------------------------------- */
/*  Demo App                                                                   */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <ScrollView
      style={appStyles.screen}
      contentContainerStyle={appStyles.container}
    >
      {/* Elevated card with image header */}
      <Card
        variant="elevated"
        onPress={() => console.log("Elevated card pressed")}
      >
        <Card.Header
          imageUri="https://picsum.photos/seed/mountain/600/360"
          height={200}
          overlay
        >
          <Text style={appStyles.headerTitle}>Mountain Sunrise</Text>
          <Text style={appStyles.headerSubtitle}>Dolomites, Italy</Text>
        </Card.Header>
        <Card.Body>
          <Text style={appStyles.bodyText}>
            A breathtaking sunrise captured over the jagged peaks of the
            Dolomites. The warm golden light spills across the valleys below.
          </Text>
        </Card.Body>
      </Card>

      {/* Outlined card */}
      <Card variant="outlined">
        <Card.Body>
          <Text style={appStyles.outlinedTitle}>Weekly Summary</Text>
          <Text style={appStyles.bodyText}>
            You completed 12 tasks this week, a 20% increase from last week.
            Keep up the great work!
          </Text>
          <View style={appStyles.statRow}>
            <View style={appStyles.stat}>
              <Text style={appStyles.statValue}>12</Text>
              <Text style={appStyles.statLabel}>Completed</Text>
            </View>
            <View style={appStyles.stat}>
              <Text style={appStyles.statValue}>3</Text>
              <Text style={appStyles.statLabel}>In Progress</Text>
            </View>
            <View style={appStyles.stat}>
              <Text style={appStyles.statValue}>92%</Text>
              <Text style={appStyles.statLabel}>On Time</Text>
            </View>
          </View>
        </Card.Body>
      </Card>

      {/* Filled card with footer actions */}
      <Card variant="filled" onPress={() => console.log("Filled card pressed")}>
        <Card.Header
          imageUri="https://picsum.photos/seed/coastal/600/360"
          height={160}
        />
        <Card.Body>
          <Text style={appStyles.outlinedTitle}>Coastal Path</Text>
          <Text style={appStyles.bodyText}>
            Explore the rugged coastline with this 8-mile trail featuring
            dramatic cliffs, hidden beaches, and abundant wildlife.
          </Text>
        </Card.Body>
        <Card.Footer>
          <Pressable style={appStyles.btnOutline}>
            <Text style={appStyles.btnOutlineText}>Share</Text>
          </Pressable>
          <Pressable style={appStyles.btnPrimary}>
            <Text style={appStyles.btnPrimaryText}>Save Route</Text>
          </Pressable>
        </Card.Footer>
      </Card>
    </ScrollView>
  );
}

const appStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  } as ViewStyle,

  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  } as ViewStyle,

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  } as TextStyle,

  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 2,
  } as TextStyle,

  bodyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 22,
  } as TextStyle,

  outlinedTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  } as TextStyle,

  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  } as ViewStyle,

  stat: {
    alignItems: "center",
  } as ViewStyle,

  statValue: {
    color: "#38bdf8",
    fontSize: 24,
    fontWeight: "700",
  } as TextStyle,

  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
  } as TextStyle,

  btnOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  } as ViewStyle,

  btnOutlineText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  } as TextStyle,

  btnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
  } as ViewStyle,

  btnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  } as TextStyle,
});
