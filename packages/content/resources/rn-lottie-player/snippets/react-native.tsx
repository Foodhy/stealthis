import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

/* ------------------------------------------------------------------ */
/*  LottiePlayer                                                       */
/* ------------------------------------------------------------------ */

interface LottiePlayerProps {
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
}

function LottiePlayer({
  autoPlay = true,
  loop: initialLoop = true,
  speed: initialSpeed = 1,
  style,
}: LottiePlayerProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loop, setLoop] = useState(initialLoop);
  const [speed, setSpeed] = useState(initialSpeed);
  const [progressValue, setProgressValue] = useState(0);

  const duration = 2000 / speed;

  /* Track progress for the scrubber UI */
  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      setProgressValue(value);
    });
    return () => progress.removeListener(id);
  }, [progress]);

  /* Start / stop animation */
  const startAnimation = useCallback(
    (fromValue?: number) => {
      animationRef.current?.stop();
      if (fromValue !== undefined) {
        progress.setValue(fromValue);
      }

      const timing = Animated.timing(progress, {
        toValue: 1,
        duration: duration * (1 - (fromValue ?? 0)),
        easing: Easing.linear,
        useNativeDriver: true,
      });

      if (loop) {
        animationRef.current = Animated.loop(
          Animated.timing(progress, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
      } else {
        animationRef.current = timing;
      }

      animationRef.current.start(({ finished }) => {
        if (finished && !loop) {
          setIsPlaying(false);
        }
      });
    },
    [progress, duration, loop]
  );

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startAnimation(progressValue < 1 ? progressValue : 0);
    } else {
      stopAnimation();
    }
    return () => stopAnimation();
  }, [isPlaying, speed, loop]);

  const togglePlay = () => {
    if (!isPlaying && progressValue >= 1) {
      progress.setValue(0);
    }
    setIsPlaying((p) => !p);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 2];
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  /* ---- Animated shapes ---- */

  /* Rotating square */
  const squareRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* Bouncing circle */
  const circleTranslateY = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -40, 0, -40, 0],
  });

  const circleScale = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.8, 1, 0.8, 1],
  });

  /* Pulsing star (simulated with a diamond shape) */
  const starScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1.3, 0.6],
  });

  const starRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const starOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  /* ---- Scrubber ---- */

  const scrubberPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        stopAnimation();
        setIsPlaying(false);
      },
      onPanResponderMove: (_, gestureState) => {
        const barWidth = SCREEN_WIDTH - 80;
        const newProgress = Math.min(1, Math.max(0, gestureState.moveX - 40) / barWidth);
        progress.setValue(newProgress);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={[styles.player, style]}>
      {/* Animation canvas */}
      <View style={styles.canvas}>
        {/* Rotating square */}
        <Animated.View style={[styles.square, { transform: [{ rotate: squareRotate }] }]} />

        {/* Bouncing circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ translateY: circleTranslateY }, { scale: circleScale }],
            },
          ]}
        />

        {/* Pulsing star (diamond) */}
        <Animated.View
          style={[
            styles.star,
            {
              opacity: starOpacity,
              transform: [{ scale: starScale }, { rotate: starRotate }],
            },
          ]}
        />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer} {...scrubberPan.panHandlers}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                transform: [
                  {
                    scaleX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.scrubber,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH - 80],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={togglePlay}>
          <Text style={styles.controlIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </Pressable>

        <Pressable style={styles.controlButton} onPress={cycleSpeed}>
          <Text style={styles.controlText}>{speed}x</Text>
        </Pressable>

        <Pressable
          style={[styles.controlButton, loop && styles.controlButtonActive]}
          onPress={() => setLoop((l) => !l)}
        >
          <Text style={[styles.controlText, loop && styles.controlTextActive]}>Loop</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lottie Player</Text>
      <Text style={styles.subtitle}>Simulated animation with full controls</Text>

      <LottiePlayer autoPlay loop speed={1} />
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 32,
  },
  player: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  canvas: {
    width: "100%",
    height: 220,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  square: {
    width: 50,
    height: 50,
    backgroundColor: "#6366f1",
    borderRadius: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b981",
  },
  star: {
    width: 50,
    height: 50,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    transform: [{ rotate: "45deg" }],
  },
  progressContainer: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 2,
    transformOrigin: "left",
  },
  scrubber: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    top: 7,
    left: -8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  controls: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#334155",
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "#6366f1",
  },
  controlIcon: {
    color: "#f8fafc",
    fontSize: 18,
  },
  controlText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  controlTextActive: {
    color: "#f8fafc",
  },
});
