import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { entityColor, formatAmount, type Obligation } from "@atlas/core";
import { useEntities, useObligations } from "@atlas/supabase";
import { EntityIcon, localeTag } from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";

type Period = "month" | "week";

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isPlanned(o: Obligation): boolean {
  return o.status === "open" || o.status === "snoozed";
}
function isPaid(o: Obligation): boolean {
  return o.status === "done" || o.status === "automated";
}
function inRange(iso: string | null, start: Date, end: Date): boolean {
  if (iso === null) return false;
  const k = iso.slice(0, 10);
  return k >= ymd(start) && k < ymd(end);
}

export default function BudgetScreen() {
  const { t, locale } = useTranslation();
  const { data: obligations = [] } = useObligations();
  const { data: entities = [] } = useEntities();

  const [period, setPeriod] = useState<Period>("month");
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [trendRange, setTrendRange] = useState<6 | 12>(6);

  const tag = localeTag(locale);
  const money = (n: number) => formatAmount(n, "CAD", tag) ?? "$0";

  const periodStart = period === "month" ? startOfMonth(anchor) : startOfWeekMonday(anchor);
  const periodEnd = period === "month" ? addMonths(periodStart, 1) : addDays(periodStart, 7);

  const totals = useMemo(() => {
    let planned = 0;
    let paid = 0;
    for (const o of obligations) {
      const amount = o.amount ?? 0;
      if (isPlanned(o) && inRange(o.due_date, periodStart, periodEnd)) planned += amount;
      if (isPaid(o) && inRange(o.resolved_at, periodStart, periodEnd)) paid += amount;
    }
    return { planned, paid, committed: planned + paid };
  }, [obligations, periodStart, periodEnd]);

  const byEntity = useMemo(() => {
    const rows = entities.map((entity) => {
      let planned = 0;
      let paid = 0;
      for (const o of obligations) {
        if (o.entity_id !== entity.id) continue;
        const amount = o.amount ?? 0;
        if (isPlanned(o) && inRange(o.due_date, periodStart, periodEnd)) planned += amount;
        if (isPaid(o) && inRange(o.resolved_at, periodStart, periodEnd)) paid += amount;
      }
      return { entity, planned, paid, total: planned + paid };
    });
    return rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
  }, [entities, obligations, periodStart, periodEnd]);

  const maxEntity = Math.max(1, ...byEntity.map((r) => r.total));

  const trend = useMemo(() => {
    const months = Array.from({ length: trendRange }, (_, i) =>
      addMonths(startOfMonth(new Date()), -(trendRange - 1 - i)),
    );
    const bars = months.map((start) => {
      const end = addMonths(start, 1);
      let planned = 0;
      let paid = 0;
      for (const o of obligations) {
        const amount = o.amount ?? 0;
        if (isPlanned(o) && inRange(o.due_date, start, end)) planned += amount;
        if (isPaid(o) && inRange(o.resolved_at, start, end)) paid += amount;
      }
      return {
        key: ymd(start),
        label: start.toLocaleDateString(tag, { month: "short" }),
        planned,
        paid,
        total: planned + paid,
      };
    });
    const max = Math.max(1, ...bars.map((b) => b.total));
    const avg = bars.reduce((s, b) => s + b.total, 0) / Math.max(1, bars.length);
    return { bars, max, avg };
  }, [obligations, trendRange, tag]);

  const periodLabel =
    period === "month"
      ? periodStart.toLocaleDateString(tag, { month: "long", year: "numeric" })
      : `${periodStart.toLocaleDateString(tag, { month: "short", day: "numeric" })} – ${addDays(periodStart, 6).toLocaleDateString(tag, { month: "short", day: "numeric" })}`;

  function navigate(dir: -1 | 1) {
    setAnchor((a) => (period === "month" ? addMonths(a, dir) : addDays(a, dir * 7)));
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-4 pb-2 pt-2">
        <Text className="font-display text-2xl text-foreground">{t("bud.title")}</Text>
        <Text className="font-body text-sm text-muted">{t("bud.subtitle")}</Text>
      </View>

      <View className="flex-row items-center justify-between px-4 pb-2">
        <View className="flex-row rounded-xl border border-border bg-card p-0.5">
          {(["month", "week"] as Period[]).map((p) => (
            <Pressable
              key={p}
              accessibilityRole="button"
              onPress={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 ${period === p ? "bg-teal" : ""}`}
            >
              <Text className={`font-body text-sm ${period === p ? "text-card" : "text-secondary"}`}>
                {t(p === "month" ? "bud.periodMonth" : "bud.periodWeek")}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable accessibilityRole="button" onPress={() => navigate(-1)} className="p-1.5">
            <ChevronLeft size={20} color={colorTokens.foreground} />
          </Pressable>
          <Text className="font-body text-sm text-foreground">{periodLabel}</Text>
          <Pressable accessibilityRole="button" onPress={() => navigate(1)} className="p-1.5">
            <ChevronRight size={20} color={colorTokens.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-12">
        {/* KPI cards */}
        <View className="flex-row gap-3">
          <KpiCard label={t("bud.planned")} value={money(totals.planned)} accent={colorTokens.primary} />
          <KpiCard label={t("bud.paid")} value={money(totals.paid)} accent={colorTokens.green} />
          <KpiCard label={t("bud.committed")} value={money(totals.committed)} accent={colorTokens.navy} />
        </View>

        <Legend />

        {/* By entity */}
        <Text className="mb-2 mt-4 font-body text-xs uppercase tracking-wide text-secondary">
          {t("bud.byEntity")}
        </Text>
        {byEntity.length === 0 ? (
          <Text className="py-6 text-center font-body text-muted">{t("bud.noSpend")}</Text>
        ) : (
          <View className="gap-2.5">
            {byEntity.map(({ entity, planned, paid, total }) => {
              const color = entityColor(entity);
              return (
                <View key={entity.id} className="rounded-2xl border border-border bg-card p-3">
                  <View className="mb-2 flex-row items-center gap-2">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}1A` }}
                    >
                      <EntityIcon icon={entity.icon} type={entity.type} color={color} size={14} />
                    </View>
                    <Text className="flex-1 font-display text-sm text-foreground" numberOfLines={1}>
                      {entity.name}
                    </Text>
                    <Text className="font-mono text-sm text-foreground">{money(total)}</Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-muted/10">
                    <View
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(total / maxEntity) * 100}%` }}
                    />
                  </View>
                  <Text className="mt-1 font-body text-xs text-muted">
                    {t("bud.planned")} {money(planned)} · {t("bud.paid")} {money(paid)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Spend trend */}
        <View className="mb-2 mt-5 flex-row items-center justify-between">
          <Text className="font-body text-xs uppercase tracking-wide text-secondary">
            {t("bud.spendTrend")}
          </Text>
          <View className="flex-row rounded-lg border border-border bg-card p-0.5">
            {([6, 12] as const).map((r) => (
              <Pressable
                key={r}
                accessibilityRole="button"
                onPress={() => setTrendRange(r)}
                className={`rounded-md px-2 py-1 ${trendRange === r ? "bg-teal" : ""}`}
              >
                <Text className={`font-body text-xs ${trendRange === r ? "text-card" : "text-secondary"}`}>
                  {t(r === 6 ? "bud.6mo" : "bud.12mo")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text className="mb-2 font-body text-xs text-muted">
          {t("bud.avgMonth", { amount: money(trend.avg) })}
        </Text>

        <View className="rounded-2xl border border-border bg-card p-3">
          <View className="h-36 flex-row items-end gap-1">
            {trend.bars.map((bar) => {
              const plannedH = (bar.planned / trend.max) * 100;
              const paidH = (bar.paid / trend.max) * 100;
              return (
                <View key={bar.key} className="flex-1 items-center justify-end">
                  <View className="w-full flex-1 justify-end overflow-hidden rounded-md">
                    <View className="w-full bg-primary" style={{ height: `${plannedH}%` }} />
                    <View className="w-full bg-green" style={{ height: `${paidH}%` }} />
                  </View>
                  <Text className="mt-1 font-body text-[10px] text-muted">{bar.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
      <View className="mb-1 h-1 w-6 rounded-full" style={{ backgroundColor: accent }} />
      <Text className="font-body text-xs text-muted">{label}</Text>
      <Text className="font-display text-base text-foreground" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Legend() {
  const { t } = useTranslation();
  return (
    <View className="mt-3 flex-row gap-4">
      <View className="flex-row items-center gap-1.5">
        <View className="h-2.5 w-2.5 rounded-sm bg-primary" />
        <Text className="font-body text-xs text-secondary">{t("bud.planned")}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <View className="h-2.5 w-2.5 rounded-sm bg-green" />
        <Text className="font-body text-xs text-secondary">{t("bud.paid")}</Text>
      </View>
    </View>
  );
}
