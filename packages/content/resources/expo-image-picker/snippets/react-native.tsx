import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_GAP = 12;
const GRID_PADDING = 20;
const IMAGE_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

/* ------------------------------------------------------------------ */
/*  ImagePickerGrid                                                   */
/* ------------------------------------------------------------------ */

interface ImagePickerGridProps {
  onImagesSelected?: (uris: string[]) => void;
  maxSelection?: number;
  quality?: number;
  allowsEditing?: boolean;
}

function ImagePickerGrid({
  onImagesSelected,
  maxSelection = 10,
  quality = 0.8,
  allowsEditing = false,
}: ImagePickerGridProps) {
  const [images, setImages] = useState<string[]>([]);

  const updateImages = (next: string[]) => {
    setImages(next);
    onImagesSelected?.(next);
  };

  /* ---- Pick from gallery ---- */
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxSelection - images.length,
      quality,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      updateImages([...images, ...newUris].slice(0, maxSelection));
    }
  };

  /* ---- Take a photo ---- */
  const takePhoto = async () => {
    if (images.length >= maxSelection) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      quality,
    });

    if (!result.canceled && result.assets.length > 0) {
      updateImages([...images, result.assets[0].uri].slice(0, maxSelection));
    }
  };

  /* ---- Remove an image ---- */
  const removeImage = (uri: string) => {
    updateImages(images.filter((i) => i !== uri));
  };

  /* ---- Render ---- */
  return (
    <View style={styles.container}>
      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={pickFromGallery}>
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionText}>Choose from Gallery</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={takePhoto}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Take Photo</Text>
        </Pressable>
      </View>

      {/* Selection count */}
      <Text style={styles.countText}>
        {images.length} / {maxSelection} selected
      </Text>

      {/* Image grid */}
      {images.length > 0 ? (
        <FlatList
          data={images}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item }} style={styles.image} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeImage(item)}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyText}>No images selected</Text>
          <Text style={styles.emptySubtext}>
            Choose from gallery or take a photo to get started.
          </Text>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  /* Actions */
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
  /* Count */
  countText: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 8,
  },
  /* Grid */
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1e293b",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  /* Empty state */
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

/* ------------------------------------------------------------------ */
/*  Demo App                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  const [selectedUris, setSelectedUris] = useState<string[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", paddingTop: 60 }}>
      <Text
        style={{
          color: "#f8fafc",
          fontSize: 22,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Image Picker
      </Text>
      <Text
        style={{
          color: "#64748b",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Select images from gallery or camera
      </Text>

      <ImagePickerGrid
        onImagesSelected={setSelectedUris}
        maxSelection={8}
        quality={0.8}
      />
    </View>
  );
}
