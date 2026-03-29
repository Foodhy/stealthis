import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

function generateItems(count: number): { id: string; title: string; subtitle: string }[] {
  const topics = [
    "React Native performance tips",
    "Building offline-first apps",
    "State management patterns",
    "Animation best practices",
    "Navigation deep linking",
    "TypeScript generics guide",
    "Custom hook patterns",
    "Accessibility on mobile",
    "Testing strategies",
    "CI/CD for mobile apps",
    "Dark mode implementation",
    "Gesture handling techniques",
  ];
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((title, i) => ({
    id: `${Date.now()}-${i}`,
    title,
    subtitle: `Updated ${Math.floor(Math.random() * 59) + 1}m ago`,
  }));
}

export default function App() {
  const [items, setItems] = useState(() => generateItems(10));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setItems(generateItems(10));
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.headerHint}>Pull down to refresh</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#818cf8"
            colors={["#818cf8", "#34d399", "#f472b6"]}
            progressBackgroundColor="#1e293b"
            title="Refreshing..."
            titleColor="#94a3b8"
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardIndex}>
              <Text style={styles.cardIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  headerBar: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  headerHint: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
  },
  cardIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardIndexText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  separator: {
    height: 8,
  },
});
