import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, Text, View } from "react-native";

// ---------------------------------------------------------------------------
// InfiniteList — generic infinite scroll component
// ---------------------------------------------------------------------------

interface InfiniteListProps<T> {
  fetchPage: (page: number) => Promise<T[]>;
  renderItem: ListRenderItem<T>;
  pageSize?: number;
  keyExtractor?: (item: T, index: number) => string;
}

function InfiniteList<T>({
  fetchPage,
  renderItem,
  pageSize = 10,
  keyExtractor,
}: InfiniteListProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const nextPage = pageRef.current + 1;
      const items = await fetchPage(nextPage);

      pageRef.current = nextPage;
      setData((prev) => [...prev, ...items]);

      if (items.length < pageSize) {
        setHasMore(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchPage, hasMore, pageSize]);

  useEffect(() => {
    loadMore();
  }, []);

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#818cf8" />
        </View>
      );
    }

    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.endText}>No more items</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.listContent}
    />
  );
}

// ---------------------------------------------------------------------------
// Demo App
// ---------------------------------------------------------------------------

interface CardItem {
  id: string;
  title: string;
  description: string;
}

const simulatedApi = async (page: number): Promise<CardItem[]> => {
  await new Promise((r) => setTimeout(r, 1200));

  const totalItems = 50;
  const perPage = 10;
  const start = (page - 1) * perPage;

  if (start >= totalItems) return [];

  const count = Math.min(perPage, totalItems - start);

  return Array.from({ length: count }, (_, i) => {
    const idx = start + i + 1;
    return {
      id: String(idx),
      title: `Item ${idx}`,
      description: `This is the description for item number ${idx}. Scroll down to load more.`,
    };
  });
};

const renderCard: ListRenderItem<CardItem> = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardDescription}>{item.description}</Text>
  </View>
);

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Infinite Scroll</Text>
      <InfiniteList<CardItem>
        fetchPage={simulatedApi}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        pageSize={10}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
  },
  heading: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  endText: {
    color: "#64748b",
    fontSize: 14,
  },
});
