import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────

interface DraggableListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (fromIndex: number, toIndex: number) => void;
  itemHeight: number;
}

// ─── DraggableList ───────────────────────────────────────────────────

function DraggableList<T>({ data, renderItem, onReorder, itemHeight }: DraggableListProps<T>) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dragY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentIndex = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Displacement animations for non-dragged items
  const displacements = useRef<Animated.Value[]>(data.map(() => new Animated.Value(0)));
  if (displacements.current.length !== data.length) {
    displacements.current = data.map(() => new Animated.Value(0));
  }

  const getHoverIndex = useCallback(
    (gestureY: number) => {
      const raw = Math.round((startY.current + gestureY) / itemHeight);
      return Math.max(0, Math.min(data.length - 1, raw));
    },
    [data.length, itemHeight]
  );

  const updateDisplacements = useCallback(
    (from: number, to: number) => {
      for (let i = 0; i < data.length; i++) {
        let targetY = 0;
        if (i !== from) {
          if (from < to && i > from && i <= to) {
            targetY = -itemHeight;
          } else if (from > to && i >= to && i < from) {
            targetY = itemHeight;
          }
        }
        Animated.spring(displacements.current[i], {
          toValue: targetY,
          useNativeDriver: true,
          tension: 300,
          friction: 25,
        }).start();
      }
    },
    [data.length, itemHeight]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => isDragging.current,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const y = evt.nativeEvent.pageY;
        // We'll compute the index from layout
        // For simplicity, use locationY relative to the list
        const locationY = evt.nativeEvent.locationY;
        const index = Math.floor(locationY / itemHeight);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

        currentIndex.current = clampedIndex;
        startY.current = clampedIndex * itemHeight;

        longPressTimer.current = setTimeout(() => {
          isDragging.current = true;
          setDraggingIndex(clampedIndex);
          setHoverIndex(clampedIndex);

          Animated.spring(scaleAnim, {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
          }).start();
        }, 500);
      },

      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (Math.abs(gestureState.dy) > 10 && !isDragging.current) {
          // Cancel long press if finger moves too much before activation
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
          return;
        }

        if (!isDragging.current) return;

        dragY.setValue(gestureState.dy);

        const newHover = getHoverIndex(gestureState.dy);
        if (newHover !== currentIndex.current) {
          setHoverIndex(newHover);
          updateDisplacements(currentIndex.current, newHover);
        }
      },

      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        if (!isDragging.current) return;

        isDragging.current = false;
        const from = currentIndex.current;
        const to = getHoverIndex(gestureState.dy);

        // Snap animation
        Animated.parallel([
          Animated.spring(dragY, {
            toValue: (to - from) * itemHeight,
            useNativeDriver: true,
            tension: 300,
            friction: 25,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
          }),
        ]).start(() => {
          // Reset all animations
          dragY.setValue(0);
          scaleAnim.setValue(1);
          displacements.current.forEach((d) => d.setValue(0));

          setDraggingIndex(null);
          setHoverIndex(null);

          if (from !== to) {
            onReorder(from, to);
          }
        });
      },

      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isDragging.current = false;
        dragY.setValue(0);
        scaleAnim.setValue(1);
        displacements.current.forEach((d) => d.setValue(0));
        setDraggingIndex(null);
        setHoverIndex(null);
      },
    })
  ).current;

  return (
    <View
      style={[styles.listContainer, { height: data.length * itemHeight }]}
      {...panResponder.panHandlers}
    >
      {data.map((item, index) => {
        const isDraggedItem = index === draggingIndex;

        const animatedStyle = isDraggedItem
          ? {
              transform: [{ translateY: dragY }, { scale: scaleAnim }],
              zIndex: 999,
              shadowColor: "#38bdf8",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
              opacity: 0.9,
            }
          : {
              transform: [{ translateY: displacements.current[index] || new Animated.Value(0) }],
              zIndex: 1,
            };

        return (
          <Animated.View
            key={index}
            style={[
              styles.itemWrapper,
              { top: index * itemHeight, height: itemHeight },
              animatedStyle,
            ]}
          >
            {renderItem(item, index)}
          </Animated.View>
        );
      })}
    </View>
  );
}

// ─── Demo App ────────────────────────────────────────────────────────

interface Task {
  id: number;
  title: string;
  priority: "low" | "med" | "high";
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Design system tokens", priority: "high" },
  { id: 2, title: "Set up CI pipeline", priority: "high" },
  { id: 3, title: "Write API endpoints", priority: "high" },
  { id: 4, title: "Implement auth flow", priority: "med" },
  { id: 5, title: "Create onboarding screens", priority: "med" },
  { id: 6, title: "Add push notifications", priority: "med" },
  { id: 7, title: "Write unit tests", priority: "low" },
  { id: 8, title: "Update documentation", priority: "low" },
];

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  high: "#ef4444",
  med: "#f59e0b",
  low: "#22c55e",
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const ITEM_HEIGHT = 72;

  const handleReorder = useCallback((from: number, to: number) => {
    setTasks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  return (
    <View style={styles.app}>
      <Text style={styles.title}>Task Priority</Text>
      <Text style={styles.subtitle}>Long-press and drag to reorder</Text>

      <DraggableList<Task>
        data={tasks}
        itemHeight={ITEM_HEIGHT}
        onReorder={handleReorder}
        renderItem={(task, index) => (
          <View style={styles.taskRow}>
            <Text style={styles.dragHandle}>≡</Text>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskMeta}>
                <View
                  style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
                />
                <Text style={styles.priorityLabel}>{task.priority}</Text>
              </View>
            </View>
            <Text style={styles.orderNumber}>{index + 1}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
    paddingHorizontal: 16,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  } as TextStyle,
  listContainer: {
    position: "relative",
  } as ViewStyle,
  itemWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingVertical: 4,
  } as ViewStyle,
  taskRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#334155",
  } as ViewStyle,
  dragHandle: {
    fontSize: 22,
    color: "#475569",
    marginRight: 12,
    fontWeight: "700",
  } as TextStyle,
  taskContent: {
    flex: 1,
  } as ViewStyle,
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 2,
  } as TextStyle,
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  } as ViewStyle,
  priorityLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  } as TextStyle,
  orderNumber: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  } as TextStyle,
});
