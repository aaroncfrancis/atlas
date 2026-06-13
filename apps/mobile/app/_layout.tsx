import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Archivo_400Regular } from "@expo-google-fonts/archivo";
import { HankenGrotesk_400Regular } from "@expo-google-fonts/hanken-grotesk";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { I18nProvider } from "@atlas/i18n";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  // Font family names MUST match the keys in the @atlas/config preset
  // (font-display → "Archivo", font-body → "HankenGrotesk", font-mono → "JetBrainsMono").
  const [fontsLoaded] = useFonts({
    Archivo: Archivo_400Regular,
    HankenGrotesk: HankenGrotesk_400Regular,
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* Default locale "fr" per profiles.language (CLAUDE.md §6); later hydrate
            from the signed-in user's profile. */}
        <I18nProvider initialLocale="fr">
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="obligations/[id]" options={{ presentation: "modal" }} />
          </Stack>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
