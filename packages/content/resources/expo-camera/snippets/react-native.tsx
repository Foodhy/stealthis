import React, { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, CameraType, FlashMode } from "expo-camera";

/* ------------------------------------------------------------------ */
/*  CameraCapture                                                     */
/* ------------------------------------------------------------------ */

interface CameraCaptureProps {
  onPhotoTaken?: (uri: string) => void;
  facing?: CameraType;
  flashEnabled?: boolean;
}

function CameraCapture({
  onPhotoTaken,
  facing: initialFacing = "back",
  flashEnabled: initialFlash = false,
}: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [flash, setFlash] = useState<boolean>(initialFlash);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  /* ---- Permission screen ---- */
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          This app needs access to your camera to take photos.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  /* ---- Photo preview ---- */
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <Pressable
            style={[styles.previewButton, styles.retakeButton]}
            onPress={() => setPhotoUri(null)}
          >
            <Text style={styles.previewButtonText}>Retake</Text>
          </Pressable>
          <Pressable
            style={[styles.previewButton, styles.useButton]}
            onPress={() => onPhotoTaken?.(photoUri)}
          >
            <Text style={styles.previewButtonText}>Use Photo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /* ---- Camera view ---- */
  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));

  const toggleFlash = () => setFlash((prev) => !prev);

  const capture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    if (photo) setPhotoUri(photo.uri);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? "on" : "off"}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={toggleFlash}>
          <Text style={styles.iconText}>{flash ? "⚡" : "⚡\u0336"}</Text>
        </Pressable>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomSide} />

        {/* Capture button */}
        <Pressable style={styles.captureOuter} onPress={capture}>
          <View style={styles.captureInner} />
        </Pressable>

        {/* Flip camera */}
        <View style={styles.bottomSide}>
          <Pressable style={styles.iconButton} onPress={toggleFacing}>
            <Text style={styles.iconText}>🔄</Text>
          </Pressable>
        </View>
      </View>
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
  /* Permission */
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  permissionText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  /* Camera */
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  bottomSide: {
    width: 48,
    alignItems: "center",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 22,
  },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  /* Preview */
  preview: {
    flex: 1,
  },
  previewActions: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  previewButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  useButton: {
    backgroundColor: "#6366f1",
  },
  previewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

/* ------------------------------------------------------------------ */
/*  Demo App                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  if (lastPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: lastPhoto }} style={{ flex: 1 }} resizeMode="contain" />
        <Pressable
          style={{
            position: "absolute",
            bottom: 50,
            alignSelf: "center",
            backgroundColor: "#6366f1",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 12,
          }}
          onPress={() => setLastPhoto(null)}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Back to Camera</Text>
        </Pressable>
      </View>
    );
  }

  return <CameraCapture onPhotoTaken={(uri) => setLastPhoto(uri)} />;
}
