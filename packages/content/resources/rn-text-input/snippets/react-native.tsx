import React, { useRef, useState, useCallback, type ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StyledTextInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  brand: "#6366f1",
  error: "#ef4444",
  success: "#22c55e",
  border: "#334155",
  borderDisabled: "#1e293b",
  bg: "#1e293b",
  bgDisabled: "#0f172a",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textDisabled: "#475569",
  labelInactive: "#94a3b8",
} as const;

const LABEL_TOP_ACTIVE = -10;
const LABEL_TOP_INACTIVE = 16;
const LABEL_FONT_ACTIVE = 12;
const LABEL_FONT_INACTIVE = 16;
const ANIM_DURATION = 180;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StyledTextInput({
  label,
  value,
  onChangeText,
  error,
  success = false,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  secureTextEntry = false,
  style,
  inputStyle,
  ...rest
}: StyledTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Animated values
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Derived state
  const hasError = Boolean(error);
  const isActive = isFocused || value.length > 0;

  // ---- animations --------------------------------------------------------

  const animateLabel = useCallback(
    (toValue: number) => {
      Animated.timing(labelAnim, {
        toValue,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    },
    [labelAnim]
  );

  const animateBorder = useCallback(
    (toValue: number) => {
      Animated.timing(borderAnim, {
        toValue,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    },
    [borderAnim]
  );

  // ---- handlers ----------------------------------------------------------

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    animateLabel(1);
    animateBorder(1);
  }, [animateLabel, animateBorder]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (value.length === 0) animateLabel(0);
    animateBorder(0);
  }, [value, animateLabel, animateBorder]);

  // ---- interpolations ----------------------------------------------------

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [LABEL_TOP_INACTIVE, LABEL_TOP_ACTIVE],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [LABEL_FONT_INACTIVE, LABEL_FONT_ACTIVE],
  });

  const borderColor = (() => {
    if (disabled) return COLORS.borderDisabled;
    if (hasError) return COLORS.error;
    if (success) return COLORS.success;
    return borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.border, COLORS.brand],
    });
  })();

  const labelColor = (() => {
    if (disabled) return COLORS.textDisabled;
    if (hasError) return COLORS.error;
    if (isFocused) return COLORS.brand;
    if (success && isActive) return COLORS.success;
    return COLORS.labelInactive;
  })();

  // ---- render ------------------------------------------------------------

  return (
    <Animated.View style={[styles.wrapper, style]}>
      {/* Container */}
      <Animated.View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: disabled ? COLORS.bgDisabled : COLORS.bg,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {/* Left icon */}
        {leftIcon && <Animated.View style={styles.iconLeft}>{leftIcon}</Animated.View>}

        {/* Input area */}
        <Animated.View style={styles.inputArea}>
          {/* Floating label */}
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: labelColor,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>

          <TextInput
            {...rest}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            style={[
              styles.input,
              {
                color: disabled ? COLORS.textDisabled : COLORS.text,
              },
              inputStyle,
            ]}
            placeholderTextColor={COLORS.textDisabled}
            selectionColor={COLORS.brand}
          />
        </Animated.View>

        {/* Right icon */}
        {rightIcon && <Animated.View style={styles.iconRight}>{rightIcon}</Animated.View>}
      </Animated.View>

      {/* Helper / Error text */}
      {(hasError || helperText) && (
        <Animated.Text
          style={[styles.helperText, { color: hasError ? COLORS.error : COLORS.textSecondary }]}
        >
          {hasError ? error : helperText}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputArea: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  label: {
    position: "absolute",
    left: 0,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: 24,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

// ---------------------------------------------------------------------------
// Demo App
// ---------------------------------------------------------------------------

import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("bad-email");
  const [password, setPassword] = useState("supersecret");
  const [disabled, setDisabled] = useState("Cannot edit this");

  const emailError =
    email.length > 0 && !email.includes("@") ? "Please enter a valid email address" : undefined;

  return (
    <SafeAreaView style={demoStyles.safe}>
      <ScrollView style={demoStyles.scroll} contentContainerStyle={demoStyles.content}>
        <Text style={demoStyles.heading}>StyledTextInput Demo</Text>

        {/* Normal input */}
        <StyledTextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          helperText="Enter your first and last name"
          autoCapitalize="words"
        />

        {/* Email with error */}
        <StyledTextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Text style={demoStyles.icon}>@</Text>}
        />

        {/* Password with success */}
        <StyledTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          success={password.length >= 8}
          helperText={password.length >= 8 ? "Strong password" : "Must be at least 8 characters"}
          secureTextEntry
          rightIcon={
            <Text style={demoStyles.icon} onPress={() => Alert.alert("Toggle visibility")}>
              {"👁"}
            </Text>
          }
        />

        {/* Disabled input */}
        <StyledTextInput
          label="Account ID"
          value={disabled}
          onChangeText={setDisabled}
          disabled
          helperText="This field cannot be edited"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const demoStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 32,
  },
  icon: {
    fontSize: 18,
    color: "#94a3b8",
  },
});
