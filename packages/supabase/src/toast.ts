import { Platform, ToastAndroid } from "react-native";

// The single place the toast implementation lives, so the toast-wrapped action
// layer (CLAUDE.md §12) has one swap point. This lightweight version works in
// Expo Go today; replace the body with `burnt` (OS-native) or a custom animated
// toast later without touching any call site.
type ToastKind = "success" | "error" | "info";

function show(kind: ToastKind, message: string): void {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  // iOS/web skeleton fallback. Swap for a native presenter.
  console.log(`[toast:${kind}] ${message}`);
}

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  info: (message: string) => show("info", message),
};
