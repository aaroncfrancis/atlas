import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { useSignIn, useSignUp } from "@atlas/supabase";

type Mode = "signIn" | "signUp";

const MIN_PASSWORD_LENGTH = 6;

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useSignIn();
  const signUp = useSignUp();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const pending = signIn.isPending || signUp.isPending;

  function submit() {
    const trimmedEmail = email.trim();
    if (trimmedEmail === "" || password === "") {
      setLocalError(t("auth.errorMissingFields"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(t("auth.errorPasswordTooShort"));
      return;
    }
    setLocalError(null);

    const credentials = { email: trimmedEmail, password, rememberMe };
    const action = mode === "signIn" ? signIn : signUp;
    action.mutate(credentials, {
      onSuccess: () => router.replace("/"),
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-2 font-display text-3xl text-foreground">Atlas</Text>

          {/* Mode toggle */}
          <View className="mb-8 mt-6 flex-row rounded-xl border border-border bg-card p-1">
            {(["signIn", "signUp"] as const).map((value) => {
              const active = mode === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setMode(value);
                    setLocalError(null);
                  }}
                  className={`flex-1 items-center rounded-lg py-2 ${active ? "bg-teal" : ""}`}
                >
                  <Text
                    className={`font-body text-sm ${active ? "text-card" : "text-secondary"}`}
                  >
                    {t(value === "signIn" ? "auth.signInTab" : "auth.signUpTab")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Email */}
          <Text className="mb-2 font-body text-sm text-secondary">{t("auth.email")}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("auth.emailPlaceholder")}
            placeholderTextColor={colorTokens.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!pending}
            className="mb-5 rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground"
          />

          {/* Password */}
          <Text className="mb-2 font-body text-sm text-secondary">{t("auth.password")}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={colorTokens.textMuted}
            autoCapitalize="none"
            secureTextEntry
            editable={!pending}
            className="mb-5 rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground"
          />

          {/* Remember me */}
          <Pressable
            onPress={() => setRememberMe((prev) => !prev)}
            className="mb-5 flex-row items-center"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
          >
            <View
              className={`mr-3 h-5 w-5 items-center justify-center rounded border ${
                rememberMe ? "border-teal bg-teal" : "border-border bg-card"
              }`}
            >
              {rememberMe ? <Check size={14} color={colorTokens.card} /> : null}
            </View>
            <Text className="font-body text-sm text-foreground">{t("auth.rememberMe")}</Text>
          </Pressable>

          {/* Inline error (iOS toast is a console stub — keep visible feedback) */}
          {localError !== null ? (
            <Text className="mb-4 font-body text-sm text-overdue">{localError}</Text>
          ) : null}

          {/* Primary CTA */}
          <Pressable
            onPress={submit}
            disabled={pending}
            className={`items-center rounded-xl bg-teal py-4 ${pending ? "opacity-60" : ""}`}
          >
            <Text className="font-body text-base text-card">
              {pending
                ? t("auth.loading")
                : t(mode === "signIn" ? "auth.signInCta" : "auth.signUpCta")}
            </Text>
          </Pressable>

          {/* Mode switch link */}
          <Pressable
            onPress={() => {
              setMode((prev) => (prev === "signIn" ? "signUp" : "signIn"));
              setLocalError(null);
            }}
            className="mt-6 items-center"
          >
            <Text className="font-body text-sm text-primary">
              {t(mode === "signIn" ? "auth.switchToSignUp" : "auth.switchToSignIn")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
