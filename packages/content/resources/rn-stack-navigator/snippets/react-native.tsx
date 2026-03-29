import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  FlatList,
  StatusBar,
  type ViewStyle,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ScreenParams = Record<string, unknown>;

interface StackEntry {
  name: string;
  params: ScreenParams;
  anim: Animated.Value;
}

interface NavigationContextValue {
  push: (screen: string, params?: ScreenParams) => void;
  pop: () => void;
  navigate: (screen: string, params?: ScreenParams) => void;
  params: ScreenParams;
}

type ScreenComponent = React.FC<{ params: ScreenParams }>;

interface StackNavigatorProps {
  initialScreen: string;
  screens: Record<string, ScreenComponent>;
  headerStyle?: ViewStyle;
  headerTintColor?: string;
  animationDuration?: number;
}

/* ------------------------------------------------------------------ */
/*  Navigation Context                                                 */
/* ------------------------------------------------------------------ */

const NavigationContext = createContext<NavigationContextValue>({
  push: () => {},
  pop: () => {},
  navigate: () => {},
  params: {},
});

const useNavigation = () => useContext(NavigationContext);

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

interface HeaderProps {
  title: string;
  canGoBack: boolean;
  onBack: () => void;
  tintColor: string;
  style?: ViewStyle;
  rightAction?: ReactNode;
}

function Header({
  title,
  canGoBack,
  onBack,
  tintColor,
  style,
  rightAction,
}: HeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerSide}>
        {canGoBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backArrow, { color: tintColor }]}>
              {"\u2190"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[styles.headerTitle, { color: tintColor }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.headerSide}>{rightAction}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Stack Navigator                                                    */
/* ------------------------------------------------------------------ */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function StackNavigator({
  initialScreen,
  screens,
  headerStyle,
  headerTintColor = "#fff",
  animationDuration = 350,
}: StackNavigatorProps) {
  const makeEntry = (name: string, params: ScreenParams = {}): StackEntry => ({
    name,
    params,
    anim: new Animated.Value(1),
  });

  const [stack, setStack] = useState<StackEntry[]>([
    makeEntry(initialScreen),
  ]);
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const animating = useRef(false);

  /* Push ----------------------------------------------------------- */
  const push = useCallback(
    (screen: string, params: ScreenParams = {}) => {
      if (animating.current) return;
      animating.current = true;
      const entry: StackEntry = {
        name: screen,
        params,
        anim: new Animated.Value(0),
      };
      setStack((prev) => [...prev, entry]);
      Animated.timing(entry.anim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => {
        animating.current = false;
      });
    },
    [animationDuration],
  );

  /* Pop ------------------------------------------------------------ */
  const pop = useCallback(() => {
    if (animating.current) return;
    const current = stackRef.current;
    if (current.length <= 1) return;
    animating.current = true;
    const top = current[current.length - 1];
    Animated.timing(top.anim, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start(() => {
      setStack((prev) => prev.slice(0, -1));
      animating.current = false;
    });
  }, [animationDuration]);

  /* Navigate (reset stack) ----------------------------------------- */
  const navigate = useCallback(
    (screen: string, params: ScreenParams = {}) => {
      if (animating.current) return;
      setStack([makeEntry(screen, params)]);
    },
    [],
  );

  /* Render --------------------------------------------------------- */
  const topEntry = stack[stack.length - 1];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header
        title={topEntry.name}
        canGoBack={stack.length > 1}
        onBack={pop}
        tintColor={headerTintColor}
        style={headerStyle}
      />
      <View style={styles.screenArea}>
        {stack.map((entry, index) => {
          const ScreenComp = screens[entry.name];
          if (!ScreenComp) return null;

          const translateX = entry.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_WIDTH, 0],
          });
          const opacity = entry.anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.4, 0.85, 1],
          });

          return (
            <Animated.View
              key={`${entry.name}-${index}`}
              style={[
                styles.screen,
                { transform: [{ translateX }], opacity },
              ]}
            >
              <NavigationContext.Provider
                value={{ push, pop, navigate, params: entry.params }}
              >
                <ScreenComp params={entry.params} />
              </NavigationContext.Provider>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo Screens                                                       */
/* ------------------------------------------------------------------ */

const ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  title: `Item ${i + 1}`,
  subtitle: `Tap to view details for item ${i + 1}`,
}));

function HomeScreen() {
  const { push } = useNavigation();

  return (
    <FlatList
      data={ITEMS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => push("Detail", { itemId: item.id, title: item.title })}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Browse Items</Text>
          <TouchableOpacity onPress={() => push("Settings")}>
            <Text style={styles.settingsLink}>Settings</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

function DetailScreen({ params }: { params: ScreenParams }) {
  const { push, pop } = useNavigation();
  const title = (params.title as string) ?? "Detail";
  const itemId = (params.itemId as string) ?? "?";

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailCard}>
        <Text style={styles.detailEmoji}>{"\u2B50"}</Text>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailBody}>
          You are viewing details for item #{itemId}. This screen was pushed
          onto the stack with a slide-from-right animation.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          push("Detail", {
            itemId: `${itemId}+`,
            title: `${title} (deeper)`,
          })
        }
      >
        <Text style={styles.primaryButtonText}>Go Deeper</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={pop}>
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function SettingsScreen() {
  const { navigate } = useNavigation();

  const rows = ["Profile", "Notifications", "Privacy", "About"];

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsHeading}>Settings</Text>
      {rows.map((label) => (
        <View key={label} style={styles.settingsRow}>
          <Text style={styles.settingsRowText}>{label}</Text>
          <Text style={styles.settingsChevron}>{"\u203A"}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 32 }]}
        onPress={() => navigate("Home")}
      >
        <Text style={styles.primaryButtonText}>Reset to Home</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: "#1e293b",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerSide: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  screenArea: {
    flex: 1,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
  },

  /* Home */
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listHeaderText: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: "800",
  },
  settingsLink: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardTitle: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
  },

  /* Detail */
  detailContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  detailCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  detailEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  detailTitle: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  detailBody: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryButtonText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
  },

  /* Settings */
  settingsContainer: {
    flex: 1,
    padding: 24,
  },
  settingsHeading: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  settingsRowText: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "600",
  },
  settingsChevron: {
    color: "#64748b",
    fontSize: 22,
    fontWeight: "600",
  },
});

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <StackNavigator
      initialScreen="Home"
      screens={{
        Home: HomeScreen,
        Detail: DetailScreen,
        Settings: SettingsScreen,
      }}
    />
  );
}
