import { Tabs } from "expo-router";
import { Boxes, Calendar, House, Settings, Wallet } from "lucide-react-native";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colorTokens.primary,
        tabBarInactiveTintColor: colorTokens.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("nav.calendar"),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: t("nav.budget"),
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="entities"
        options={{
          title: t("nav.entities"),
          tabBarIcon: ({ color, size }) => <Boxes color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
