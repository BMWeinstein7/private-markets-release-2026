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
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sun, Moon, Download, Printer } from "lucide-react";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
};

const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.red,
  CHART_COLORS.pink,
];

const DATA_SOURCES: string[] = ["Q1 2026 Private Markets Outlook"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "10px 14px",
        border: "1px solid #e0e0e0",
        color: "#1a1a1a",
        fontSize: "13px",
      }}
    >
      <div style={{ marginBottom: "6px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
        {payload.length === 1 && payload[0].color && payload[0].color !== "#ffffff" && (
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: payload[0].color, flexShrink: 0 }} />
        )}
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
          {payload.length > 1 && entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#444" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", fontSize: "13px" }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
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

  return (
    <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
      <div className="max-w-[900px] mx-auto">
        {/* ── Header ── */}
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

        {/* ── Executive Summary ── */}
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
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" style={{ backgroundColor: CHART_COLORS.blue }} />
                  <span>Secondary transaction volume surpassed $200B in 2025, driven by LP-led rebalancing and GP-led continuation vehicles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" style={{ backgroundColor: CHART_COLORS.blue }} />
                  <span>The "Private Magnificent 7" (OpenAI, SpaceX, Stripe, Databricks, Anthropic, xAI, Anduril) quadrupled in value since 2023.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" style={{ backgroundColor: CHART_COLORS.blue }} />
                  <span>AI-related investments accounted for ~40% of all 2025 deal value; SaaS/consumer companies trade at 20-60% discounts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" style={{ backgroundColor: CHART_COLORS.blue }} />
                  <span>Combined SpaceX+OpenAI+Anthropic market cap approaches $3T, forcing mega-floats of only 3-8% to avoid crashing markets.</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Section Cards ── */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">1. Secondary Market Institutionalization</CardTitle>
              {!loading && secondaryVolume.length > 0 && (
                <CSVLink data={secondaryVolume} filename="secondary-volume.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading && !secondaryVolume.length ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <ResponsiveContainer width="100%" height={280} debounce={0}>
                  <AreaChart data={secondaryVolume}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `$${v}b`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                    <Area type="monotone" dataKey="volumeB" name="Volume (Billions USD)" stroke={CHART_COLORS.blue} fillOpacity={1} fill="url(#colorVolume)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {!loading && secondaryVolume.length > 0 && (
                <div className="mt-4 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Secondary transaction volume has surged, cementing the secondary market's institutionalization. In 2025, total volume firmly surpassed <strong>$200 billion</strong>, fueled primarily by LP-led rebalancing and an increasing share of GP-led continuation vehicles.</p>
                  <p>Tender offers are increasingly serving as the "new IPO," allowing companies to provide liquidity without facing the scrutiny of public markets. This represents a significant maturity signal for private markets.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">2. SPV Proliferation</CardTitle>
              {!loading && spvBreakdown.length > 0 && (
                <CSVLink data={spvBreakdown} filename="spv-breakdown.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading && !spvBreakdown.length ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <ResponsiveContainer width="100%" height={280} debounce={0}>
                  <BarChart data={spvBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="spvSharePct" name="SPV Share" stackId="a" fill={CHART_COLORS.purple} fillOpacity={0.9} isAnimationActive={false} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="traditionalSharePct" name="Traditional Share" stackId="a" fill={CHART_COLORS.blue} fillOpacity={0.9} isAnimationActive={false} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && spvBreakdown.length > 0 && (
                <div className="mt-4 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Special Purpose Vehicles (SPVs) are proliferating rapidly as investors seek targeted exposure. SPV share of secondary volume climbed from roughly 38% in early 2024 to <strong>over 50%</strong> by late 2025.</p>
                  <p>This surge is largely driven by highly concentrated appetite for the best-in-class AI and defense technology companies, where investors prefer distinct single-asset exposure over blind-pool fund commitments.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">3. The Great Bifurcation: AI vs. The Rest</CardTitle>
              {!loading && bifurcation.length > 0 && (
                <CSVLink data={bifurcation} filename="market-bifurcation.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading && !bifurcation.length ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <ResponsiveContainer width="100%" height={280} debounce={0}>
                  <BarChart data={bifurcation} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis dataKey="sector" type="category" tick={{ fontSize: 12, fill: tickColor, width: 120 }} stroke={tickColor} tickLine={false} axisLine={false} width={120} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                    <Bar dataKey="premiumDiscountPct" name="Premium/Discount vs Last Round" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                      {bifurcation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.premiumDiscountPct >= 0 ? CHART_COLORS.blue : CHART_COLORS.red} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && bifurcation.length > 0 && (
                <div className="mt-4 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>A stark divergence defines current market pricing. Top-tier AI and defense infrastructure companies command <strong>30-85% premiums</strong> over their last primary valuations, reflecting intense scarcity value.</p>
                  <p>Conversely, 2021-era SaaS and consumer companies are consistently trading at <strong>20-60% discounts</strong>. High cash-flowing assets with strong Rule of 40 fundamentals present generational acquisition opportunities for disciplined buyers.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">4. Private Magnificent 7 Valuations</CardTitle>
              {!loading && magSeven.length > 0 && (
                <CSVLink data={magSeven} filename="magnificent-seven.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading && !magSeven.length ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <ResponsiveContainer width="100%" height={280} debounce={0}>
                  <BarChart data={magSeven} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="company" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                    <Bar dataKey="valuationB" name="Valuation (Billions USD)" fill={CHART_COLORS.blue} fillOpacity={0.85} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && magSeven.length > 0 && (
                <div className="mt-4 space-y-2 text-sm text-foreground leading-relaxed">
                  <p>Capital concentration is at unprecedented levels. The "Private Magnificent 7" have experienced nearly <strong>4x combined growth</strong> since 2023.</p>
                  <p>This reflects a heavy tilt towards foundational AI models and aerospace/defense. These mega-caps are absorbing the majority of marginal private capital deployed by growth and crossover funds.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">5. The $3 Trillion IPO Stress Test</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading && !ipoPipeline ? (
                <Skeleton className="w-full h-[280px]" />
              ) : ipoPipeline ? (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                     <ResponsiveContainer width="100%" height={280} debounce={0}>
                      <PieChart>
                        <Pie
                          data={ipoPipeline.companies}
                          dataKey="valuationB"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          cornerRadius={2}
                          paddingAngle={2}
                          isAnimationActive={false}
                          stroke="none"
                        >
                          {ipoPipeline.companies.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 justify-center mb-6">
                    <div className="px-4 py-3 rounded-lg border bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Capital Needed at 15% Float</p>
                      <p className="text-2xl font-bold" style={{ color: CHART_COLORS.purple }}>${ipoPipeline.totalCapNeededAt15FloatB}B</p>
                    </div>
                    <div className="px-4 py-3 rounded-lg border bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total US IPO Cap 2016-2025</p>
                      <p className="text-2xl font-bold" style={{ color: CHART_COLORS.blue }}>${ipoPipeline.historicalUsipoTotalB}B</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-foreground leading-relaxed">
                    <p>The impending IPOs of SpaceX, OpenAI, and Anthropic represent a systemic market event. With a combined market cap approaching <strong>$3 Trillion</strong>, traditional public offerings are mathematically unfeasible.</p>
                    <p>If these companies were to float a standard 15%, the capital required would match the <strong>entire decade of US IPOs</strong>. As a result, we expect highly unconventional 3-8% "mini-floats" to avoid crushing public market liquidity, creating an ongoing reliance on structured secondary mechanisms even post-IPO.</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* ── Recommendations ── */}
          <Card>
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
                <li><strong>Target the spread:</strong> Generate alpha by pricing the gap between stale primary marks and dynamic secondary reality.</li>
                <li><strong>Build structured liquidity solutions:</strong> Actively participate in GP-led continuations, targeted SPV access, and tender offer mechanics as companies stay private longer.</li>
                <li><strong>AI infrastructure underwriting:</strong> Develop precise models for AI infrastructure costs and capacity; prioritize hard-asset plays like CoreWeave and Cerebras over pure software wrappers.</li>
                <li><strong>Aggressively acquire discounted SaaS:</strong> Capitalize on the current bifurcation to acquire high-cash-flow SaaS assets trading at 20-60% discounts despite strong Rule of 40 fundamentals.</li>
              </ol>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
