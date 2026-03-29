import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
}

async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleNotification(title: string, body: string, delaySeconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger:
      delaySeconds === 0
        ? null
        : { seconds: delaySeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
  });
}

function InboxItem({ item }: { item: NotificationLog }) {
  return (
    <View style={styles.inboxItem}>
      <View style={styles.inboxDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.inboxTitle}>{item.title}</Text>
        <Text style={styles.inboxBody}>{item.body}</Text>
        <Text style={styles.inboxTime}>{item.receivedAt}</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const receivedListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    requestPermissions().then(setHasPermission);

    receivedListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      setLogs((prev) => [
        {
          id: notification.request.identifier,
          title: title ?? "Notification",
          body: body ?? "",
          receivedAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body } = response.notification.request.content;
      setLogs((prev) => [
        {
          id: response.notification.request.identifier + "-tap",
          title: `[Tapped] ${title ?? "Notification"}`,
          body: body ?? "",
          receivedAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const buttons = [
    { label: "Send Now", delay: 0 },
    { label: "In 5 seconds", delay: 5 },
    { label: "In 10 seconds", delay: 10 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Push Notifications</Text>

      <Text style={styles.status}>
        Permission: {hasPermission === null ? "Checking..." : hasPermission ? "Granted" : "Denied"}
      </Text>

      <View style={styles.buttonRow}>
        {buttons.map((btn) => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() =>
              scheduleNotification(
                "Hello!",
                btn.delay === 0
                  ? "This is an immediate notification."
                  : `Scheduled ${btn.delay}s ago.`,
                btn.delay
              )
            }
          >
            <Text style={styles.buttonText}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Inbox {logs.length > 0 && `(${logs.length})`}</Text>

      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No notifications yet. Tap a button above to send one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InboxItem item={item} />}
          style={styles.inbox}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
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
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#4f46e5",
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 12,
  },
  inbox: {
    flex: 1,
  },
  inboxItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  inboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366f1",
    marginTop: 5,
  },
  inboxTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 2,
  },
  inboxBody: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
  },
  inboxTime: {
    fontSize: 11,
    color: "#64748b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
  },
});
