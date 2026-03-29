import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  type ViewStyle,
  type TextStyle,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────

interface SearchableListProps<T extends Record<string, unknown>> {
  data: T[];
  searchKeys: (keyof T & string)[];
  renderItem: (item: T, highlightText: (text: string) => React.ReactNode) => React.ReactNode;
  placeholder?: string;
}

// ─── Highlight helper ────────────────────────────────────────────────

function buildHighlight(query: string) {
  return function highlightText(text: string): React.ReactNode {
    if (!query) return <Text>{text}</Text>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <Text>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text key={i} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };
}

// ─── SearchableList ──────────────────────────────────────────────────

function SearchableList<T extends Record<string, unknown>>({
  data,
  searchKeys,
  renderItem,
  placeholder = "Search...",
}: SearchableListProps<T>) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Save recent search on submit
  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())];
      return next.slice(0, 5);
    });
    Keyboard.dismiss();
  }, [query]);

  // Filter data
  const filtered = debouncedQuery
    ? data.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return (
            typeof val === "string" && val.toLowerCase().includes(debouncedQuery.toLowerCase())
          );
        })
      )
    : data;

  const highlightText = buildHighlight(debouncedQuery);

  const showRecent = isFocused && !query && recentSearches.length > 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent searches */}
      {showRecent && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <View style={styles.recentChips}>
            {recentSearches.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.chip}
                onPress={() => {
                  setQuery(term);
                  setDebouncedQuery(term);
                }}
              >
                <Text style={styles.chipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results or empty state */}
      {debouncedQuery && filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔎</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => <>{renderItem(item, highlightText)}</>}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        />
      )}
    </View>
  );
}

// ─── Demo App ────────────────────────────────────────────────────────

interface Language {
  name: string;
  description: string;
}

const LANGUAGES: Language[] = [
  { name: "TypeScript", description: "Typed superset of JavaScript that compiles to plain JS" },
  { name: "Python", description: "General-purpose language known for readability and simplicity" },
  { name: "Rust", description: "Systems language focused on safety, speed, and concurrency" },
  { name: "Go", description: "Statically typed language designed for simplicity and efficiency" },
  { name: "Swift", description: "Powerful language for iOS, macOS, and beyond by Apple" },
  { name: "Kotlin", description: "Modern language for Android and JVM development" },
  { name: "Ruby", description: "Dynamic language optimized for developer happiness" },
  { name: "Elixir", description: "Functional language built on the Erlang VM for scalability" },
  { name: "Dart", description: "Client-optimized language for building apps with Flutter" },
  { name: "Zig", description: "Low-level language aiming to replace C with modern features" },
  { name: "Haskell", description: "Purely functional language with strong static typing" },
  { name: "Scala", description: "Combines object-oriented and functional on the JVM" },
  { name: "Clojure", description: "Dynamic functional Lisp dialect for the JVM" },
  { name: "Julia", description: "High-performance language for scientific computing" },
  { name: "Lua", description: "Lightweight scripting language often embedded in games" },
  { name: "OCaml", description: "Functional language with strong type inference" },
  { name: "Erlang", description: "Concurrent language built for fault-tolerant systems" },
  { name: "C#", description: "Modern object-oriented language by Microsoft for .NET" },
  { name: "PHP", description: "Widely used server-side scripting language for the web" },
  {
    name: "Java",
    description: "Versatile object-oriented language that runs on billions of devices",
  },
];

export default function App() {
  return (
    <View style={styles.app}>
      <Text style={styles.title}>Programming Languages</Text>
      <SearchableList<Language>
        data={LANGUAGES}
        searchKeys={["name", "description"]}
        placeholder="Search languages..."
        renderItem={(item, highlightText) => (
          <View style={styles.row}>
            <Text style={styles.rowName}>{highlightText(item.name)}</Text>
            <Text style={styles.rowDesc}>{highlightText(item.description)}</Text>
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
    marginBottom: 16,
  } as TextStyle,
  container: {
    flex: 1,
  } as ViewStyle,
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#334155",
  } as ViewStyle,
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  } as TextStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: "#f8fafc",
    height: 48,
  } as TextStyle,
  clearBtn: {
    padding: 6,
  } as ViewStyle,
  clearText: {
    fontSize: 14,
    color: "#94a3b8",
  } as TextStyle,
  highlight: {
    color: "#38bdf8",
    fontWeight: "700",
  } as TextStyle,
  recentContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  } as ViewStyle,
  recentTitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  recentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as ViewStyle,
  chip: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#334155",
  } as ViewStyle,
  chipText: {
    color: "#cbd5e1",
    fontSize: 14,
  } as TextStyle,
  list: {
    marginTop: 12,
  } as ViewStyle,
  row: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  } as ViewStyle,
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  } as TextStyle,
  rowDesc: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  } as TextStyle,
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  } as ViewStyle,
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  } as TextStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  } as TextStyle,
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
  } as TextStyle,
});
