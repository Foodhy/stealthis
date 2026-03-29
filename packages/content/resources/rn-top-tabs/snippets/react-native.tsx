import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TopTabsProps {
  tabs: Tab[];
}

/* ------------------------------------------------------------------ */
/*  TopTabs                                                            */
/* ------------------------------------------------------------------ */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function TopTabs({ tabs }: TopTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Animated values for underline position & width
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineW = useRef(new Animated.Value(0)).current;

  // Store measured tab layouts
  const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;

  // Refs
  const panelRef = useRef<ScrollView>(null);
  const tabBarRef = useRef<ScrollView>(null);

  /* ---------- helpers ---------- */

  const animateUnderline = useCallback(
    (index: number) => {
      const layout = tabLayouts[index];
      if (!layout) return;

      Animated.parallel([
        Animated.spring(underlineX, {
          toValue: layout.x,
          useNativeDriver: true,
          friction: 8,
          tension: 70,
        }),
        Animated.spring(underlineW, {
          toValue: layout.width,
          useNativeDriver: false,
          friction: 8,
          tension: 70,
        }),
      ]).start();
    },
    [underlineX, underlineW, tabLayouts],
  );

  const handleTabLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts[index] = { x, width };

      // Initialise underline on first tab measurement
      if (index === activeIndex && tabLayouts.length >= tabs.length) {
        underlineX.setValue(x);
        underlineW.setValue(width);
      }
    },
    [activeIndex, tabs.length, underlineX, underlineW, tabLayouts],
  );

  const scrollToTab = useCallback(
    (index: number) => {
      const layout = tabLayouts[index];
      if (layout && tabBarRef.current) {
        tabBarRef.current.scrollTo({
          x: Math.max(0, layout.x - SCREEN_WIDTH / 2 + layout.width / 2),
          animated: true,
        });
      }
    },
    [tabLayouts],
  );

  const handleTabPress = useCallback(
    (index: number) => {
      setActiveIndex(index);
      animateUnderline(index);
      scrollToTab(index);
      panelRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    },
    [animateUnderline, scrollToTab],
  );

  const handlePanelScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== activeIndex && index >= 0 && index < tabs.length) {
        setActiveIndex(index);
        animateUnderline(index);
        scrollToTab(index);
      }
    },
    [activeIndex, tabs.length, animateUnderline, scrollToTab],
  );

  /* ---------- render ---------- */

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          ref={tabBarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tabs.map((tab, i) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(i)}
              onLayout={(e) => handleTabLayout(i, e)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  i === activeIndex && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Animated underline */}
          <Animated.View
            style={[
              styles.underline,
              {
                width: underlineW,
                transform: [{ translateX: underlineX }],
              },
            ]}
          />
        </ScrollView>
      </View>

      {/* Panels */}
      <ScrollView
        ref={panelRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePanelScroll}
        scrollEventThrottle={16}
      >
        {tabs.map((tab) => (
          <View key={tab.key} style={styles.panel}>
            {tab.content}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

function DemoList({ items }: { items: string[] }) {
  return (
    <ScrollView style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const DEMO_TABS: Tab[] = [
  {
    key: "all",
    label: "All",
    content: (
      <DemoList
        items={["Featured Mix", "Daily Picks", "New Releases", "Trending Now"]}
      />
    ),
  },
  {
    key: "music",
    label: "Music",
    content: (
      <DemoList items={["Lo-fi Beats", "Jazz Vibes", "Indie Rock", "Ambient"]} />
    ),
  },
  {
    key: "videos",
    label: "Videos",
    content: (
      <DemoList
        items={["Tech Reviews", "Travel Vlogs", "Tutorials", "Short Films"]}
      />
    ),
  },
  {
    key: "podcasts",
    label: "Podcasts",
    content: (
      <DemoList
        items={["True Crime", "Comedy Hour", "Science Weekly", "Interviews"]}
      />
    ),
  },
  {
    key: "articles",
    label: "Articles",
    content: (
      <DemoList
        items={["Design Trends", "AI Research", "Startup Stories", "Deep Dives"]}
      />
    ),
  },
];

export default function App() {
  return <TopTabs tabs={DEMO_TABS} />;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  tabBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    position: "relative",
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#6366f1",
  },
  panel: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  list: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  listText: {
    color: "#e2e8f0",
    fontSize: 15,
  },
});
