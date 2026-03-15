import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from "react-native";

// ---------- PullToRefreshList Component ----------

interface PullToRefreshListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  onRefresh: () => void;
  refreshing: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
  loading?: boolean;
  keyExtractor?: (item: T, index: number) => string;
}

function PullToRefreshList<T>({
  data,
  renderItem,
  onRefresh,
  refreshing,
  emptyMessage = "No items to display",
  ListHeaderComponent,
  loading = false,
  keyExtractor,
}: PullToRefreshListProps<T>) {
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#60a5fa" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={data.length === 0 ? styles.emptyList : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#60a5fa"
          titleColor="#94a3b8"
          colors={["#60a5fa", "#818cf8"]}
          progressBackgroundColor="#1e293b"
        />
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      ItemSeparatorComponent={renderSeparator}
    />
  );
}

// ---------- Demo App ----------

interface Contact {
  id: string;
  name: string;
  email: string;
}

const CONTACTS: Contact[] = [
  { id: "1", name: "Alice Johnson", email: "alice.johnson@email.com" },
  { id: "2", name: "Bob Martinez", email: "bob.martinez@email.com" },
  { id: "3", name: "Carol Chen", email: "carol.chen@email.com" },
  { id: "4", name: "David Kim", email: "david.kim@email.com" },
  { id: "5", name: "Eva Rossi", email: "eva.rossi@email.com" },
  { id: "6", name: "Frank Nguyen", email: "frank.nguyen@email.com" },
  { id: "7", name: "Grace Patel", email: "grace.patel@email.com" },
  { id: "8", name: "Henry Larsson", email: "henry.larsson@email.com" },
  { id: "9", name: "Irene Tanaka", email: "irene.tanaka@email.com" },
  { id: "10", name: "Jack O'Brien", email: "jack.obrien@email.com" },
  { id: "11", name: "Karen Schmidt", email: "karen.schmidt@email.com" },
  { id: "12", name: "Leo Fernandez", email: "leo.fernandez@email.com" },
  { id: "13", name: "Mia Andersson", email: "mia.andersson@email.com" },
  { id: "14", name: "Noah Williams", email: "noah.williams@email.com" },
  { id: "15", name: "Olivia Brown", email: "olivia.brown@email.com" },
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e",
  "#a855f7", "#6366f1", "#0ea5e9", "#84cc16", "#d946ef",
];

const renderContact: ListRenderItem<Contact> = ({ item, index }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <View style={styles.contactRow}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactEmail}>{item.email}</Text>
      </View>
    </View>
  );
};

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setContacts((prev) => shuffle(prev));
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <PullToRefreshList
        data={contacts}
        renderItem={renderContact}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        keyExtractor={(item) => item.id}
        emptyMessage="No contacts found"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contacts</Text>
            <Text style={styles.headerSubtitle}>
              Pull down to refresh ({contacts.length})
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: "#1e293b",
    marginLeft: 72,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  contactInfo: {
    marginLeft: 14,
    flex: 1,
  },
  contactName: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  contactEmail: {
    color: "#64748b",
    fontSize: 13,
  },
});
