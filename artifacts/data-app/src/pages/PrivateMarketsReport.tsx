import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMarketOverview,
  useGetSecondaryVolume,
  useGetMarketBifurcation,
  useGetMagnificentSeven,
  useGetIpoPipeline,
  useGetSpvBreakdown
} from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, LabelList
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw, Sun, Moon, Download, Printer,
  TrendingUp, TrendingDown, DollarSign, Cpu, Rocket, ShieldCheck
} from "lucide-react";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
  amber: "#f59e0b",
};

const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.red,
  CHART_COLORS.pink,
];

const SECTOR_ICONS: Record<string, any> = {
  "Frontier AI": Cpu,
  "AI Infrastructure": Cpu,
  "Aerospace / Defense": Rocket,
  "Defense Tech": ShieldCheck,
  "Fintech": DollarSign,
};

const DATA_SOURCES: string[] = ["Q1 2026 Private Markets Outlook"];

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
        border: "1px solid #e0e0e0",
        color: "#1a1a1a",
        fontSize: "13px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: "160px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        {payload.length === 1 && payload[0].color && payload[0].color !== "#ffffff" && (
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", backgroundColor: payload[0].color, flexShrink: 0 }} />
        )}
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          {payload.length > 1 && entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#666" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 700 }}>
            {formatter ? formatter(entry.value, entry.name) : (typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px", fontSize: "13px", marginTop: "8px" }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "3px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ opacity: 0.8 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ label, value, subtext, color, trend, loading }: {
  label: string; value: string; subtext?: string; color: string; trend?: "up" | "down" | "neutral"; loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-1 transition-all hover:shadow-md hover:border-primary/20">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-[28px] font-bold leading-tight" style={{ color }}>{value}</span>
      {subtext && (
        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
          {subtext}
        </span>
      )}
    </div>
  );
}

function SectionHeader({ number, title, csvData, csvFilename, isDark, loading }: {
  number: number; title: string; csvData?: any[]; csvFilename?: string; isDark: boolean; loading: boolean;
}) {
  return (
    <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
      <CardTitle className="text-lg flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold" style={{ backgroundColor: CHART_COLORS.blue + "18", color: CHART_COLORS.blue }}>
          {number}
        </span>
        {title}
      </CardTitle>
      {!loading && csvData && csvData.length > 0 && csvFilename && (
        <CSVLink data={csvData} filename={csvFilename} className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
          <Download className="w-3.5 h-3.5" />
        </CSVLink>
      )}
    </CardHeader>
  );
}

export default function PrivateMarketsReport() {
  const queryClient = useQueryClient();
  const [isDark, setIsDark] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const overviewQuery = useGetMarketOverview();
  const secondaryVolumeQuery = useGetSecondaryVolume();
  const spvBreakdownQuery = useGetSpvBreakdown();
  const bifurcationQuery = useGetMarketBifurcation();
  const magSevenQuery = useGetMagnificentSeven();
  const ipoPipelineQuery = useGetIpoPipeline();

  const loading =
    overviewQuery.isLoading || overviewQuery.isFetching ||
    secondaryVolumeQuery.isLoading || secondaryVolumeQuery.isFetching ||
    spvBreakdownQuery.isLoading || spvBreakdownQuery.isFetching ||
    bifurcationQuery.isLoading || bifurcationQuery.isFetching ||
    magSevenQuery.isLoading || magSevenQuery.isFetching ||
    ipoPipelineQuery.isLoading || ipoPipelineQuery.isFetching;

  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleRefresh = async () => {
    await Promise.all([
      overviewQuery.refetch(),
      secondaryVolumeQuery.refetch(),
      spvBreakdownQuery.refetch(),
      bifurcationQuery.refetch(),
      magSevenQuery.refetch(),
      ipoPipelineQuery.refetch(),
    ]);
  };

  const lastRefreshed = overviewQuery.dataUpdatedAt
    ? (() => {
        const d = new Date(overviewQuery.dataUpdatedAt);
        const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
        const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `${time} on ${date}`;
      })()
    : null;

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const overview = overviewQuery.data;
  const secondaryVolume = secondaryVolumeQuery.data || [];
  const spvBreakdown = spvBreakdownQuery.data || [];
  const bifurcation = bifurcationQuery.data || [];
  const magSeven = magSevenQuery.data || [];
  const ipoPipeline = ipoPipelineQuery.data;

  const magSevenComposed = magSeven.map((c) => ({
    ...c,
    growthLabel: `+${c.valuationGrowthSince2023Pct}%`,
  }));

  return (
    <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="pt-2">
            <h1 className="font-bold text-[32px]">Private Markets Q1 2026</h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">State of Private Markets & Secondary Liquidity</p>

            {DATA_SOURCES.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[12px] text-muted-foreground shrink-0">Data Sources:</span>
                {DATA_SOURCES.map((source) => (
                  <span
                    key={source}
                    className="text-[12px] font-bold rounded px-2 py-0.5 truncate print:!bg-[rgb(229,231,235)] print:!text-[rgb(75,85,99)]"
                    title={source}
                    style={{
                      maxWidth: "20ch",
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgb(229, 231, 235)",
                      color: isDark ? "#c8c9cc" : "rgb(75, 85, 99)",
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}

            {lastRefreshed && <p className="text-[12px] text-muted-foreground mt-3">Last refresh: {lastRefreshed}</p>}
          </div>
          <div className="flex items-center gap-3 pt-2 print:hidden">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1 px-2 h-[26px] rounded-[6px] text-[12px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
                color: isDark ? "#c8c9cc" : "#4b5563",
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => window.print()}
              disabled={loading}
              className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
                color: isDark ? "#c8c9cc" : "#4b5563",
              }}
              aria-label="Export as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDark((d) => !d)}
              className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
                color: isDark ? "#c8c9cc" : "#4b5563",
              }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard
            label="Secondary Volume"
            value="$200B"
            subtext="Record high in 2025"
            color={CHART_COLORS.blue}
            trend="up"
            loading={loading && !overview}
          />
          <KpiCard
            label="AI Deal Share"
            value="~40%"
            subtext="of all 2025 deal value"
            color={CHART_COLORS.purple}
            trend="up"
            loading={loading && !overview}
          />
          <KpiCard
            label="Mag 7 Growth"
            value="4x"
            subtext="since 2023"
            color={CHART_COLORS.green}
            trend="up"
            loading={loading && !overview}
          />
          <KpiCard
            label="SPV Market Share"
            value=">50%"
            subtext="surpassed traditional"
            color={CHART_COLORS.amber}
            trend="up"
            loading={loading && !overview}
          />
        </div>

        <Card className="mb-6">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-lg">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {loading && !overview ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : (
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS.blue }} />
                  <span>Secondary transaction volume surpassed <strong>$200B</strong> in 2025, driven by LP-led rebalancing and GP-led continuation vehicles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS.purple }} />
                  <span>The "Private Magnificent 7" (OpenAI, SpaceX, Stripe, Databricks, Anthropic, xAI, Anduril) <strong>quadrupled</strong> in value since 2023.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS.green }} />
                  <span>AI-related investments accounted for <strong>~40%</strong> of all 2025 deal value; SaaS/consumer companies trade at <strong>20-60% discounts</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS.amber }} />
                  <span>Combined SpaceX+OpenAI+Anthropic market cap approaches <strong>$3T</strong>, forcing mega-floats of only 3-8% to avoid crashing markets.</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">

          <Card>
            <SectionHeader number={1} title="Secondary Market Institutionalization" csvData={secondaryVolume} csvFilename="secondary-volume.csv" isDark={isDark} loading={loading && !secondaryVolume.length} />
            <CardContent className="px-6 pb-6">
              {loading && !secondaryVolume.length ? (
                <Skeleton className="w-full h-[320px]" />
              ) : (
                <ResponsiveContainer width="100%" height={320} debounce={0}>
                  <AreaChart data={secondaryVolume} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `$${v}b`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                    <Tooltip
                      content={<CustomTooltip formatter={(v: number) => `$${v}B`} />}
                      isAnimationActive={false}
                      cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }}
                    />
                    <ReferenceLine y={130} stroke={CHART_COLORS.purple} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "2021 Peak Primary Era", position: "insideTopLeft", fill: CHART_COLORS.purple, fontSize: 11, fontWeight: 500 }} />
                    <Area type="monotone" dataKey="volumeB" name="Volume ($B)" stroke={CHART_COLORS.blue} strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" isAnimationActive={false} activeDot={{ r: 5, fill: CHART_COLORS.blue, stroke: '#ffffff', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {!loading && secondaryVolume.length > 0 && (
                <div className="mt-5 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Secondary transaction volume has surged to a record <strong>$200 billion</strong> in 2025, cementing the secondary market's institutionalization. Growth accelerated after the 2022 correction, fueled by LP-led rebalancing and GP-led continuation vehicles.</p>
                  <p>Tender offers are increasingly serving as the "new IPO," allowing companies to provide liquidity without facing the scrutiny and volatility of public markets. The <span style={{ color: CHART_COLORS.purple }}>purple dashed line</span> marks the 2021 peak primary era — secondary volume has now <strong>surpassed it by 54%</strong>.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <SectionHeader number={2} title="SPV Proliferation" csvData={spvBreakdown} csvFilename="spv-breakdown.csv" isDark={isDark} loading={loading && !spvBreakdown.length} />
            <CardContent className="px-6 pb-6">
              {loading && !spvBreakdown.length ? (
                <Skeleton className="w-full h-[320px]" />
              ) : (
                <ResponsiveContainer width="100%" height={320} debounce={0}>
                  <BarChart data={spvBreakdown} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip formatter={(v: number, name: string) => `${v}%`} />} isAnimationActive={false} cursor={false} />
                    <Legend content={<CustomLegend />} />
                    <ReferenceLine y={50} stroke={CHART_COLORS.amber} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "50% Crossover", position: "insideTopRight", fill: CHART_COLORS.amber, fontSize: 11, fontWeight: 500 }} />
                    <Bar dataKey="spvSharePct" name="SPV Share" stackId="a" fill={CHART_COLORS.purple} fillOpacity={0.85} activeBar={{ fillOpacity: 1 }} isAnimationActive={false} radius={[0, 0, 0, 0]}>
                      <LabelList dataKey="spvSharePct" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={(v: number) => `${v}%`} />
                    </Bar>
                    <Bar dataKey="traditionalSharePct" name="Traditional" stackId="a" fill={CHART_COLORS.blue} fillOpacity={0.85} activeBar={{ fillOpacity: 1 }} isAnimationActive={false} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && spvBreakdown.length > 0 && (
                <div className="mt-5 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Special Purpose Vehicles are proliferating rapidly. SPV share of secondary volume climbed from 28% in 2022 to <strong>over 52%</strong> by late 2025, crossing the majority threshold for the first time.</p>
                  <p>This surge is driven by concentrated appetite for best-in-class AI and defense tech companies, where investors prefer single-asset exposure over blind-pool fund commitments. The <span style={{ color: CHART_COLORS.amber }}>50% crossover line</span> marks where SPVs became the dominant deal structure.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <SectionHeader number={3} title="The Great Bifurcation: AI vs. The Rest" csvData={bifurcation} csvFilename="market-bifurcation.csv" isDark={isDark} loading={loading && !bifurcation.length} />
            <CardContent className="px-6 pb-6">
              {loading && !bifurcation.length ? (
                <Skeleton className="w-full h-[360px]" />
              ) : (
                <ResponsiveContainer width="100%" height={380} debounce={0}>
                  <BarChart data={bifurcation} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} domain={[-70, 100]} />
                    <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} width={140} />
                    <Tooltip content={<CustomTooltip formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} />} isAnimationActive={false} cursor={false} />
                    <ReferenceLine x={0} stroke={tickColor} strokeWidth={1.5} strokeOpacity={0.4} />
                    <Bar dataKey="premiumDiscountPct" name="Premium / Discount" isAnimationActive={false} radius={[0, 4, 4, 0]} activeBar={{ fillOpacity: 1 }}>
                      {bifurcation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.premiumDiscountPct >= 0 ? CHART_COLORS.green : CHART_COLORS.red} fillOpacity={0.8} />
                      ))}
                      <LabelList
                        dataKey="premiumDiscountPct"
                        position="right"
                        fontSize={11}
                        fontWeight={600}
                        formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
                        fill={tickColor}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && bifurcation.length > 0 && (
                <div className="mt-5 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>A stark divergence defines current market pricing. Top-tier AI and defense companies command <span className="font-bold" style={{ color: CHART_COLORS.green }}>30-85% premiums</span> over their last primary valuations, reflecting intense scarcity value and insatiable demand.</p>
                  <p>Conversely, 2021-era SaaS and consumer companies trade at <span className="font-bold" style={{ color: CHART_COLORS.red }}>20-60% discounts</span>. The zero line starkly separates the AI-era winners from the rest — creating generational acquisition opportunities for disciplined buyers targeting high-cash-flow assets with strong Rule of 40 fundamentals.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <SectionHeader number={4} title="Private Magnificent 7 Valuations" csvData={magSeven} csvFilename="magnificent-seven.csv" isDark={isDark} loading={loading && !magSeven.length} />
            <CardContent className="px-6 pb-6">
              {loading && !magSeven.length ? (
                <Skeleton className="w-full h-[360px]" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={340} debounce={0}>
                    <ComposedChart data={magSevenComposed} margin={{ top: 30, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="company" tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} domain={[0, 600]} />
                      <Tooltip
                        content={<CustomTooltip formatter={(v: number, name: string) => name.includes("Growth") ? `+${v}%` : `$${v}B`} />}
                        isAnimationActive={false}
                        cursor={false}
                      />
                      <Legend content={<CustomLegend />} />
                      <Bar yAxisId="left" dataKey="valuationB" name="Valuation ($B)" fill={CHART_COLORS.blue} fillOpacity={0.8} activeBar={{ fillOpacity: 1 }} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="valuationB" position="top" fontSize={11} fontWeight={600} fill={tickColor} formatter={(v: number) => `$${v}B`} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="valuationGrowthSince2023Pct" name="Growth since 2023" stroke={CHART_COLORS.purple} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.purple, stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 6, fill: CHART_COLORS.purple, stroke: '#ffffff', strokeWidth: 3 }} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>

                  {magSeven.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {magSeven.map((c) => {
                        const Icon = SECTOR_ICONS[c.sector] || DollarSign;
                        return (
                          <div key={c.company} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold truncate text-[12px]">{c.company}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{c.sector}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              {!loading && magSeven.length > 0 && (
                <div className="mt-5 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Capital concentration is at unprecedented levels. The "Private Magnificent 7" have experienced nearly <strong>4x combined growth</strong> since 2023, with xAI leading at <span style={{ color: CHART_COLORS.purple }}>+500%</span> and OpenAI at <span style={{ color: CHART_COLORS.purple }}>+420%</span>.</p>
                  <p>The <span style={{ color: CHART_COLORS.purple }}>purple line</span> overlaying the bars reveals that while SpaceX commands the highest absolute valuation ($350B), the AI-native companies are growing fastest. These mega-caps are absorbing the majority of marginal private capital deployed by growth and crossover funds.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <SectionHeader number={5} title="The $3 Trillion IPO Stress Test" isDark={isDark} loading={loading && !ipoPipeline} />
            <CardContent className="px-6 pb-6">
              {loading && !ipoPipeline ? (
                <Skeleton className="w-full h-[360px]" />
              ) : ipoPipeline ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <ResponsiveContainer width="100%" height={280} debounce={0}>
                      <PieChart>
                        <Pie
                          data={ipoPipeline.companies}
                          dataKey="valuationB"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={65}
                          cornerRadius={3}
                          paddingAngle={3}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          {ipoPipeline.companies.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip formatter={(v: number) => `$${v}B`} />} isAnimationActive={false} />
                        <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-col gap-3">
                      <div className="p-4 rounded-xl border bg-muted/20">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Combined Market Cap</p>
                        <p className="text-[32px] font-bold leading-tight" style={{ color: CHART_COLORS.blue }}>~$3T</p>
                        <p className="text-[12px] text-muted-foreground mt-1">SpaceX + OpenAI + Anthropic</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border bg-muted/20">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Capital at 15% Float</p>
                          <p className="text-[22px] font-bold" style={{ color: CHART_COLORS.purple }}>${ipoPipeline.totalCapNeededAt15FloatB}B</p>
                        </div>
                        <div className="p-3 rounded-xl border bg-muted/20">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">US IPO Total '16-'25</p>
                          <p className="text-[22px] font-bold" style={{ color: CHART_COLORS.blue }}>${ipoPipeline.historicalUsipoTotalB}B</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border" style={{ borderColor: CHART_COLORS.red + "40", backgroundColor: CHART_COLORS.red + "08" }}>
                        <p className="text-[12px] font-semibold" style={{ color: CHART_COLORS.red }}>Projected Float: Only {ipoPipeline.projectedFloatPctMin}-{ipoPipeline.projectedFloatPctMax}%</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">vs. traditional 15-20% IPO float</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-foreground leading-relaxed">
                    <p>The impending IPOs of SpaceX, OpenAI, and Anthropic represent a systemic market event. With a combined market cap approaching <strong>$3 Trillion</strong>, traditional public offerings are mathematically unfeasible.</p>
                    <p>A standard 15% float would require <strong>${ipoPipeline.totalCapNeededAt15FloatB}B</strong> in capital absorption — nearly matching the <strong>entire decade of US IPOs</strong> (${ipoPipeline.historicalUsipoTotalB}B). This forces highly unconventional {ipoPipeline.projectedFloatPctMin}-{ipoPipeline.projectedFloatPctMax}% "mini-floats," creating an ongoing reliance on structured secondary mechanisms even post-IPO.</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ol className="space-y-4 text-sm text-foreground">
                {[
                  { title: "Target the spread", desc: "Generate alpha by pricing the gap between stale primary marks and dynamic secondary reality.", color: CHART_COLORS.blue },
                  { title: "Build structured liquidity solutions", desc: "Actively participate in GP-led continuations, targeted SPV access, and tender offer mechanics as companies stay private longer.", color: CHART_COLORS.purple },
                  { title: "AI infrastructure underwriting", desc: "Develop precise models for AI infrastructure costs and capacity; prioritize hard-asset plays like CoreWeave and Cerebras over pure software wrappers.", color: CHART_COLORS.green },
                  { title: "Aggressively acquire discounted SaaS", desc: "Capitalize on the current bifurcation to acquire high-cash-flow SaaS assets trading at 20-60% discounts despite strong Rule of 40 fundamentals.", color: CHART_COLORS.amber },
                ].map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: rec.color + "18", color: rec.color }}>
                      {i + 1}
                    </span>
                    <div>
                      <strong>{rec.title}:</strong> {rec.desc}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
