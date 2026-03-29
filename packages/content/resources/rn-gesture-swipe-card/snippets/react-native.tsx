import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 300;
const MAX_VISIBLE_CARDS = 3;
const CARD_SCALE_STEP = 0.05;
const CARD_VERTICAL_OFFSET = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwipeCardStackProps<T> {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
  onSwipeLeft?: (item: T) => void;
  onSwipeRight?: (item: T) => void;
  onEmpty?: () => void;
}

// ---------------------------------------------------------------------------
// SwipeCardStack
// ---------------------------------------------------------------------------

function SwipeCardStack<T>({
  data,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  onEmpty,
}: SwipeCardStackProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(1 - CARD_SCALE_STEP)).current;

  // Derived animated values
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const animateSwipeOut = useCallback(
    (direction: "left" | "right") => {
      const toX = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

      Animated.parallel([
        Animated.spring(position, {
          toValue: { x: toX, y: 0 },
          useNativeDriver: true,
          speed: 20,
          bounciness: 2,
        }),
        Animated.spring(nextCardScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 6,
        }),
      ]).start(() => {
        const swipedItem = data[currentIndex];
        if (direction === "right") {
          onSwipeRight?.(swipedItem);
        } else {
          onSwipeLeft?.(swipedItem);
        }

        const nextIndex = currentIndex + 1;
        position.setValue({ x: 0, y: 0 });
        nextCardScale.setValue(1 - CARD_SCALE_STEP);
        setCurrentIndex(nextIndex);

        if (nextIndex >= data.length) {
          onEmpty?.();
        }
      });
    },
    [currentIndex, data, onSwipeLeft, onSwipeRight, onEmpty, position, nextCardScale],
  );

  const springBack = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.4 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateSwipeOut("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateSwipeOut("left");
        } else {
          springBack();
        }
      },
    }),
  ).current;

  const handleButtonSwipe = useCallback(
    (direction: "left" | "right") => {
      if (currentIndex >= data.length) return;
      animateSwipeOut(direction);
    },
    [currentIndex, data.length, animateSwipeOut],
  );

  // Render empty state
  if (currentIndex >= data.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more cards!</Text>
      </View>
    );
  }

  // Render visible cards (bottom-up so top card renders last)
  const visibleCards = data
    .slice(currentIndex, currentIndex + MAX_VISIBLE_CARDS)
    .map((item, i) => {
      const isTopCard = i === 0;

      if (isTopCard) {
        const animatedStyle = {
          transform: [
            ...position.getTranslateTransform(),
            { rotate },
          ],
        };

        return (
          <Animated.View
            key={`card-${currentIndex}`}
            style={[styles.card, animatedStyle, { zIndex: MAX_VISIBLE_CARDS }]}
            {...panResponder.panHandlers}
          >
            {renderCard(item)}

            {/* LIKE overlay */}
            <Animated.View
              style={[
                styles.overlay,
                styles.likeOverlay,
                { opacity: likeOpacity },
              ]}
            >
              <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
            </Animated.View>

            {/* NOPE overlay */}
            <Animated.View
              style={[
                styles.overlay,
                styles.nopeOverlay,
                { opacity: nopeOpacity },
              ]}
            >
              <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
            </Animated.View>
          </Animated.View>
        );
      }

      // Background cards
      const scale = i === 1 ? nextCardScale : 1 - CARD_SCALE_STEP * i;
      const translateY = CARD_VERTICAL_OFFSET * i;

      return (
        <Animated.View
          key={`card-${currentIndex + i}`}
          style={[
            styles.card,
            {
              zIndex: MAX_VISIBLE_CARDS - i,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          {renderCard(item)}
        </Animated.View>
      );
    })
    .reverse();

  return (
    <View style={styles.stackContainer}>
      <View style={styles.cardArea}>{visibleCards}</View>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.nopeButton]}
          onPress={() => handleButtonSwipe("left")}
          activeOpacity={0.8}
        >
          <Text style={styles.nopeButtonText}>NOPE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleButtonSwipe("right")}
          activeOpacity={0.8}
        >
          <Text style={styles.likeButtonText}>LIKE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Demo App
// ---------------------------------------------------------------------------

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
}

const PROFILES: Profile[] = [
  {
    id: 1,
    name: "Alex",
    age: 28,
    bio: "Loves hiking, coffee, and spontaneous road trips.",
    image: "https://picsum.photos/seed/alex/400/500",
  },
  {
    id: 2,
    name: "Jordan",
    age: 24,
    bio: "Music producer by day, cat parent by night.",
    image: "https://picsum.photos/seed/jordan/400/500",
  },
  {
    id: 3,
    name: "Morgan",
    age: 31,
    bio: "Bookworm and amateur chef. Let's swap recipes!",
    image: "https://picsum.photos/seed/morgan/400/500",
  },
  {
    id: 4,
    name: "Taylor",
    age: 26,
    bio: "Yoga instructor who also writes terrible poetry.",
    image: "https://picsum.photos/seed/taylor/400/500",
  },
  {
    id: 5,
    name: "Casey",
    age: 29,
    bio: "Software engineer. Fluent in TypeScript and sarcasm.",
    image: "https://picsum.photos/seed/casey/400/500",
  },
];

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <View style={profileStyles.container}>
      <Image source={{ uri: profile.image }} style={profileStyles.image} />
      <View style={profileStyles.info}>
        <Text style={profileStyles.name}>
          {profile.name}, {profile.age}
        </Text>
        <Text style={profileStyles.bio}>{profile.bio}</Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <View style={appStyles.container}>
      <Text style={appStyles.title}>Discover</Text>
      <SwipeCardStack
        data={PROFILES}
        renderCard={(item) => <ProfileCard profile={item} />}
        onSwipeLeft={(item) => console.log("Nope:", item.name)}
        onSwipeRight={(item) => console.log("Like:", item.name)}
        onEmpty={() => console.log("No more profiles!")}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  stackContainer: {
    flex: 1,
    alignItems: "center",
  },
  cardArea: {
    flex: 1,
    width: SCREEN_WIDTH - 40,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.55,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  overlay: {
    position: "absolute",
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeOverlay: {
    left: 24,
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  nopeOverlay: {
    right: 24,
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  overlayText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2,
  },
  likeText: {
    color: "#22c55e",
  },
  nopeText: {
    color: "#ef4444",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 32,
    paddingBottom: 40,
    paddingTop: 16,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  nopeButton: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  likeButton: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  nopeButtonText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  likeButtonText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 20,
    fontWeight: "600",
  },
});

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "70%",
    resizeMode: "cover",
  },
  info: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  name: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  bio: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },
});

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
});
