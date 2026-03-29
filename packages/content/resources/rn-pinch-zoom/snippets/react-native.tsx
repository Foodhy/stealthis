import React, { useRef, useCallback } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* ------------------------------------------------------------------ */
/*  Utility: Euclidean distance between two touches                    */
/* ------------------------------------------------------------------ */
function getDistance(touches: { pageX: number; pageY: number }[]): number {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCenter(touches: { pageX: number; pageY: number }[]): { x: number; y: number } {
  return {
    x: (touches[0].pageX + touches[1].pageX) / 2,
    y: (touches[0].pageY + touches[1].pageY) / 2,
  };
}

/* ------------------------------------------------------------------ */
/*  PinchZoomView                                                      */
/* ------------------------------------------------------------------ */
interface PinchZoomViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
}

function PinchZoomView({
  children,
  minScale = 1,
  maxScale = 4,
  doubleTapScale = 2,
}: PinchZoomViewProps) {
  /* ---------- animated values ---------- */
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  /* ---------- mutable refs ---------- */
  const baseScale = useRef(1);
  const currentScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialDistance = useRef(0);
  const isPinching = useRef(false);
  const lastTapTime = useRef(0);
  const layoutSize = useRef({ width: SCREEN_W, height: SCREEN_H });

  /* ---------- clamp helpers ---------- */
  const clampScale = useCallback(
    (s: number) => Math.min(maxScale, Math.max(minScale, s)),
    [minScale, maxScale]
  );

  const clampTranslation = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const { width, height } = layoutSize.current;
    const maxTx = ((s - 1) * width) / 2;
    const maxTy = ((s - 1) * height) / 2;
    return {
      x: Math.min(maxTx, Math.max(-maxTx, tx)),
      y: Math.min(maxTy, Math.max(-maxTy, ty)),
    };
  }, []);

  /* ---------- spring to valid bounds ---------- */
  const springToBounds = useCallback(() => {
    const clamped = clampScale(currentScale.current);
    const { x, y } = clampTranslation(lastTranslateX.current, lastTranslateY.current, clamped);

    currentScale.current = clamped;
    baseScale.current = clamped;
    lastTranslateX.current = x;
    lastTranslateY.current = y;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: clamped,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(translateX, {
        toValue: x,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(translateY, {
        toValue: y,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
    ]).start();
  }, [scale, translateX, translateY, clampScale, clampTranslation]);

  /* ---------- double-tap handler ---------- */
  const handleDoubleTap = useCallback(() => {
    const target = currentScale.current > 1 ? minScale : doubleTapScale;

    currentScale.current = target;
    baseScale.current = target;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: target,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
    ]).start();
  }, [scale, translateX, translateY, minScale, doubleTapScale]);

  /* ---------- PanResponder ---------- */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      /* --- gesture start --- */
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;

        // Double-tap detection
        if (touches.length === 1) {
          const now = Date.now();
          if (now - lastTapTime.current < 300) {
            handleDoubleTap();
            lastTapTime.current = 0;
            return;
          }
          lastTapTime.current = now;
        }

        if (touches.length === 2) {
          isPinching.current = true;
          initialDistance.current = getDistance(touches);
          baseScale.current = currentScale.current;
        }
      },

      /* --- gesture move --- */
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;

        // Pinch (two fingers)
        if (touches.length === 2) {
          isPinching.current = true;
          if (initialDistance.current === 0) {
            initialDistance.current = getDistance(touches);
            baseScale.current = currentScale.current;
            return;
          }

          const dist = getDistance(touches);
          const ratio = dist / initialDistance.current;
          const newScale = baseScale.current * ratio;

          // Allow slight over-zoom for rubber-band feel, clamp on release
          const softClamped = Math.min(maxScale * 1.5, Math.max(minScale * 0.8, newScale));
          currentScale.current = softClamped;
          scale.setValue(softClamped);
          return;
        }

        // Pan (single finger, only when zoomed in)
        if (touches.length === 1 && !isPinching.current && currentScale.current > 1) {
          const { pageX, pageY } = touches[0];
          // PanResponder dx/dy are cumulative, but we track manually for
          // more control when transitioning between pinch and pan.
          // We use the raw move events relative to stored last position.
          const dx = evt.nativeEvent.pageX - (panStartX.current ?? evt.nativeEvent.pageX);
          const dy = evt.nativeEvent.pageY - (panStartY.current ?? evt.nativeEvent.pageY);

          const newTx = panBaseX.current + dx;
          const newTy = panBaseY.current + dy;

          lastTranslateX.current = newTx;
          lastTranslateY.current = newTy;
          translateX.setValue(newTx);
          translateY.setValue(newTy);
        }
      },

      /* --- gesture end --- */
      onPanResponderRelease: () => {
        isPinching.current = false;
        initialDistance.current = 0;
        panStartX.current = null;
        panStartY.current = null;
        springToBounds();
      },

      onPanResponderTerminate: () => {
        isPinching.current = false;
        initialDistance.current = 0;
        panStartX.current = null;
        panStartY.current = null;
        springToBounds();
      },
    })
  ).current;

  /* We need separate refs to track the starting point of a pan gesture */
  const panStartX = useRef<number | null>(null);
  const panStartY = useRef<number | null>(null);
  const panBaseX = useRef(0);
  const panBaseY = useRef(0);

  /* Override the grant to capture pan start position */
  const originalGrant = panResponder.panHandlers.onResponderGrant;
  panResponder.panHandlers.onResponderGrant = (evt: any) => {
    if (evt.nativeEvent.touches.length === 1) {
      panStartX.current = evt.nativeEvent.pageX;
      panStartY.current = evt.nativeEvent.pageY;
      panBaseX.current = lastTranslateX.current;
      panBaseY.current = lastTranslateY.current;
    }
    originalGrant?.(evt);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    layoutSize.current = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
  };

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }, { translateY }, { scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Pinch to Zoom</Text>
        <Text style={styles.subtitle}>
          Pinch to scale {"\u00B7"} drag to pan {"\u00B7"} double-tap to toggle zoom
        </Text>
      </View>

      <PinchZoomView minScale={1} maxScale={4} doubleTapScale={2}>
        <Image
          source={{ uri: "https://picsum.photos/1200/900" }}
          style={styles.image}
          resizeMode="contain"
        />
      </PinchZoomView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
  },
});
