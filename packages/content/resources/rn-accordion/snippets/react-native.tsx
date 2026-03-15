import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface AccordionCtx {
  allowMultiple: boolean;
  openIndex: number | null;
  register: (index: number, isDefault: boolean) => void;
  toggle: (index: number) => void;
}

const AccordionContext = createContext<AccordionCtx>({
  allowMultiple: false,
  openIndex: null,
  register: () => {},
  toggle: () => {},
});

/* ------------------------------------------------------------------ */
/*  AccordionItem                                                      */
/* ------------------------------------------------------------------ */

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  index?: number; // injected by Accordion
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
  index = 0,
}: AccordionItemProps) {
  const { allowMultiple, openIndex, toggle, register } =
    useContext(AccordionContext);

  const [contentHeight, setContentHeight] = useState(0);
  const animValue = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const registered = useRef(false);

  /* Register default-open state once */
  useEffect(() => {
    if (!registered.current) {
      registered.current = true;
      register(index, defaultOpen);
    }
  }, []);

  const isOpen = allowMultiple
    ? /* in multi-mode each item tracks itself via animValue */
      undefined
    : openIndex === index;

  /* For single-expand mode, sync animation to context */
  useEffect(() => {
    if (!allowMultiple) {
      Animated.timing(animValue, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isOpen, allowMultiple]);

  /* Local toggle for multi-expand */
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const handlePress = () => {
    if (allowMultiple) {
      const next = !localOpen;
      setLocalOpen(next);
      Animated.timing(animValue, {
        toValue: next ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      toggle(index);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setContentHeight(h);
  };

  const heightAnim = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const rotateAnim = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={styles.item}>
      {/* Header */}
      <Pressable onPress={handlePress} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: rotateAnim }] }]}
        >
          ▶
        </Animated.Text>
      </Pressable>

      {/* Animated body */}
      <Animated.View style={{ height: heightAnim, overflow: "hidden" }}>
        <View style={styles.body} onLayout={onLayout}>
          {children}
        </View>
      </Animated.View>

      {/* Separator */}
      <View style={styles.separator} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Accordion                                                          */
/* ------------------------------------------------------------------ */

interface AccordionProps {
  allowMultiple?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

function Accordion({
  allowMultiple = false,
  children,
  style,
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const register = useCallback(
    (index: number, isDefault: boolean) => {
      if (isDefault && !allowMultiple) {
        setOpenIndex(index);
      }
    },
    [allowMultiple],
  );

  const toggle = useCallback(
    (index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  const ctx: AccordionCtx = {
    allowMultiple,
    openIndex,
    register,
    toggle,
  };

  /* Inject index prop into each AccordionItem */
  const items = React.Children.map(children, (child, i) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { index: i });
    }
    return child;
  });

  return (
    <AccordionContext.Provider value={ctx}>
      <View style={style}>{items}</View>
    </AccordionContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: "What is React Native?",
    a: "React Native is an open-source framework created by Meta that lets you build mobile applications for iOS and Android using JavaScript and React.",
  },
  {
    q: "How does the Animated API work?",
    a: "The Animated API provides a set of composable animations driven by declarative values. You link an Animated.Value to component styles and call timing, spring, or decay to animate it.",
  },
  {
    q: "Can I use this accordion with Expo?",
    a: "Yes — this component only depends on core react-native APIs and works out of the box with Expo managed and bare workflows.",
  },
  {
    q: "Is multi-expand supported?",
    a: "Absolutely. Pass allowMultiple to the Accordion wrapper and users can open as many items as they like simultaneously.",
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Accordion allowMultiple={false}>
        {FAQ.map((item, i) => (
          <AccordionItem
            key={item.q}
            title={item.q}
            defaultOpen={i === 1}
          >
            <Text style={styles.answer}>{item.a}</Text>
          </AccordionItem>
        ))}
      </Accordion>
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
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  item: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
  },
  chevron: {
    color: "#94a3b8",
    fontSize: 14,
  },
  body: {
    position: "absolute",
    width: "100%",
  },
  answer: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    paddingBottom: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#334155",
  },
});
