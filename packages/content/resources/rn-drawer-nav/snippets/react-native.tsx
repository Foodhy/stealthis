import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
} from "react-native";
import type { ReactNode, GestureResponderEvent, PanResponderGestureState } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const EDGE_THRESHOLD = 30;
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.3;

interface MenuItem {
  label: string;
  icon: string;
  key: string;
}

interface DrawerNavigatorProps {
  children: ReactNode;
  drawerContent?: ReactNode;
  drawerWidth?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Home", icon: "🏠", key: "home" },
  { label: "Profile", icon: "👤", key: "profile" },
  { label: "Settings", icon: "⚙️", key: "settings" },
  { label: "Help", icon: "❓", key: "help" },
  { label: "About", icon: "ℹ️", key: "about" },
];

function DefaultDrawerContent({
  activeItem,
  onSelect,
}: {
  activeItem: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.profileSection}>
        <View style={drawerStyles.avatar}>
          <Text style={drawerStyles.avatarText}>JD</Text>
        </View>
        <Text style={drawerStyles.profileName}>Jane Doe</Text>
        <Text style={drawerStyles.profileEmail}>jane.doe@example.com</Text>
      </View>

      <View style={drawerStyles.menuSection}>
        {MENU_ITEMS.map((item) => {
          const isActive = item.key === activeItem;
          return (
            <TouchableOpacity
              key={item.key}
              style={[drawerStyles.menuItem, isActive && drawerStyles.menuItemActive]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}
            >
              <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
              <Text style={[drawerStyles.menuLabel, isActive && drawerStyles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={drawerStyles.separator} />

      <TouchableOpacity style={drawerStyles.logoutButton} activeOpacity={0.7}>
        <Text style={drawerStyles.menuIcon}>🚪</Text>
        <Text style={drawerStyles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function DrawerNavigator({ children, drawerContent, drawerWidth = 280 }: DrawerNavigatorProps) {
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const isOpen = useRef(false);
  const [activeItem, setActiveItem] = useState("home");

  const openDrawer = useCallback(() => {
    isOpen.current = true;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  }, [translateX]);

  const closeDrawer = useCallback(() => {
    isOpen.current = false;
    Animated.timing(translateX, {
      toValue: -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [translateX, drawerWidth]);

  const toggleDrawer = useCallback(() => {
    if (isOpen.current) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [openDrawer, closeDrawer]);

  const handleMenuSelect = useCallback(
    (key: string) => {
      setActiveItem(key);
      closeDrawer();
    },
    [closeDrawer],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx, moveX } = gestureState;
        if (!isOpen.current && moveX - dx < EDGE_THRESHOLD && dx > 10) {
          return true;
        }
        if (isOpen.current && dx < -10) {
          return true;
        }
        return false;
      },
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx } = gestureState;
        let newX: number;
        if (isOpen.current) {
          newX = Math.max(-drawerWidth, Math.min(0, dx));
        } else {
          newX = Math.max(-drawerWidth, Math.min(0, -drawerWidth + dx));
        }
        translateX.setValue(newX);
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx, vx } = gestureState;
        if (vx > VELOCITY_THRESHOLD || dx > SWIPE_THRESHOLD) {
          openDrawer();
        } else if (vx < -VELOCITY_THRESHOLD || dx < -SWIPE_THRESHOLD) {
          closeDrawer();
        } else if (isOpen.current) {
          openDrawer();
        } else {
          closeDrawer();
        }
      },
    }),
  ).current;

  const overlayOpacity = translateX.interpolate({
    inputRange: [-drawerWidth, 0],
    outputRange: [0, 0.55],
    extrapolate: "clamp",
  });

  const overlayPointerEvents = translateX.interpolate({
    inputRange: [-drawerWidth, -drawerWidth + 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      <View style={styles.mainContent}>{children}</View>

      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
        pointerEvents={isOpen.current || overlayPointerEvents ? "auto" : "none"}
      >
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            transform: [{ translateX }],
          },
        ]}
      >
        {drawerContent ?? (
          <DefaultDrawerContent activeItem={activeItem} onSelect={handleMenuSelect} />
        )}
      </Animated.View>

      <TouchableOpacity style={styles.hamburger} onPress={toggleDrawer} activeOpacity={0.7}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  mainContent: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 10,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#1e293b",
    zIndex: 20,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  hamburger: {
    position: "absolute",
    top: 54,
    left: 16,
    zIndex: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: "#e2e8f0",
    borderRadius: 1,
    marginVertical: 2.5,
  },
});

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  profileName: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileEmail: {
    color: "#94a3b8",
    fontSize: 13,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "500",
  },
  menuLabelActive: {
    color: "#818cf8",
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default function App() {
  return (
    <DrawerNavigator>
      <StatusBar barStyle="light-content" />
      <View style={appStyles.container}>
        <View style={appStyles.hero}>
          <Text style={appStyles.title}>Welcome Home</Text>
          <Text style={appStyles.subtitle}>Swipe from the left edge or tap the menu button</Text>
        </View>
        <View style={appStyles.cardRow}>
          {["📊 Analytics", "📝 Notes", "📷 Photos"].map((label) => (
            <View key={label} style={appStyles.card}>
              <Text style={appStyles.cardText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </DrawerNavigator>
  );
}

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
    paddingHorizontal: 20,
  },
  hero: {
    marginBottom: 32,
  },
  title: {
    color: "#f1f5f9",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  cardText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
});
