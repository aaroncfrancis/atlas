export { supabase } from "./client";
export { toast } from "./toast";
// database.types.ts is GENERATED — refresh with `supabase gen types typescript --linked`.
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";
// Convenience row aliases (the generated file exposes rows via `Tables<>`).
export type ProfileRow = import("./database.types").Tables<"profiles">;
export type ObligationEventRow = import("./database.types").Tables<"obligation_events">;
export { useObligations, obligationsQueryKey } from "./hooks/use-obligations";
export { useProfile, profileQueryKey } from "./hooks/use-profile";
export {
  useResolveObligation,
  useSnoozeObligation,
  useDismissObligation,
} from "./hooks/use-actions";
export { useSignIn, useSignUp, enforceRememberMe } from "./hooks/use-auth";
