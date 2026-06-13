import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type { Database } from "./database.types";

// CLAUDE.md §11.3: the native client uses the ANON key only. The service_role
// key must never appear in the bundle.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't hard-crash the skeleton at import time — warn loudly so screens still
  // render an empty state when credentials aren't configured yet.
  console.warn(
    "[@atlas/supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — " +
      "copy .env.example to apps/mobile/.env.local and fill them in.",
  );
}

// Session persistence via Expo SecureStore (CLAUDE.md §4 mapping replaces the
// web "remember me" sessionStorage sentinel).
// NOTE (§14): SecureStore has a ~2KB per-item limit; very large sessions may
// need a chunking adapter. Fine for typical Supabase sessions.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
