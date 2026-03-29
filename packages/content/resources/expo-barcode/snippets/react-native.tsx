import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  Dimensions,
  Easing,
  Clipboard,
  Alert,
} from "react-native";

/* ── Types ─────────────────────────────────────── */

type BarcodeType = "QR" | "EAN-13" | "Code128";

interface ScanResult {
  id: string;
  type: BarcodeType;
  data: string;
  timestamp: Date;
}

/* ── Helpers ───────────────────────────────────── */

const { width: SCREEN_W } = Dimensions.get("window");
const SCAN_SIZE = SCREEN_W * 0.7;

function randomBarcodeType(): BarcodeType {
  const types: BarcodeType[] = ["QR", "EAN-13", "Code128"];
  return types[Math.floor(Math.random() * types.length)];
}

function randomData(type: BarcodeType): string {
  switch (type) {
    case "QR": {
      const urls = [
        "https://example.com/promo/2026",
        "https://shop.example.io/item/8842",
        "https://github.com/Foodhy/stealthis",
        "mailto:hello@example.com",
        "WIFI:T:WPA;S:CoffeeShop;P:latte2026;;",
      ];
      return urls[Math.floor(Math.random() * urls.length)];
    }
    case "EAN-13": {
      let code = "";
      for (let i = 0; i < 13; i++) code += Math.floor(Math.random() * 10);
      return code;
    }
    case "Code128": {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }
  }
}

function isURL(text: string): boolean {
  return /^https?:\/\//i.test(text);
}

function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/* ── Scan Line Animation ──────────────────────── */

function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_SIZE - 4],
  });

  return <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />;
}

/* ── Corner Brackets ──────────────────────────── */

function CornerBrackets() {
  const size = 24;
  const thickness = 3;
  const color = "#3b82f6";
  const corners = [
    { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness },
    { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness },
    { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness },
    { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <View
          key={i}
          style={[
            {
              position: "absolute",
              width: size,
              height: size,
              borderColor: color,
            },
            pos as any,
          ]}
        />
      ))}
    </>
  );
}

/* ── Result Modal ─────────────────────────────── */

function ResultModal({
  result,
  visible,
  onClose,
}: {
  result: ScanResult | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!result) return null;

  const handleCopy = () => {
    Clipboard.setString(result.data);
    Alert.alert("Copied", "Data copied to clipboard");
  };

  const handleOpenURL = () => {
    Alert.alert("Open URL", result.data);
  };

  const handleShare = () => {
    Alert.alert("Share", `Sharing: ${result.data}`);
  };

  const typeColors: Record<BarcodeType, string> = {
    QR: "#8b5cf6",
    "EAN-13": "#f59e0b",
    Code128: "#10b981",
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeColors[result.type] + "22" }]}>
            <Text style={[styles.typeBadgeText, { color: typeColors[result.type] }]}>
              {result.type}
            </Text>
          </View>

          {/* Data */}
          <Text style={styles.modalLabel}>Scanned Data</Text>
          <View style={styles.dataBox}>
            <Text style={styles.dataText} selectable>
              {result.data}
            </Text>
          </View>

          {/* Timestamp */}
          <Text style={styles.timestamp}>Scanned at {formatTime(result.timestamp)}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
              <Text style={styles.actionIcon}>&#x1F4CB;</Text>
              <Text style={styles.actionLabel}>Copy</Text>
            </TouchableOpacity>

            {isURL(result.data) && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleOpenURL}>
                <Text style={styles.actionIcon}>&#x1F310;</Text>
                <Text style={styles.actionLabel}>Open URL</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionIcon}>&#x1F4E4;</Text>
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ── History Item ─────────────────────────────── */

function HistoryItem({ item }: { item: ScanResult }) {
  const typeColors: Record<BarcodeType, string> = {
    QR: "#8b5cf6",
    "EAN-13": "#f59e0b",
    Code128: "#10b981",
  };

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={[styles.historyBadge, { backgroundColor: typeColors[item.type] + "22" }]}>
          <Text style={[styles.historyBadgeText, { color: typeColors[item.type] }]}>
            {item.type}
          </Text>
        </View>
        <Text style={styles.historyData} numberOfLines={1}>
          {item.data}
        </Text>
      </View>
      <Text style={styles.historyTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );
}

/* ── App ──────────────────────────────────────── */

export default function App() {
  const [torchOn, setTorchOn] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [modalResult, setModalResult] = useState<ScanResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleScan = useCallback(() => {
    const type = randomBarcodeType();
    const result: ScanResult = {
      id: Date.now().toString(),
      type,
      data: randomData(type),
      timestamp: new Date(),
    };
    setHistory((prev) => [result, ...prev]);
    setModalResult(result);
    setModalVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <TouchableOpacity
          style={[styles.torchBtn, torchOn && styles.torchBtnOn]}
          onPress={() => setTorchOn((v) => !v)}
        >
          <Text style={styles.torchIcon}>&#x1F526;</Text>
        </TouchableOpacity>
      </View>

      {/* Scanner viewport */}
      <View style={styles.scannerWrap}>
        {/* Simulated camera bg */}
        <View style={styles.cameraBg}>
          {torchOn && <View style={styles.torchOverlay} />}

          {/* Dark overlay with transparent center */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayRow}>
            <View style={styles.overlaySide} />
            {/* Scan area */}
            <TouchableOpacity activeOpacity={0.9} style={styles.scanArea} onPress={handleScan}>
              <CornerBrackets />
              <ScanLine />
              <Text style={styles.scanHint}>Tap to scan</Text>
            </TouchableOpacity>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Instructions */}
      <Text style={styles.instruction}>
        Point camera at a barcode or tap the scan area to simulate
      </Text>

      {/* History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Scan History</Text>
        {history.length > 0 && <Text style={styles.historyCount}>{history.length}</Text>}
      </View>

      <ScrollView style={styles.historyList} contentContainerStyle={styles.historyContent}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No scans yet. Tap the scan area above.</Text>
        ) : (
          history.map((item) => <HistoryItem key={item.id} item={item} />)
        )}
      </ScrollView>

      {/* Result modal */}
      <ResultModal
        result={modalResult}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

/* ── Styles ────────────────────────────────────── */

const OVERLAY_COLOR = "rgba(15, 23, 42, 0.85)";
const sideWidth = (SCREEN_W - SCAN_SIZE) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.3,
  },

  /* Torch */
  torchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  torchBtnOn: {
    backgroundColor: "#f59e0b",
  },
  torchIcon: { fontSize: 18 },

  /* Scanner */
  scannerWrap: {
    width: SCREEN_W,
    height: SCAN_SIZE + 60,
    overflow: "hidden",
  },
  cameraBg: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  torchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250, 204, 21, 0.04)",
  },

  /* Overlay regions */
  overlayTop: {
    height: 30,
    backgroundColor: OVERLAY_COLOR,
  },
  overlayRow: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  overlaySide: {
    width: sideWidth,
    backgroundColor: OVERLAY_COLOR,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },

  /* Scan area */
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  scanHint: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 40,
  },

  /* Instructions */
  instruction: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
    paddingVertical: 10,
  },

  /* History */
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  historyTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  historyCount: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  historyList: {
    flex: 1,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyData: {
    color: "#cbd5e1",
    fontSize: 13,
    flex: 1,
  },
  historyTime: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "monospace",
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#475569",
    alignSelf: "center",
    marginBottom: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dataBox: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  dataText: {
    color: "#f8fafc",
    fontSize: 15,
    fontFamily: "monospace",
    lineHeight: 22,
  },
  timestamp: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 20,
  },

  /* Actions */
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Close */
  closeBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
