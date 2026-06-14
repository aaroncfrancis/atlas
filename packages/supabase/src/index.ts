export { supabase } from "./client";
export { toast } from "./toast";
export type { ToastItem, ToastAction, ToastOptions, ToastKind } from "./toast";
export { Toaster } from "./toaster";
export type { ToasterProps } from "./toaster";
// database.types.ts is GENERATED — refresh with `supabase gen types typescript --linked`.
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";
// Convenience row aliases (the generated file exposes rows via `Tables<>`).
export type ProfileRow = import("./database.types").Tables<"profiles">;
export type ObligationEventRow = import("./database.types").Tables<"obligation_events">;

// Queries
export {
  useObligations,
  obligationsQueryKey,
  useObligationEvents,
  useDocuments,
  useBudgets,
  budgetsQueryKey,
  obligationEventsKey,
  documentsKey,
} from "./hooks/use-obligations";
export type { DocumentRow, DocumentWithUrl, BudgetRow } from "./hooks/use-obligations";
export {
  useEntities,
  useEntityDocuments,
  entitiesQueryKey,
  entityDocumentsKey,
} from "./hooks/use-entities";
export { useProfile, profileQueryKey } from "./hooks/use-profile";

// Mutations (raw) + rollover
export {
  useUpdateObligation,
  useResolveObligation,
  useSnoozeObligation,
  useDismissObligation,
  useAutomate,
  useCancelSubscription,
  useCreateObligation,
  useAutoPaidRollover,
} from "./hooks/use-mutations";

// Toast-wrapped action layer
export { useObligationActions } from "./hooks/use-actions";
export type { ObligationActions } from "./hooks/use-actions";

// Auth
export { useSignIn, useSignUp, enforceRememberMe } from "./hooks/use-auth";
