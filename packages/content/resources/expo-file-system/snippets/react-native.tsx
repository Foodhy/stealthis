import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FileEntry {
  name: string;
  size?: number;
  exists: boolean;
  isDirectory: boolean;
  modificationTime?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatTimestamp(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Download Section                                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_URL = "https://raw.githubusercontent.com/expo/expo/main/README.md";

function DownloadSection() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<string | null>(null);
  const resumableRef = useRef<FileSystem.DownloadResumable | null>(null);

  const startDownload = useCallback(async () => {
    if (!url.trim()) return;
    setDownloading(true);
    setProgress(0);
    setDownloadResult(null);

    const filename = url.split("/").pop() || "downloaded-file";
    const fileUri = FileSystem.documentDirectory + filename;

    const callback: FileSystem.DownloadProgressCallback = (data) => {
      const pct =
        data.totalBytesExpectedToWrite > 0
          ? data.totalBytesWritten / data.totalBytesExpectedToWrite
          : 0;
      setProgress(pct);
    };

    const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {}, callback);
    resumableRef.current = downloadResumable;

    try {
      const result = await downloadResumable.downloadAsync();
      if (result) {
        setDownloadResult(`Saved to: ${result.uri}`);
        setProgress(1);
      }
    } catch (e: any) {
      if (e?.code !== "ERR_FILESYSTEM_CANNOT_DOWNLOAD") {
        setDownloadResult(`Error: ${e.message}`);
      }
    } finally {
      setDownloading(false);
      resumableRef.current = null;
    }
  }, [url]);

  return (
    <View style={styles.section}>
      <SectionHeader title="Download File" />
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Enter file URL..."
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <ProgressBar progress={progress} />
      <Pressable
        style={[styles.button, downloading && styles.buttonDisabled]}
        onPress={startDownload}
        disabled={downloading}
      >
        {downloading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Download</Text>
        )}
      </Pressable>
      {downloadResult && (
        <Text style={styles.resultText} numberOfLines={2}>
          {downloadResult}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  File Browser Section                                               */
/* ------------------------------------------------------------------ */

function FileBrowserSection() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFiles = useCallback(async () => {
    setLoading(true);
    try {
      const dir = FileSystem.documentDirectory;
      if (!dir) return;

      const names = await FileSystem.readDirectoryAsync(dir);
      const entries: FileEntry[] = await Promise.all(
        names.map(async (name) => {
          const info = await FileSystem.getInfoAsync(dir + name);
          return {
            name,
            size: info.exists ? ((info as any).size ?? 0) : 0,
            exists: info.exists,
            isDirectory: info.isDirectory ?? false,
            modificationTime: info.exists ? (info as any).modificationTime : undefined,
          };
        })
      );
      setFiles(entries.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const renderItem = ({ item }: { item: FileEntry }) => (
    <View style={styles.fileRow}>
      <Text style={styles.fileIcon}>{item.isDirectory ? "\uD83D\uDCC1" : "\uD83D\uDCC4"}</Text>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fileMeta}>
          {item.size !== undefined ? formatBytes(item.size) : "—"}
          {"  "}
          {formatTimestamp(item.modificationTime)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <SectionHeader title="File Browser" />
      <Pressable style={styles.buttonSmall} onPress={refreshFiles}>
        <Text style={styles.buttonSmallText}>Refresh</Text>
      </Pressable>
      {loading ? (
        <ActivityIndicator color="#818cf8" style={{ marginVertical: 12 }} />
      ) : files.length === 0 ? (
        <Text style={styles.emptyText}>No files in document directory</Text>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          scrollEnabled={false}
          style={styles.fileList}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Text Editor Section                                                */
/* ------------------------------------------------------------------ */

function TextEditorSection() {
  const [filename, setFilename] = useState("notes.txt");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const writeFile = useCallback(async () => {
    if (!filename.trim() || !content.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setMessage(`Saved "${filename}" successfully.`);
    } catch (e: any) {
      setMessage(`Error writing file: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [filename, content]);

  const readFile = useCallback(async () => {
    if (!filename.trim()) return;
    setMessage(null);
    try {
      const uri = FileSystem.documentDirectory + filename;
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        setMessage(`File "${filename}" does not exist.`);
        return;
      }
      const text = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setContent(text);
      setMessage(`Loaded "${filename}" (${text.length} chars).`);
    } catch (e: any) {
      setMessage(`Error reading file: ${e.message}`);
    }
  }, [filename]);

  return (
    <View style={styles.section}>
      <SectionHeader title="Text Editor" />
      <TextInput
        style={styles.input}
        value={filename}
        onChangeText={setFilename}
        placeholder="Filename..."
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Write some text..."
        placeholderTextColor="#64748b"
        multiline
        textAlignVertical="top"
      />
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={writeFile} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Write File"}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={readFile}>
          <Text style={styles.buttonText}>Read File</Text>
        </Pressable>
      </View>
      {message && (
        <Text style={styles.resultText} numberOfLines={2}>
          {message}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 20,
  },
  /* Sections */
  section: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  /* Inputs */
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    color: "#f8fafc",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  textArea: {
    height: 100,
  },
  /* Progress */
  progressTrack: {
    height: 28,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#6366f1",
    borderRadius: 14,
  },
  progressLabel: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  /* Buttons */
  button: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSecondary: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonSmall: {
    alignSelf: "flex-end",
    backgroundColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonSmallText: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  /* Files */
  fileList: {
    marginTop: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  fileMeta: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
  /* Result */
  resultText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 10,
  },
});

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>File System</Text>
        <DownloadSection />
        <FileBrowserSection />
        <TextEditorSection />
      </ScrollView>
    </View>
  );
}
