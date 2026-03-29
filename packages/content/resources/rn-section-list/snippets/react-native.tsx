import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import type { SectionListData, DefaultSectionT } from "react-native";

// ---------- Types ----------

interface ContactItem {
  id: string;
  name: string;
  subtitle: string;
}

interface SectionData {
  title: string;
  data: ContactItem[];
}

interface GroupedSectionListProps {
  sections: SectionData[];
  renderItem?: (info: {
    item: ContactItem;
    index: number;
    section: SectionListData<ContactItem, DefaultSectionT>;
  }) => React.ReactElement;
  renderSectionHeader?: (info: {
    section: SectionListData<ContactItem, DefaultSectionT>;
  }) => React.ReactElement;
  showAlphabetIndex?: boolean;
  separatorColor?: string;
  backgroundColor?: string;
}

// ---------- Helpers ----------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---------- Components ----------

function Avatar({ name }: { name: string }) {
  const initials = getInitials(name);
  const bg = colorForName(name);
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function DefaultItemRow({ item }: { item: ContactItem }) {
  return (
    <View style={styles.itemRow}>
      <Avatar name={item.name} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

function DefaultSectionHeader({
  section,
}: {
  section: SectionListData<ContactItem, DefaultSectionT>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{section.data.length}</Text>
      </View>
    </View>
  );
}

function AlphabetIndex({
  letters,
  onPress,
}: {
  letters: string[];
  onPress: (index: number) => void;
}) {
  return (
    <View style={styles.alphabetContainer}>
      {letters.map((letter, i) => (
        <TouchableOpacity
          key={letter}
          onPress={() => onPress(i)}
          hitSlop={{ top: 2, bottom: 2, left: 10, right: 10 }}
        >
          <Text style={styles.alphabetLetter}>{letter}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------- Main Component ----------

export function GroupedSectionList({
  sections,
  renderItem,
  renderSectionHeader,
  showAlphabetIndex = true,
  separatorColor = "rgba(255,255,255,0.08)",
  backgroundColor = "#0f172a",
}: GroupedSectionListProps) {
  const listRef = useRef<SectionList<ContactItem>>(null);

  const letters = sections.map((s) => s.title);

  const handleAlphabetPress = useCallback((sectionIndex: number) => {
    listRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated: true,
    });
  }, []);

  const defaultRenderItem = useCallback(
    ({
      item,
    }: {
      item: ContactItem;
      index: number;
      section: SectionListData<ContactItem, DefaultSectionT>;
    }) => <DefaultItemRow item={item} />,
    []
  );

  const defaultRenderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<ContactItem, DefaultSectionT>;
    }) => <DefaultSectionHeader section={section} />,
    []
  );

  const renderSeparator = useCallback(
    () => <View style={[styles.separator, { backgroundColor: separatorColor }]} />,
    [separatorColor]
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem ?? defaultRenderItem}
        renderSectionHeader={renderSectionHeader ?? defaultRenderSectionHeader}
        ItemSeparatorComponent={renderSeparator}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: 64,
          offset: 64 * index,
          index,
        })}
      />
      {showAlphabetIndex && <AlphabetIndex letters={letters} onPress={handleAlphabetPress} />}
    </View>
  );
}

// ---------- Demo Data ----------

const CONTACTS: SectionData[] = [
  {
    title: "A",
    data: [
      { id: "a1", name: "Alice Johnson", subtitle: "Software Engineer" },
      { id: "a2", name: "Alex Rivera", subtitle: "Product Designer" },
      { id: "a3", name: "Amanda Chen", subtitle: "Data Scientist" },
    ],
  },
  {
    title: "B",
    data: [
      { id: "b1", name: "Bob Smith", subtitle: "DevOps Lead" },
      { id: "b2", name: "Bella Martinez", subtitle: "UX Researcher" },
    ],
  },
  {
    title: "C",
    data: [
      { id: "c1", name: "Charlie Brown", subtitle: "Frontend Developer" },
      { id: "c2", name: "Clara Davis", subtitle: "Backend Engineer" },
    ],
  },
  {
    title: "D",
    data: [
      { id: "d1", name: "Diana Prince", subtitle: "Security Analyst" },
      { id: "d2", name: "David Kim", subtitle: "Mobile Developer" },
    ],
  },
  {
    title: "E",
    data: [
      { id: "e1", name: "Emma Wilson", subtitle: "QA Engineer" },
      { id: "e2", name: "Ethan Moore", subtitle: "Tech Lead" },
    ],
  },
  {
    title: "F",
    data: [{ id: "f1", name: "Fiona Green", subtitle: "Scrum Master" }],
  },
  {
    title: "G",
    data: [
      { id: "g1", name: "George Clark", subtitle: "Systems Architect" },
      { id: "g2", name: "Grace Lee", subtitle: "AI Researcher" },
    ],
  },
  {
    title: "H",
    data: [{ id: "h1", name: "Hannah White", subtitle: "Product Manager" }],
  },
  {
    title: "J",
    data: [
      { id: "j1", name: "James Taylor", subtitle: "Cloud Engineer" },
      { id: "j2", name: "Julia Adams", subtitle: "Technical Writer" },
    ],
  },
  {
    title: "K",
    data: [{ id: "k1", name: "Kevin Park", subtitle: "ML Engineer" }],
  },
  {
    title: "L",
    data: [
      { id: "l1", name: "Luna Garcia", subtitle: "iOS Developer" },
      { id: "l2", name: "Liam O'Brien", subtitle: "Android Developer" },
    ],
  },
  {
    title: "M",
    data: [
      { id: "m1", name: "Mia Thompson", subtitle: "Design Lead" },
      { id: "m2", name: "Marcus Hall", subtitle: "Full Stack Developer" },
    ],
  },
  {
    title: "N",
    data: [{ id: "n1", name: "Noah Wright", subtitle: "Platform Engineer" }],
  },
  {
    title: "R",
    data: [{ id: "r1", name: "Rachel Scott", subtitle: "VP Engineering" }],
  },
  {
    title: "S",
    data: [
      { id: "s1", name: "Sam Cooper", subtitle: "SRE" },
      { id: "s2", name: "Sofia Reyes", subtitle: "Data Engineer" },
    ],
  },
  {
    title: "T",
    data: [{ id: "t1", name: "Tyler Brooks", subtitle: "CTO" }],
  },
];

// ---------- App ----------

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <Text style={styles.headerCount}>
          {CONTACTS.reduce((sum, s) => sum + s.data.length, 0)} people
        </Text>
      </View>
      <GroupedSectionList sections={CONTACTS} showAlphabetIndex />
    </SafeAreaView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#0f172a",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
  },
  headerCount: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(15,23,42,0.95)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: "rgba(99,102,241,0.2)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#818cf8",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 64,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  itemTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f1f5f9",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 74,
    marginRight: 20,
  },
  alphabetContainer: {
    position: "absolute",
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    width: 20,
  },
  alphabetLetter: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6366f1",
    paddingVertical: 1.5,
  },
});
