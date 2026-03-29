import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

interface MenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
}

function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);

  const show = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 15,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOpen(false);
    });
  };

  const screenWidth = Dimensions.get("window").width;
  const menuWidth = 200;
  let menuLeft = triggerLayout.x;
  if (menuLeft + menuWidth > screenWidth - 16) {
    menuLeft = screenWidth - menuWidth - 16;
  }

  return (
    <View ref={triggerRef}>
      <TouchableOpacity onPress={show} activeOpacity={0.7}>
        {trigger}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none">
        <Pressable style={styles.overlay} onPress={hide}>
          <Animated.View
            style={[
              styles.menu,
              {
                top: triggerLayout.y + triggerLayout.height + 4,
                left: menuLeft,
                width: menuWidth,
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            {items.map((item, i) => {
              if (item.separator) {
                return <View key={i} style={styles.separator} />;
              }
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
                  onPress={() => {
                    if (!item.disabled) {
                      hide();
                      item.onPress();
                    }
                  }}
                  activeOpacity={item.disabled ? 1 : 0.6}
                >
                  {item.icon && <Text style={styles.menuIcon}>{item.icon}</Text>}
                  <Text
                    style={[
                      styles.menuLabel,
                      item.destructive && styles.destructiveLabel,
                      item.disabled && styles.disabledLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

// --- Demo ---

export default function App() {
  const [status, setStatus] = useState("Select an option");

  const items: MenuItem[] = [
    { label: "Edit", icon: "✏️", onPress: () => setStatus("Edit pressed") },
    { label: "Duplicate", icon: "📄", onPress: () => setStatus("Duplicate pressed") },
    { label: "Share", icon: "🔗", onPress: () => setStatus("Share pressed") },
    {
      label: "Archive",
      icon: "📦",
      onPress: () => {},
      disabled: true,
      separator: true,
    },
    {
      label: "Delete",
      icon: "🗑️",
      onPress: () => setStatus("Delete pressed"),
      destructive: true,
      separator: true,
    },
  ];

  // Build items with separators inserted
  const menuItems: MenuItem[] = [];
  for (const item of items) {
    if (item.separator) {
      menuItems.push({
        label: "",
        onPress: () => {},
        separator: true,
      });
    }
    menuItems.push(item);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dropdown Menu</Text>
      <Text style={styles.status}>{status}</Text>

      <View style={{ marginTop: 24 }}>
        <DropdownMenu
          trigger={
            <View style={styles.triggerButton}>
              <Text style={styles.triggerText}>Options ▾</Text>
            </View>
          }
          items={menuItems}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    paddingTop: 120,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  status: {
    color: "#94a3b8",
    fontSize: 14,
  },
  triggerButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  triggerText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemDisabled: {
    opacity: 0.4,
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  menuLabel: {
    color: "#f8fafc",
    fontSize: 15,
  },
  destructiveLabel: {
    color: "#ef4444",
  },
  disabledLabel: {
    color: "#64748b",
  },
  separator: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 4,
    marginHorizontal: 10,
  },
});
