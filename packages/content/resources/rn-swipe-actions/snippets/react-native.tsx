import React, { useRef } from "react";
import {
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type PanResponderGestureState,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SwipeAction {
  label: string;
  color: string;
  icon?: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onFullSwipeLeft?: () => void;
  onFullSwipeRight?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACTION_WIDTH = 72;
const FULL_SWIPE_RATIO = 0.6;

/* ------------------------------------------------------------------ */
/*  SwipeableRow                                                       */
/* ------------------------------------------------------------------ */

function SwipeableRow({
  children,
  leftActions = [],
  rightActions = [],
  onFullSwipeLeft,
  onFullSwipeRight,
}: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidth = useRef(0);

  const leftCount = leftActions.length;
  const rightCount = rightActions.length;
  const leftThreshold = leftCount * ACTION_WIDTH;
  const rightThreshold = rightCount * ACTION_WIDTH;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e: GestureResponderEvent, gs: PanResponderGestureState) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),

      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        // Clamp: only allow left swipe if rightActions exist, right if leftActions
        let dx = gs.dx;
        if (dx < 0 && rightCount === 0) dx = 0;
        if (dx > 0 && leftCount === 0) dx = 0;
        translateX.setValue(dx);
      },

      onPanResponderRelease: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const width = rowWidth.current || 375;
        const fullSwipeDist = width * FULL_SWIPE_RATIO;

        // Full swipe left
        if (gs.dx < -fullSwipeDist && onFullSwipeLeft) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onFullSwipeLeft();
            translateX.setValue(0);
          });
          return;
        }

        // Full swipe right
        if (gs.dx > fullSwipeDist && onFullSwipeRight) {
          Animated.timing(translateX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onFullSwipeRight();
            translateX.setValue(0);
          });
          return;
        }

        // Partial swipe — snap to action tray or spring back
        let toValue = 0;
        if (gs.dx < -rightThreshold * 0.4 && rightCount > 0) {
          toValue = -rightThreshold;
        } else if (gs.dx > leftThreshold * 0.4 && leftCount > 0) {
          toValue = leftThreshold;
        }

        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          tension: 60,
          friction: 9,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 9,
        }).start();
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    rowWidth.current = e.nativeEvent.layout.width;
  };

  /* -- Render action buttons behind the row -- */

  const renderActions = (actions: SwipeAction[], side: "left" | "right") =>
    actions.map((action, index) => {
      const position = index * ACTION_WIDTH;

      // Progressive reveal: scale based on how far the user has swiped
      const threshold = (index + 1) * ACTION_WIDTH;
      const inputRange =
        side === "right"
          ? [-(threshold + 20), -threshold * 0.5, 0]
          : [0, threshold * 0.5, threshold + 20];
      const scale = translateX.interpolate({
        inputRange,
        outputRange: side === "right" ? [1, 0.6, 0.4] : [0.4, 0.6, 1],
        extrapolate: "clamp",
      });
      const opacity = translateX.interpolate({
        inputRange,
        outputRange: side === "right" ? [1, 0.5, 0] : [0, 0.5, 1],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          key={action.label}
          style={[
            styles.actionButton,
            {
              backgroundColor: action.color,
              width: ACTION_WIDTH,
              [side]: position,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 60,
                friction: 9,
              }).start();
              action.onPress();
            }}
          >
            {action.icon ? <Text style={styles.actionIcon}>{action.icon}</Text> : null}
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    });

  return (
    <View style={styles.rowContainer} onLayout={onLayout}>
      {/* Left actions (revealed on swipe right) */}
      <View style={styles.actionsContainer}>{renderActions(leftActions, "left")}</View>
      {/* Right actions (revealed on swipe left) */}
      <View style={styles.actionsContainer}>{renderActions(rightActions, "right")}</View>

      {/* Foreground row */}
      <Animated.View
        style={[styles.rowForeground, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
}

const EMAILS: Email[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i),
  sender: [
    "Alice Chen",
    "Bob Martinez",
    "Carol Nguyen",
    "Dave Park",
    "Eve Johnson",
    "Frank Lee",
    "Grace Kim",
    "Hank Patel",
    "Iris Wang",
    "Jake Thomas",
  ][i],
  subject: [
    "Sprint planning tomorrow",
    "Design review feedback",
    "API docs updated",
    "Bug report #4521",
    "Quarterly results",
    "Team lunch Friday",
    "Deployment checklist",
    "New hire onboarding",
    "Security audit results",
    "Conference tickets",
  ][i],
  preview: [
    "Let's sync on priorities for next week's sprint...",
    "I've left some comments on the Figma file...",
    "The new endpoints are documented at /v2/...",
    "Steps to reproduce: open the settings panel...",
    "Revenue is up 12% compared to last quarter...",
    "How about that new ramen place downtown?...",
    "Make sure staging passes all integration tests...",
    "Please review the onboarding doc by Thursday...",
    "No critical vulnerabilities found this cycle...",
    "Early bird pricing ends this Friday...",
  ][i],
  time: [
    "9:41 AM",
    "9:12 AM",
    "8:30 AM",
    "Yesterday",
    "Yesterday",
    "Mon",
    "Mon",
    "Sun",
    "Sat",
    "Fri",
  ][i],
  starred: i === 2 || i === 4,
}));

function EmailRow({ item }: { item: Email }) {
  return (
    <View style={styles.emailRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.sender
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Text>
      </View>
      <View style={styles.emailContent}>
        <View style={styles.emailHeader}>
          <Text style={styles.sender} numberOfLines={1}>
            {item.sender}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {item.subject}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {item.preview}
        </Text>
      </View>
      {item.starred && <Text style={styles.starIndicator}>★</Text>}
    </View>
  );
}

export default function App() {
  const [emails, setEmails] = React.useState(EMAILS);

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const handleArchive = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  const handleStar = (id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  };

  const renderItem = ({ item }: { item: Email }) => (
    <SwipeableRow
      rightActions={[
        {
          label: "Archive",
          color: "#3b82f6",
          icon: "📦",
          onPress: () => handleArchive(item.id),
        },
        {
          label: "Delete",
          color: "#ef4444",
          icon: "🗑",
          onPress: () => handleDelete(item.id),
        },
      ]}
      leftActions={[
        {
          label: item.starred ? "Unstar" : "Star",
          color: "#22c55e",
          icon: "⭐",
          onPress: () => handleStar(item.id),
        },
      ]}
      onFullSwipeLeft={() => handleDelete(item.id)}
      onFullSwipeRight={() => handleStar(item.id)}
    >
      <EmailRow item={item} />
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <Text style={styles.headerCount}>{emails.length} messages</Text>
      </View>
      <FlatList
        data={emails}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  /* -- SwipeableRow -- */
  rowContainer: {
    overflow: "hidden",
    position: "relative",
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  actionButton: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  rowForeground: {
    backgroundColor: "#1e293b",
  },

  /* -- Demo app -- */
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  headerCount: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 76,
  },

  /* -- Email row -- */
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(99,102,241,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sender: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: "#64748b",
    fontSize: 12,
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
  starIndicator: {
    color: "#facc15",
    fontSize: 14,
    marginLeft: 8,
  },
});
