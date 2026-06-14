import { Platform } from "react-native";

// The single place the toast implementation lives, so the toast-wrapped action
// layer (CLAUDE.md §12) has one swap point. This is a small in-app event bus:
// `toast.success(...)` emits an item and the mounted <Toaster/> renders it. An
// optional `action` powers the Undo affordance on resolve/snooze/dismiss.
export type ToastKind = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  description?: string;
  action?: ToastAction;
  durationMs?: number;
}

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  description?: string;
  action?: ToastAction;
  durationMs: number;
}

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();
let counter = 0;

function emit(kind: ToastKind, message: string, options?: ToastOptions): void {
  counter += 1;
  const item: ToastItem = {
    id: counter,
    kind,
    message,
    description: options?.description,
    action: options?.action,
    // Linger longer when there's an Undo to give the user time to tap it.
    durationMs: options?.durationMs ?? (options?.action ? 6000 : 3000),
  };
  if (listeners.size === 0) {
    // No <Toaster/> mounted (e.g. headless / tests) — don't lose the feedback.
    if (Platform.OS !== "web") console.log(`[toast:${kind}] ${message}`);
    return;
  }
  for (const listener of listeners) listener(item);
}

/** Subscribe the <Toaster/> to emitted toasts. Returns an unsubscribe fn. */
export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => emit("success", message, options),
  error: (message: string, options?: ToastOptions) => emit("error", message, options),
  info: (message: string, options?: ToastOptions) => emit("info", message, options),
};
