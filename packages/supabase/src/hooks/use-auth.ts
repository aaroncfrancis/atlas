import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "@atlas/i18n";
import { supabase } from "../client";
import { toast } from "../toast";
import { profileQueryKey } from "./use-profile";

// Toast-wrapped auth layer (CLAUDE.md §12), mirroring use-actions.ts. Auth calls
// live here, never inline in screens. Signup seeding is handled DB-side by
// handle_new_user() (§3/§6) — no client-side seeding.

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// "Remember me" persistence. The Supabase client always persists the session to
// SecureStore; this flag is the native analog of the web TAB_ALIVE_KEY sentinel
// (CLAUDE.md §4) and is enforced on cold start by enforceRememberMe().
const REMEMBER_ME_KEY = "atlas.rememberMe";

async function setRememberMe(value: boolean): Promise<void> {
  await SecureStore.setItemAsync(REMEMBER_ME_KEY, value ? "true" : "false");
}

async function getRememberMe(): Promise<boolean> {
  // Absent flag → default to remembering (don't surprise-logout existing sessions).
  const stored = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
  return stored !== "false";
}

/**
 * Cold-start guard: if a session is restored but the user opted out of "Remember
 * me", sign them out. Call once before the root layout resolves its session.
 */
export async function enforceRememberMe(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  if (!(await getRememberMe())) {
    await supabase.auth.signOut();
  }
}

interface AuthCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Sign in with email + password; persists the remember-me preference. */
export function useSignIn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ email, password, rememberMe }: AuthCredentials): Promise<void> => {
      await setRememberMe(rememberMe);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success(t("auth.signedIn"));
    },
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/**
 * Sign up with email + password. handle_new_user() seeds entities/obligations and
 * profile defaults DB-side on the auth.users INSERT (§3/§6).
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ email, password, rememberMe }: AuthCredentials): Promise<void> => {
      await setRememberMe(rememberMe);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success(t("auth.accountCreated"));
    },
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}
