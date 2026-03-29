import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Measurement {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TransitionState {
  id: string;
  source: Measurement;
  dest: Measurement;
  animProgress: Animated.Value;
  opacity: Animated.Value;
  active: boolean;
}

interface SharedTransitionContextValue {
  register: (id: string, ref: React.RefObject<View>) => void;
  unregister: (id: string) => void;
  startTransition: (id: string, dest: Measurement) => void;
  reverseTransition: (id: string) => void;
  getTransition: (id: string) => TransitionState | undefined;
  isAnimating: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SharedTransitionContext = createContext<SharedTransitionContextValue>({
  register: () => {},
  unregister: () => {},
  startTransition: () => {},
  reverseTransition: () => {},
  getTransition: () => undefined,
  isAnimating: false,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

function SharedTransitionProvider({ children }: { children: ReactNode }) {
  const refs = useRef<Record<string, React.RefObject<View>>>({});
  const [transitions, setTransitions] = useState<Record<string, TransitionState>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const register = useCallback((id: string, ref: React.RefObject<View>) => {
    refs.current[id] = ref;
  }, []);

  const unregister = useCallback((id: string) => {
    delete refs.current[id];
  }, []);

  const measure = (ref: React.RefObject<View>): Promise<Measurement> =>
    new Promise((resolve) => {
      if (ref.current) {
        ref.current.measure((_x, _y, width, height, pageX, pageY) => {
          resolve({ x: pageX, y: pageY, width, height });
        });
      }
    });

  const startTransition = useCallback(async (id: string, dest: Measurement) => {
    const ref = refs.current[id];
    if (!ref) return;

    const source = await measure(ref);
    const animProgress = new Animated.Value(0);
    const opacity = new Animated.Value(0);

    const state: TransitionState = {
      id,
      source,
      dest,
      animProgress,
      opacity,
      active: true,
    };

    setTransitions((prev) => ({ ...prev, [id]: state }));
    setIsAnimating(true);

    Animated.parallel([
      Animated.spring(animProgress, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const reverseTransition = useCallback((id: string) => {
    setTransitions((prev) => {
      const t = prev[id];
      if (!t) return prev;

      Animated.parallel([
        Animated.spring(t.animProgress, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: false,
        }),
        Animated.timing(t.opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setTransitions((p) => {
          const copy = { ...p };
          delete copy[id];
          return copy;
        });
        setIsAnimating(false);
      });

      return prev;
    });
  }, []);

  const getTransition = useCallback(
    (id: string) => transitions[id],
    [transitions],
  );

  const value = useMemo(
    () => ({
      register,
      unregister,
      startTransition,
      reverseTransition,
      getTransition,
      isAnimating,
    }),
    [register, unregister, startTransition, reverseTransition, getTransition, isAnimating],
  );

  // Render the animated overlay clones
  const overlays = Object.values(transitions).map((t) => {
    const left = t.animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [t.source.x, t.dest.x],
    });
    const top = t.animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [t.source.y, t.dest.y],
    });
    const width = t.animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [t.source.width, t.dest.width],
    });
    const height = t.animProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [t.source.height, t.dest.height],
    });

    return (
      <Animated.View
        key={t.id}
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            left,
            top,
            width,
            height,
            opacity: t.opacity,
            borderRadius: t.animProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ]}
      >
        <Image
          source={{ uri: imageForId(t.id) }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
    );
  });

  return (
    <SharedTransitionContext.Provider value={value}>
      {children}
      {overlays}
    </SharedTransitionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SharedTransition wrapper
// ---------------------------------------------------------------------------

interface SharedTransitionProps {
  id: string;
  children: ReactNode;
  style?: ViewStyle;
}

function SharedTransition({ id, children, style }: SharedTransitionProps) {
  const viewRef = useRef<View>(null);
  const { register, unregister } = useContext(SharedTransitionContext);

  const handleLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      register(id, viewRef);
      return () => unregister(id);
    },
    [id, register, unregister],
  );

  return (
    <View ref={viewRef} onLayout={handleLayout} style={style} collapsable={false}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Demo helpers
// ---------------------------------------------------------------------------

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const COLUMNS = 2;
const GAP = 12;
const THUMB_SIZE = (SCREEN_W - GAP * (COLUMNS + 1)) / COLUMNS;

interface ImageItem {
  id: number;
  uri: string;
}

const IMAGES: ImageItem[] = [
  { id: 1, uri: "https://picsum.photos/seed/st1/600/600" },
  { id: 2, uri: "https://picsum.photos/seed/st2/600/600" },
  { id: 3, uri: "https://picsum.photos/seed/st3/600/600" },
  { id: 4, uri: "https://picsum.photos/seed/st4/600/600" },
];

/** Resolve the image URI from a transition id like "image-1" */
function imageForId(transitionId: string): string {
  const numericId = Number(transitionId.replace("image-", ""));
  return IMAGES.find((i) => i.id === numericId)?.uri ?? IMAGES[0].uri;
}

// ---------------------------------------------------------------------------
// Grid view
// ---------------------------------------------------------------------------

function GridView({ onSelect }: { onSelect: (item: ImageItem) => void }) {
  return (
    <View style={styles.grid}>
      {IMAGES.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => onSelect(item)}
        >
          <SharedTransition id={`image-${item.id}`} style={styles.thumbWrapper}>
            <Image source={{ uri: item.uri }} style={styles.thumb} />
          </SharedTransition>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Detail view
// ---------------------------------------------------------------------------

function DetailView({
  item,
  onBack,
}: {
  item: ImageItem;
  onBack: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onBack());
  };

  return (
    <Animated.View style={[styles.detail, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: item.uri }}
        style={styles.detailImage}
        resizeMode="cover"
      />
      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>Photo #{item.id}</Text>
        <Text style={styles.detailDesc}>
          This is a full-screen detail view. The shared element transition
          animates the thumbnail from its grid position to the hero image above
          using measured coordinates and spring physics.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const { startTransition, reverseTransition } = useContext(SharedTransitionContext);

  const handleSelect = (item: ImageItem) => {
    const dest: Measurement = { x: 0, y: 0, width: SCREEN_W, height: SCREEN_W };
    startTransition(`image-${item.id}`, dest);
    setSelected(item);
  };

  const handleBack = () => {
    if (selected) {
      reverseTransition(`image-${selected.id}`);
    }
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {!selected ? (
        <>
          <Text style={styles.heading}>Shared Transitions</Text>
          <Text style={styles.subtitle}>Tap a photo to expand</Text>
          <GridView onSelect={handleSelect} />
        </>
      ) : (
        <DetailView item={selected} onBack={handleBack} />
      )}
    </View>
  );
}

// Wrap the default export so the provider is always present
const OriginalApp = App;
App = function WrappedApp() {
  return (
    <SharedTransitionProvider>
      <OriginalApp />
    </SharedTransitionProvider>
  );
};
export { App };

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
  },
  heading: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
    marginHorizontal: GAP,
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginHorizontal: GAP,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GAP,
    gap: GAP,
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 999,
  },
  detail: {
    flex: 1,
  },
  detailImage: {
    width: SCREEN_W,
    height: SCREEN_W,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  detailDesc: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 16,
    backgroundColor: "rgba(15,23,42,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
});
