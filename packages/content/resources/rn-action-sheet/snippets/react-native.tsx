import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Action {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: Action[];
  cancelLabel: string;
}

/* ------------------------------------------------------------------ */
/*  ActionSheet                                                        */
/* ------------------------------------------------------------------ */

const SCREEN_HEIGHT = Dimensions.get("window").height;

function ActionSheet({
  visible,
  onClose,
  title,
  message,
  actions,
  cancelLabel,
}: ActionSheetProps) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [mounted, setMounted] = useState(visible);

  const open = useCallback(() => {
    setMounted(true);
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdrop, slide]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setMounted(false));
  }, [backdrop, slide]);

  useEffect(() => {
    if (visible) {
      open();
    } else {
      close();
    }
  }, [visible, open, close]);

  if (!mounted) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        {/* Action group */}
        <View style={styles.group}>
          {/* Header */}
          {(title || message) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
            </View>
          )}

          {/* Action buttons */}
          {actions.map((action, index) => {
            const isFirst = index === 0 && !title && !message;
            const isLast = index === actions.length - 1;
            return (
              <React.Fragment key={action.label}>
                {(index > 0 || title || message) && <View style={styles.separator} />}
                <TouchableOpacity
                  style={[
                    styles.button,
                    isFirst && styles.buttonFirst,
                    isLast && styles.buttonLast,
                    action.disabled && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.6}
                  disabled={action.disabled}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      action.destructive && styles.destructiveText,
                      action.disabled && styles.disabledText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.6}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sheet: {
    paddingHorizontal: 8,
    paddingBottom: 34,
  },
  group: {
    backgroundColor: "#f1f1f1",
    borderRadius: 14,
    overflow: "hidden",
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    color: "#8e8e93",
    textAlign: "center",
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#c8c8cc",
  },
  button: {
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
  },
  buttonFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  buttonLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 20,
    color: "#007aff",
  },
  destructiveText: {
    color: "#ef4444",
  },
  disabledText: {
    color: "#8e8e93",
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007aff",
  },
});

/* ------------------------------------------------------------------ */
/*  Demo App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={appStyles.container}>
      <TouchableOpacity
        style={appStyles.openButton}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <Text style={appStyles.openButtonText}>Open Action Sheet</Text>
      </TouchableOpacity>

      <ActionSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="Photo Options"
        message="Choose an action for this photo"
        actions={[
          { label: "Take Photo", onPress: () => console.log("Take Photo") },
          { label: "Choose from Library", onPress: () => console.log("Choose from Library") },
          { label: "Delete Photo", onPress: () => console.log("Delete Photo"), destructive: true },
        ]}
        cancelLabel="Cancel"
      />
    </View>
  );
}

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "#007aff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
