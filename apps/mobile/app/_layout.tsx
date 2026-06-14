import "../global.css";

import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Archivo_400Regular } from "@expo-google-fonts/archivo";
import { HankenGrotesk_400Regular } from "@expo-google-fonts/hanken-grotesk";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import type { Session } from "@supabase/supabase-js";
import { I18nProvider } from "@atlas/i18n";
import { supabase, enforceRememberMe } from "@atlas/supabase";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * Auth gate (CLAUDE.md §11.3): redirect signed-out users to /auth and signed-in
 * users away from it. Returns `false` until the initial session is resolved so the
 * splash can be held to avoid a flash of the wrong screen.
 */
function useAuthGate(): boolean {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void (async () => {
      // Cold-start "Remember me" enforcement before we read the session (§4).
      await enforceRememberMe();
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setReady(true);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onAuthScreen = segments[0] === "auth";
    if (!session && !onAuthScreen) {
      router.replace("/auth");
    } else if (session && onAuthScreen) {
      router.replace("/");
    }
  }, [ready, session, segments, router]);

  return ready;
}

export default function RootLayout() {
  // Font family names MUST match the keys in the @atlas/config preset
  // (font-display → "Archivo", font-body → "HankenGrotesk", font-mono → "JetBrainsMono").
  const [fontsLoaded] = useFonts({
    Archivo: Archivo_400Regular,
    HankenGrotesk: HankenGrotesk_400Regular,
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* Default locale "fr" per profiles.language (CLAUDE.md §6); later hydrate
            from the signed-in user's profile. */}
        <I18nProvider initialLocale="fr">
          <RootNavigator fontsLoaded={fontsLoaded} />
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const sessionReady = useAuthGate();
  const ready = fontsLoaded && sessionReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="obligations/[id]" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
