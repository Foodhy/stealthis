import React, { useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AccordionItemData {
  title: string;
  content: string;
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const hasOpened = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) {
      contentHeight.current = h;
      if (!hasOpened.current && isOpen) {
        animatedHeight.setValue(h);
        chevronRotation.setValue(1);
        hasOpened.current = true;
      }
    }
  };

  const toggle = () => {
    onToggle();
    const toOpen = !isOpen;
    hasOpened.current = true;

    Animated.spring(animatedHeight, {
      toValue: toOpen ? contentHeight.current : 0,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();

    Animated.spring(chevronRotation, {
      toValue: toOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const rotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.itemHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Animated.Text style={[styles.chevron, { transform: [{ rotate }] }]}>▼</Animated.Text>
      </TouchableOpacity>

      <Animated.View style={[styles.panelClip, { height: animatedHeight }]}>
        <View onLayout={onLayout} style={styles.panelContent}>
          <Text style={styles.contentText}>{item.content}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const FAQ_ITEMS: AccordionItemData[] = [
  {
    title: "What is React Native?",
    content:
      "React Native is a framework for building native mobile applications using JavaScript and React. It lets you compose a rich mobile UI from declarative components, and renders directly to native platform views — no WebView involved.",
  },
  {
    title: "How does the Animated API work?",
    content:
      "The Animated API provides a set of value types (Animated.Value) and animation drivers (spring, timing, decay) that operate on those values. You bind animated values to style props, and the framework efficiently updates the native views without going through the React reconciler on every frame.",
  },
  {
    title: "Can I use this on both iOS and Android?",
    content:
      "Yes. React Native targets both iOS and Android from a single codebase. Platform-specific code can be isolated using Platform.select() or file extensions like .ios.tsx and .android.tsx when needed.",
  },
  {
    title: "What about performance?",
    content:
      "React Native uses the native driver (useNativeDriver: true) to offload animations to the UI thread, keeping the JS thread free. For layout animations (like height changes), the JS-driven approach is used, which is still performant for most use cases.",
  },
];

export default function App() {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FAQ</Text>
      <Text style={styles.subheader}>Tap a question to expand</Text>

      <View style={styles.list}>
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndices.has(index)}
            onToggle={() => toggleIndex(index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  subheader: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  list: {
    gap: 8,
  },
  item: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    overflow: "hidden",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  chevron: {
    color: "#818cf8",
    fontSize: 12,
  },
  panelClip: {
    overflow: "hidden",
  },
  panelContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
  },
});
