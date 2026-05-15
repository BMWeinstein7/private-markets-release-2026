import { Router, type IRouter } from "express";
import {
  GetMarketOverviewResponse,
  GetSecondaryVolumeResponse,
  GetMarketBifurcationResponse,
  GetMagnificentSevenResponse,
  GetIpoPipelineResponse,
  GetSpvBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/market/overview", async (_req, res): Promise<void> => {
  const overview = GetMarketOverviewResponse.parse({
    secondaryVolumeB: 226,
    aiDealSharePct: 55,
    spvSharePct: 58,
    megaCapValuationT: 3,
    saasDiscountPctMin: 22,
    saasDiscountPctMax: 52,
    valuationGrowthSince2023x: 18,
  });
  res.json(overview);
});

router.get("/market/secondary-volume", async (_req, res): Promise<void> => {
  const data = GetSecondaryVolumeResponse.parse([
    { year: "2019", volumeB: 45, label: null },
    { year: "2020", volumeB: 60, label: null },
    { year: "2021", volumeB: 130, label: "Peak Primary Era" },
    { year: "2022", volumeB: 108, label: null },
    { year: "2023", volumeB: 114, label: null },
    { year: "2024", volumeB: 160, label: null },
    { year: "2025", volumeB: 226, label: "Record (+42% YoY)" },
    { year: "2026E", volumeB: 250, label: "William Blair Forecast" },
  ]);
  res.json(data);
});

router.get("/market/bifurcation", async (_req, res): Promise<void> => {
  const data = GetMarketBifurcationResponse.parse([
    { sector: "Cerebras (IPO Day-1)", premiumDiscountPct: 89, category: "premium" },
    { sector: "OpenAI", premiumDiscountPct: 184, category: "premium" },
    { sector: "Anthropic", premiumDiscountPct: 137, category: "premium" },
    { sector: "SpaceX", premiumDiscountPct: 95, category: "premium" },
    { sector: "Databricks", premiumDiscountPct: 35, category: "premium" },
    { sector: "Anduril", premiumDiscountPct: 30, category: "premium" },
    { sector: "Stripe", premiumDiscountPct: 12, category: "premium" },
    { sector: "Fintech Avg", premiumDiscountPct: -22, category: "discount" },
    { sector: "Enterprise SaaS Avg", premiumDiscountPct: -32, category: "discount" },
    { sector: "Consumer Apps Avg", premiumDiscountPct: -42, category: "discount" },
    { sector: "Late-Stage SaaS (2021 cohort)", premiumDiscountPct: -52, category: "discount" },
  ]);
  res.json(data);
});

router.get("/market/magnificent-seven", async (_req, res): Promise<void> => {
  const data = GetMagnificentSevenResponse.parse([
    { company: "SpaceX + xAI", valuationB: 1750, sector: "Aerospace / Defense", valuationGrowthSince2023Pct: 1900 },
    { company: "OpenAI", valuationB: 852, sector: "Frontier AI", valuationGrowthSince2023Pct: 1850 },
    { company: "Anthropic", valuationB: 380, sector: "Frontier AI", valuationGrowthSince2023Pct: 2950 },
    { company: "Databricks", valuationB: 100, sector: "AI Infrastructure", valuationGrowthSince2023Pct: 350 },
    { company: "Stripe", valuationB: 92, sector: "Fintech", valuationGrowthSince2023Pct: 190 },
    { company: "Cerebras (IPO)", valuationB: 66, sector: "AI Infrastructure", valuationGrowthSince2023Pct: 720 },
    { company: "Anduril", valuationB: 31, sector: "Defense Tech", valuationGrowthSince2023Pct: 320 },
  ]);
  res.json(data);
});

router.get("/market/ipo-pipeline", async (_req, res): Promise<void> => {
  const data = GetIpoPipelineResponse.parse({
    companies: [
      { name: "SpaceX (filed Apr 2026)", valuationB: 1750 },
      { name: "OpenAI", valuationB: 852 },
      { name: "Anthropic", valuationB: 380 },
    ],
    totalCapNeededAt15FloatB: 447,
    projectedFloatPctMin: 3,
    projectedFloatPctMax: 5,
    historicalUsipoTotalB: 410,
  });
  res.json(data);
});

router.get("/market/spv-breakdown", async (_req, res): Promise<void> => {
  const data = GetSpvBreakdownResponse.parse([
    { year: "2022", spvSharePct: 28, traditionalSharePct: 72 },
    { year: "2023", spvSharePct: 35, traditionalSharePct: 65 },
    { year: "2024 H1", spvSharePct: 38, traditionalSharePct: 62 },
    { year: "2024 H2", spvSharePct: 44, traditionalSharePct: 56 },
    { year: "2025 H1", spvSharePct: 48, traditionalSharePct: 52 },
    { year: "2025 H2", spvSharePct: 55, traditionalSharePct: 45 },
    { year: "Q1 2026", spvSharePct: 58, traditionalSharePct: 42 },
  ]);
  res.json(data);
});

export default router;
