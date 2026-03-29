import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  type ReactNode,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Tab {
  key: string;
  label: string;
  icon: string;
  badge?: string | number;
  screen: ReactNode;
}

interface BottomTabsProps {
  tabs: Tab[];
  initialTab?: string;
}

/* ------------------------------------------------------------------ */
/*  BottomTabs                                                         */
/* ------------------------------------------------------------------ */

function BottomTabs({ tabs, initialTab }: BottomTabsProps) {
  const [activeKey, setActiveKey] = useState(initialTab ?? tabs[0]?.key ?? "");
  const tabWidth = Dimensions.get("window").width / tabs.length;

  // Sliding indicator
  const activeIndex = tabs.findIndex((t) => t.key === activeKey);
  const indicatorX = useRef(new Animated.Value(activeIndex * tabWidth)).current;

  // Per-tab icon scale
  const scales = useRef(
    tabs.map((_, i) => new Animated.Value(i === activeIndex ? 1.15 : 1))
  ).current;

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeKey);
    if (idx === -1) return;

    Animated.spring(indicatorX, {
      toValue: idx * tabWidth,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();

    scales.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === idx ? 1.15 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }).start();
    });
  }, [activeKey]);

  const activeScreen = tabs.find((t) => t.key === activeKey)?.screen ?? null;

  return (
    <View style={styles.container}>
      {/* Screen area */}
      <View style={styles.screenArea}>{activeScreen}</View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth * 0.5,
              transform: [{ translateX: Animated.add(indicatorX, tabWidth * 0.25) }],
            },
          ]}
        />

        {tabs.map((tab, i) => {
          const isActive = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => setActiveKey(tab.key)}
            >
              <View style={styles.iconWrapper}>
                <Animated.Text style={[styles.icon, { transform: [{ scale: scales[i] }] }]}>
                  {tab.icon}
                </Animated.Text>

                {/* Badge */}
                {tab.badge != null && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {typeof tab.badge === "number" && tab.badge > 99 ? "99+" : String(tab.badge)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const BOTTOM_SAFE = 24;
const TAB_BAR_HEIGHT = 60;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT + BOTTOM_SAFE,
    paddingBottom: BOTTOM_SAFE,
    backgroundColor: "#1e293b",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  indicator: {
    position: "absolute",
    top: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#818cf8",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  iconWrapper: {
    position: "relative",
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  labelActive: {
    color: "#818cf8",
    fontWeight: "600",
  },
});

/* ------------------------------------------------------------------ */
/*  Demo screen helper                                                 */
/* ------------------------------------------------------------------ */

function DemoScreen({ title, emoji }: { title: string; emoji: string }) {
  return (
    <View style={demoStyles.screen}>
      <Text style={demoStyles.emoji}>{emoji}</Text>
      <Text style={demoStyles.title}>{title}</Text>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e2e8f0",
  },
});

/* ------------------------------------------------------------------ */
/*  App (demo)                                                         */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <BottomTabs
      tabs={[
        {
          key: "home",
          label: "Home",
          icon: "🏠",
          screen: <DemoScreen title="Home" emoji="🏠" />,
        },
        {
          key: "search",
          label: "Search",
          icon: "🔍",
          screen: <DemoScreen title="Search" emoji="🔍" />,
        },
        {
          key: "notifications",
          label: "Notifications",
          icon: "🔔",
          badge: "3",
          screen: <DemoScreen title="Notifications" emoji="🔔" />,
        },
        {
          key: "profile",
          label: "Profile",
          icon: "👤",
          screen: <DemoScreen title="Profile" emoji="👤" />,
        },
      ]}
    />
  );
}
