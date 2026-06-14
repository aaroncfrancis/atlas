import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colorTokens, fontTokens } from "@atlas/config";
import { subscribeToast, type ToastItem, type ToastKind } from "./toast";

// In-app toast presenter (CLAUDE.md §4 mapping: replaces Sonner). Lives in
// @atlas/supabase so the action layer's `toast` calls and this renderer share one
// module, and uses token-based inline styles because the NativeWind content globs
// don't cover this package. Mount once near the app root, above the navigator.

const ACCENT: Record<ToastKind, string> = {
  success: colorTokens.teal,
  error: colorTokens.overdue,
  info: colorTokens.primary,
};

export interface ToasterProps {
  /** Distance from the bottom edge; lift above the tab bar when needed. */
  bottomOffset?: number;
}

export function Toaster({ bottomOffset = 96 }: ToasterProps) {
  const [item, setItem] = useState<ToastItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToast((next) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setItem(next);
    });
  }, []);

  useEffect(() => {
    if (item === null) return;
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();

    hideTimer.current = setTimeout(() => dismiss(), item.durationMs);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function dismiss() {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setItem(null);
    });
  }

  if (item === null) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: bottomOffset }]}>
      <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.accent, { backgroundColor: ACCENT[item.kind] }]} />
        <View style={styles.body}>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
          {item.description !== undefined ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        {item.action !== undefined ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              item.action?.onPress();
              dismiss();
            }}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionLabel, { color: ACCENT[item.kind] }]}>
              {item.action.label}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: colorTokens.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colorTokens.border,
    paddingVertical: 12,
    paddingRight: 12,
    overflow: "hidden",
    shadowColor: colorTokens.foreground,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  accent: { width: 4, alignSelf: "stretch", marginRight: 12 },
  body: { flex: 1 },
  message: { fontFamily: fontTokens.display, fontSize: 14, color: colorTokens.foreground },
  description: { fontFamily: fontTokens.body, fontSize: 12, color: colorTokens.textSecondary, marginTop: 2 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  actionLabel: { fontFamily: fontTokens.display, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
});
