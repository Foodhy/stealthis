import React, { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 40;

interface SwipeEmail {
  id: string;
  sender: string;
  subject: string;
  preview: string;
}

function SwipeableItem({
  item,
  onDelete,
  onArchive,
  onStar,
}: {
  item: SwipeEmail;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onStar: (id: string) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const snapTo = (value: number) => {
    lastOffset.current = value;
    Animated.spring(translateX, {
      toValue: value,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        gs: PanResponderGestureState
      ) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        const newX = lastOffset.current + gs.dx;
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        const newX = lastOffset.current + gs.dx;
        if (newX < -SWIPE_THRESHOLD) {
          snapTo(-ACTION_WIDTH * 2);
        } else if (newX > SWIPE_THRESHOLD) {
          snapTo(ACTION_WIDTH);
        } else {
          snapTo(0);
        }
      },
    })
  ).current;

  return (
    <View style={styles.itemContainer}>
      {/* Left action (star) */}
      <View style={[styles.actionBehind, styles.leftAction]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#f59e0b" }]}
          onPress={() => {
            snapTo(0);
            onStar(item.id);
          }}
        >
          <Text style={styles.actionText}>★ Star</Text>
        </TouchableOpacity>
      </View>

      {/* Right actions (archive + delete) */}
      <View style={[styles.actionBehind, styles.rightActions]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#3b82f6" }]}
          onPress={() => {
            snapTo(0);
            onArchive(item.id);
          }}
        >
          <Text style={styles.actionText}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={[styles.itemContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.sender}>{item.sender}</Text>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {item.preview}
        </Text>
      </Animated.View>
    </View>
  );
}

const EMAILS: SwipeEmail[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    subject: "Q2 design review",
    preview: "Hey team, please review the attached mockups before Friday...",
  },
  {
    id: "2",
    sender: "GitHub",
    subject: "[stealthis] PR #42 merged",
    preview: "Your pull request has been merged into main.",
  },
  {
    id: "3",
    sender: "Alex Rivera",
    subject: "Lunch tomorrow?",
    preview: "Want to grab sushi at that new place downtown?",
  },
  {
    id: "4",
    sender: "Stripe",
    subject: "Your invoice is ready",
    preview: "Invoice #INV-2026-0315 for $49.00 is available.",
  },
  {
    id: "5",
    sender: "Jamie Park",
    subject: "Re: conference talk",
    preview: "I think we should focus on the animation section more...",
  },
];

export default function App() {
  const [emails, setEmails] = useState(EMAILS);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>
      <Text style={styles.hint}>← Swipe left for actions · Swipe right →</Text>
      {emails.map((email) => (
        <SwipeableItem
          key={email.id}
          item={email}
          onDelete={(id) => setEmails((prev) => prev.filter((e) => e.id !== id))}
          onArchive={(id) => setEmails((prev) => prev.filter((e) => e.id !== id))}
          onStar={() => {}}
        />
      ))}
      {emails.length === 0 && (
        <Text style={styles.empty}>All clear!</Text>
      )}
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
    marginBottom: 4,
  },
  hint: {
    color: "#64748b",
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  empty: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  itemContainer: {
    height: 88,
    marginBottom: 1,
    overflow: "hidden",
  },
  actionBehind: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  leftAction: {
    justifyContent: "flex-start",
  },
  rightActions: {
    justifyContent: "flex-end",
  },
  actionBtn: {
    width: ACTION_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  itemContent: {
    backgroundColor: "#1e293b",
    height: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sender: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  subject: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 2,
  },
  preview: {
    color: "#64748b",
    fontSize: 13,
  },
});
