import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";

/* ── Types ─────────────────────────────────────── */

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  color?: string;
}

interface MapViewProps {
  initialRegion: Region;
  markers: MarkerData[];
  showUserLocation?: boolean;
  onRegionChange?: (region: Region) => void;
}

/* ── Helpers ───────────────────────────────────── */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MAP_W = SCREEN_W;
const MAP_H = SCREEN_H * 0.65;

function latLngToXY(
  lat: number,
  lng: number,
  region: Region
): { x: number; y: number } {
  const x =
    ((lng - (region.longitude - region.longitudeDelta / 2)) /
      region.longitudeDelta) *
    MAP_W;
  const y =
    ((region.latitude + region.latitudeDelta / 2 - lat) /
      region.latitudeDelta) *
    MAP_H;
  return { x, y };
}

/* ── Pulsing Dot ───────────────────────────────── */

function PulsingDot({ x, y }: { x: number; y: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 2.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.userLocWrap, { left: x - 14, top: y - 14 }]}>
      <Animated.View
        style={[
          styles.userLocRing,
          { transform: [{ scale: pulse }], opacity: pulse.interpolate({ inputRange: [1, 2.2], outputRange: [0.5, 0] }) },
        ]}
      />
      <View style={styles.userLocDot} />
    </View>
  );
}

/* ── Marker ────────────────────────────────────── */

function Marker({
  marker,
  x,
  y,
  onPress,
}: {
  marker: MarkerData;
  x: number;
  y: number;
  onPress: () => void;
}) {
  const color = marker.color || "#ef4444";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.markerWrap, { left: x - 14, top: y - 36 }]}
    >
      {/* Pin shape */}
      <View style={[styles.markerPin, { backgroundColor: color }]}>
        <View style={styles.markerInner} />
      </View>
      <View
        style={[styles.markerTail, { borderTopColor: color }]}
      />
    </TouchableOpacity>
  );
}

/* ── Callout ───────────────────────────────────── */

function Callout({
  marker,
  x,
  y,
  onClose,
}: {
  marker: MarkerData;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const left = Math.max(8, Math.min(x - 100, MAP_W - 208));
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      style={[styles.callout, { left, top: y - 100 }]}
    >
      <Text style={styles.calloutTitle}>{marker.title}</Text>
      <Text style={styles.calloutDesc}>{marker.description}</Text>
    </TouchableOpacity>
  );
}

/* ── Grid Background ──────────────────────────── */

function CoordinateGrid({ region }: { region: Region }) {
  const lines: React.ReactNode[] = [];
  const gridCount = 8;

  for (let i = 0; i <= gridCount; i++) {
    const frac = i / gridCount;
    // horizontal
    lines.push(
      <View
        key={`h${i}`}
        style={[styles.gridLine, styles.gridH, { top: `${frac * 100}%` }]}
      />
    );
    // vertical
    lines.push(
      <View
        key={`v${i}`}
        style={[styles.gridLine, styles.gridV, { left: `${frac * 100}%` }]}
      />
    );
  }

  // Coordinate labels
  const latTop = (region.latitude + region.latitudeDelta / 2).toFixed(3);
  const latBot = (region.latitude - region.latitudeDelta / 2).toFixed(3);
  const lngLeft = (region.longitude - region.longitudeDelta / 2).toFixed(3);
  const lngRight = (region.longitude + region.longitudeDelta / 2).toFixed(3);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines}
      <Text style={[styles.coordLabel, { top: 4, left: 4 }]}>{latTop}°</Text>
      <Text style={[styles.coordLabel, { bottom: 4, left: 4 }]}>
        {latBot}°
      </Text>
      <Text style={[styles.coordLabel, { bottom: 4, right: 4 }]}>
        {lngRight}°
      </Text>
      <Text style={[styles.coordLabel, { top: 4, right: 4 }]}>
        {lngLeft}°
      </Text>
    </View>
  );
}

/* ── MapView ──────────────────────────────────── */

