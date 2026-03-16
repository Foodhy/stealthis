import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH - 40;
const SLIDE_MARGIN = 20;

interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
}

function Carousel<T>({ data, renderItem, autoPlay = false, interval = 3000 }: CarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToIndex = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    },
    []
  );

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % data.length;
        scrollToIndex(next);
        return next;
      });
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, interval, data.length, scrollToIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.slide}>
            {renderItem(item, index)}
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setActiveIndex(index);
              scrollToIndex(index);
            }}
          >
            <View
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface SlideData {
  id: number;
  imageUri: string;
  title: string;
}

const SLIDES: SlideData[] = [
  { id: 1, imageUri: "https://picsum.photos/seed/slide1/600/400", title: "Mountain Vista" },
  { id: 2, imageUri: "https://picsum.photos/seed/slide2/600/400", title: "Ocean Breeze" },
  { id: 3, imageUri: "https://picsum.photos/seed/slide3/600/400", title: "Forest Trail" },
  { id: 4, imageUri: "https://picsum.photos/seed/slide4/600/400", title: "Desert Dunes" },
  { id: 5, imageUri: "https://picsum.photos/seed/slide5/600/400", title: "City Lights" },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover</Text>
      <Text style={styles.subheader}>Swipe through featured destinations</Text>

      <Carousel
        data={SLIDES}
        autoPlay
        interval={4000}
        renderItem={(item) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
  },
  header: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 20,
  },
  subheader: {
    color: "#64748b",
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 4,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SLIDE_MARGIN,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1e293b",
  },
  image: {
    width: SLIDE_WIDTH,
    height: 240,
  },
  cardOverlay: {
    padding: 16,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
  },
  dotActive: {
    backgroundColor: "#818cf8",
    width: 24,
  },
});
