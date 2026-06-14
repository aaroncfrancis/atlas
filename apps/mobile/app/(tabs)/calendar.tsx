import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  entityColor,
  formatAmount,
  proximity,
  type Entity,
  type Obligation,
} from "@atlas/core";
import { useEntities, useObligationActions, useObligations } from "@atlas/supabase";
import {
  EntityIcon,
  ObligationDialog,
  localeTag,
  proximityColor,
} from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";

type ViewMode = "week" | "month";

// --- local date helpers (presentation; calendar grids are timezone-local) ---
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  return addDays(x, -((x.getDay() + 6) % 7));
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarScreen() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { data: obligations = [] } = useObligations();
  const { data: entities = [] } = useEntities();
  const actions = useObligationActions();

  const [mode, setMode] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [filter, setFilter] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string>(() => ymd(new Date()));
  const [dialog, setDialog] = useState<Obligation | null>(null);

  const tag = localeTag(locale);
  const todayKey = ymd(new Date());

  // Period bounds.
  const periodStart = mode === "week" ? startOfWeekMonday(anchor) : startOfMonth(anchor);
  const periodEnd = mode === "week" ? addDays(periodStart, 7) : addMonths(periodStart, 1);

  // Filter by entity then index by due day.
  const visible = useMemo(
    () =>
      obligations.filter((o) => {
        if (o.due_date === null) return false;
        if (filter.size === 0) return true;
        return o.entity_id !== null && filter.has(o.entity_id);
      }),
    [obligations, filter],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Obligation[]>();
    for (const o of visible) {
      if (o.due_date === null) continue;
      const key = o.due_date.slice(0, 10);
      const bucket = map.get(key);
      if (bucket) bucket.push(o);
      else map.set(key, [o]);
    }
    return map;
  }, [visible]);

  const entityFor = (o: Obligation): Entity | null =>
    entities.find((e) => e.id === o.entity_id) ?? null;

  // Period summary.
  const summary = useMemo(() => {
    const inPeriod = visible.filter((o) => {
      const k = o.due_date?.slice(0, 10);
      return k !== undefined && k >= ymd(periodStart) && k < ymd(periodEnd);
    });
    const total = inPeriod.reduce((sum, o) => sum + (o.amount ?? 0), 0);
    const attention = inPeriod.filter((o) => {
      const p = proximity(o.due_date);
      return p === "overdue" || p === "soon";
    }).length;
    return { count: inPeriod.length, total, attention };
  }, [visible, periodStart, periodEnd]);

  function navigate(dir: -1 | 1) {
    setAnchor((a) => (mode === "week" ? addDays(a, dir * 7) : addMonths(a, dir)));
  }

  const weekdayLabels = useMemo(() => {
    const monday = startOfWeekMonday(new Date());
    return Array.from({ length: 7 }, (_, i) =>
      addDays(monday, i).toLocaleDateString(tag, { weekday: "short" }),
    );
  }, [tag]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-4 pb-2 pt-2">
        <Text className="font-display text-2xl text-foreground">{t("cal.title")}</Text>
        <Text className="font-body text-sm text-muted">{t("cal.subtitle")}</Text>
      </View>

      {/* View toggle + navigation */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        <View className="flex-row rounded-xl border border-border bg-card p-0.5">
          {(["week", "month"] as ViewMode[]).map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 ${mode === m ? "bg-teal" : ""}`}
            >
              <Text className={`font-body text-sm ${mode === m ? "text-card" : "text-secondary"}`}>
                {t(m === "week" ? "cal.week" : "cal.month")}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable accessibilityRole="button" onPress={() => navigate(-1)} className="p-1.5">
            <ChevronLeft size={20} color={colorTokens.foreground} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAnchor(startOfDay(new Date()))}
            className="rounded-lg border border-border px-2.5 py-1"
          >
            <Text className="font-body text-sm text-foreground">{t("cal.today")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigate(1)} className="p-1.5">
            <ChevronRight size={20} color={colorTokens.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Entity filter */}
      <View className="pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4">
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter(new Set())}
            className={`rounded-full border px-3 py-1 ${filter.size === 0 ? "border-teal bg-teal" : "border-border bg-card"}`}
          >
            <Text className={`font-body text-xs ${filter.size === 0 ? "text-card" : "text-secondary"}`}>
              {t("common.all")}
            </Text>
          </Pressable>
          {entities.map((e) => {
            const active = filter.has(e.id);
            const color = entityColor(e);
            return (
              <Pressable
                key={e.id}
                accessibilityRole="button"
                onPress={() =>
                  setFilter((prev) => {
                    const next = new Set(prev);
                    if (next.has(e.id)) next.delete(e.id);
                    else next.add(e.id);
                    return next;
                  })
                }
                className="flex-row items-center gap-1 rounded-full border px-3 py-1"
                style={{ backgroundColor: active ? `${color}1A` : colorTokens.card, borderColor: active ? color : colorTokens.border }}
              >
                <EntityIcon icon={e.icon} type={e.type} color={color} size={12} />
                <Text className="font-body text-xs text-secondary">{e.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-40">
        {mode === "week"
          ? Array.from({ length: 7 }, (_, i) => addDays(periodStart, i)).map((day) => {
              const key = ymd(day);
              const items = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              return (
                <View
                  key={key}
                  className={`mb-2 rounded-2xl border bg-card p-3 ${isToday ? "border-primary" : "border-border"}`}
                >
                  <View className="mb-1 flex-row items-baseline gap-2">
                    <Text className={`font-display text-base ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day.toLocaleDateString(tag, { weekday: "short", day: "numeric" })}
                    </Text>
                  </View>
                  {items.length === 0 ? null : (
                    <View className="gap-1.5">
                      {items.map((o) => (
                        <DayPill key={o.id} obligation={o} entity={entityFor(o)} onPress={setDialog} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          : (
            <MonthGrid
              periodStart={periodStart}
              byDay={byDay}
              weekdayLabels={weekdayLabels}
              todayKey={todayKey}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              entityFor={entityFor}
              onPressObligation={setDialog}
              monthIndex={periodStart.getMonth()}
            />
          )}
      </ScrollView>

      {/* Period summary */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-border bg-card/95 px-5 py-3">
        <Text className="font-body text-xs text-secondary">
          {summary.count} {t("cal.sumItems")}
        </Text>
        <Text className="font-display text-base text-navy">
          {formatAmount(summary.total, "CAD", tag)} {t("cal.sumDue")}
        </Text>
        <Text className="font-body text-xs text-overdue">
          {summary.attention} {t("cal.sumAttention")}
        </Text>
      </View>

      <ObligationDialog
        obligation={dialog}
        entity={dialog ? entityFor(dialog) : null}
        actions={actions}
        onEdit={(o) => router.push(`/obligations/${o.id}`)}
        onViewEntity={(eid) => router.push(`/entities/${eid}`)}
        onClose={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

function DayPill({
  obligation,
  entity,
  onPress,
}: {
  obligation: Obligation;
  entity: Entity | null;
  onPress: (o: Obligation) => void;
}) {
  const color = entityColor(entity);
  const stripe = proximityColor[proximity(obligation.due_date)];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(obligation)}
      className="flex-row items-center gap-2 overflow-hidden rounded-lg bg-background pr-2"
    >
      <View style={{ width: 3, alignSelf: "stretch", backgroundColor: stripe }} />
      <EntityIcon icon={entity?.icon} type={entity?.type} color={color} size={14} />
      <Text className="flex-1 py-1.5 font-body text-xs text-foreground" numberOfLines={1}>
        {obligation.title}
      </Text>
    </Pressable>
  );
}

function MonthGrid({
  periodStart,
  byDay,
  weekdayLabels,
  todayKey,
  selectedDay,
  onSelectDay,
  entityFor,
  onPressObligation,
  monthIndex,
}: {
  periodStart: Date;
  byDay: Map<string, Obligation[]>;
  weekdayLabels: string[];
  todayKey: string;
  selectedDay: string;
  onSelectDay: (key: string) => void;
  entityFor: (o: Obligation) => Entity | null;
  onPressObligation: (o: Obligation) => void;
  monthIndex: number;
}) {
  const gridStart = startOfWeekMonday(periodStart);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const selectedItems = byDay.get(selectedDay) ?? [];

  return (
    <View>
      <View className="flex-row">
        {weekdayLabels.map((label) => (
          <View key={label} className="flex-1 items-center py-1">
            <Text className="font-body text-[10px] uppercase text-muted">{label}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {cells.map((day) => {
          const key = ymd(day);
          const items = byDay.get(key) ?? [];
          const inMonth = day.getMonth() === monthIndex;
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => onSelectDay(key)}
              style={{ width: `${100 / 7}%` }}
              className={`h-14 items-center justify-start border p-1 ${isSelected ? "border-teal" : isToday ? "border-primary" : "border-border"} ${inMonth ? "bg-card" : "bg-background"}`}
            >
              <Text className={`font-body text-xs ${inMonth ? "text-foreground" : "text-muted"}`}>
                {day.getDate()}
              </Text>
              <View className="mt-1 flex-row gap-0.5">
                {items.slice(0, 3).map((o) => (
                  <View
                    key={o.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: proximityColor[proximity(o.due_date)] }}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedItems.length > 0 ? (
        <View className="mt-3 gap-1.5">
          {selectedItems.map((o) => (
            <DayPill key={o.id} obligation={o} entity={entityFor(o)} onPress={onPressObligation} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