function MapView({
  initialRegion,
  markers,
  showUserLocation = false,
  onRegionChange,
}: MapViewProps) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const regionRef = useRef(region);

  const updateRegion = useCallback(
    (r: Region) => {
      regionRef.current = r;
      setRegion(r);
      onRegionChange?.(r);
    },
    [onRegionChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        const r = regionRef.current;
        const dLng = (-g.dx / MAP_W) * r.longitudeDelta * 0.15;
        const dLat = (g.dy / MAP_H) * r.latitudeDelta * 0.15;
        updateRegion({ ...r, latitude: r.latitude + dLat, longitude: r.longitude + dLng });
      },
    })
  ).current;

  const zoom = (factor: number) => {
    const r = regionRef.current;
    updateRegion({
      ...r,
      latitudeDelta: r.latitudeDelta * factor,
      longitudeDelta: r.longitudeDelta * factor,
    });
  };

  const selectedMarker = markers.find((m) => m.id === selectedId) || null;

  return (
    <View style={styles.mapContainer}>
      <View style={styles.map} {...panResponder.panHandlers}>
        <CoordinateGrid region={region} />

        {/* Markers */}
        {markers.map((m) => {
          const { x, y } = latLngToXY(m.latitude, m.longitude, region);
          if (x < -20 || x > MAP_W + 20 || y < -40 || y > MAP_H + 20)
            return null;
          return (
            <Marker
              key={m.id}
              marker={m}
              x={x}
              y={y}
              onPress={() => setSelectedId(m.id === selectedId ? null : m.id)}
            />
          );
        })}

        {/* User location */}
        {showUserLocation && (() => {
          const { x, y } = latLngToXY(
            region.latitude,
            region.longitude,
            region
          );
          return <PulsingDot x={x} y={y} />;
        })()}

        {/* Callout */}
        {selectedMarker && (() => {
          const { x, y } = latLngToXY(
            selectedMarker.latitude,
            selectedMarker.longitude,
            region
          );
          return (
            <Callout
              marker={selectedMarker}
              x={x}
              y={y}
              onClose={() => setSelectedId(null)}
            />
          );
        })()}
      </View>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(0.7)}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1.4)}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── App ──────────────────────────────────────── */

const MARKERS: MarkerData[] = [
  {
    id: "1",
    latitude: 40.7138,
    longitude: -74.0068,
    title: "Bean & Leaf",
    description: "Artisan pour-over & cold brew",
    color: "#f59e0b",
  },
  {
    id: "2",
    latitude: 40.7188,
    longitude: -74.0005,
    title: "Roast Republic",
    description: "Single-origin espresso bar",
    color: "#ef4444",
  },
  {
    id: "3",
    latitude: 40.7105,
    longitude: -74.0095,
    title: "Grind House",
    description: "24/7 specialty coffee & pastries",
    color: "#10b981",
  },
  {
    id: "4",
    latitude: 40.7155,
    longitude: -74.0128,
    title: "Brew Lab",
    description: "Experimental coffee cocktails",
    color: "#8b5cf6",
  },
  {
    id: "5",
    latitude: 40.7172,
    longitude: -74.0042,
    title: "The Daily Drip",
    description: "Cozy neighborhood cafe",
    color: "#ec4899",
  },
];

const INITIAL_REGION: Region = {
  latitude: 40.7148,
  longitude: -74.006,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function App() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(INITIAL_REGION);

  const filtered = search
    ? MARKERS.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase())
      )
    : MARKERS;

  const recenter = () => setRegion({ ...INITIAL_REGION });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coffee Finder</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>&#x1F50D;</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coffee shops..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Map */}
      <MapView
        initialRegion={region}
        markers={filtered}
        showUserLocation
        onRegionChange={setRegion}
      />

      {/* Location button */}
      <TouchableOpacity style={styles.locBtn} onPress={recenter}>
        <Text style={styles.locBtnIcon}>&#x1F4CD;</Text>
      </TouchableOpacity>

      {/* Legend */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.legend}
        contentContainerStyle={styles.legendContent}
      >
        {MARKERS.map((m) => (
          <View key={m.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: m.color }]} />
            <Text style={styles.legendText}>{m.title}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ── Styles ────────────────────────────────────── */

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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.3,
  },

  /* Search */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    color: "#f8fafc",
    fontSize: 15,
  },

  /* Map container */
  mapContainer: {
    width: MAP_W,
    height: MAP_H,
    position: "relative",
  },
  map: {
    width: MAP_W,
    height: MAP_H,
    backgroundColor: "#0c1425",
    overflow: "hidden",
  },

  /* Grid */
  gridLine: {
    position: "absolute",
    backgroundColor: "#1e293b",
  },
  gridH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  coordLabel: {
    position: "absolute",
    color: "#475569",
    fontSize: 9,
    fontFamily: "monospace",
  },

  /* Marker */
  markerWrap: {
    position: "absolute",
    alignItems: "center",
    width: 28,
    zIndex: 10,
  },
  markerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },

  /* Callout */
  callout: {
    position: "absolute",
    width: 200,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutTitle: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
  },

  /* User location */
  userLocWrap: {
    position: "absolute",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  userLocRing: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
  },
  userLocDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* Zoom */
  zoomControls: {
    position: "absolute",
    right: 16,
    bottom: 20,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  zoomBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
  },

  /* Location button */
  locBtn: {
    position: "absolute",
    right: 16,
    top: MAP_H + 130,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    zIndex: 30,
  },
  locBtnIcon: {
    fontSize: 20,
  },

  /* Legend */
  legend: {
    maxHeight: 50,
    marginHorizontal: 16,
    marginTop: 10,
  },
  legendContent: {
    alignItems: "center",
    gap: 16,
    paddingRight: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
