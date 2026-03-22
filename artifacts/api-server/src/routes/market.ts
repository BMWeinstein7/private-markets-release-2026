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
    secondaryVolumeB: 200,
    aiDealSharePct: 40,
    spvSharePct: 50,
    megaCapValuationT: 3,
    saasDiscountPctMin: 20,
    saasDiscountPctMax: 60,
    valuationGrowthSince2023x: 4,
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
    { year: "2025", volumeB: 200, label: "Record High" },
  ]);
  res.json(data);
});

router.get("/market/bifurcation", async (_req, res): Promise<void> => {
  const data = GetMarketBifurcationResponse.parse([
    { sector: "OpenAI", premiumDiscountPct: 85, category: "premium" },
    { sector: "SpaceX", premiumDiscountPct: 72, category: "premium" },
    { sector: "Anthropic", premiumDiscountPct: 68, category: "premium" },
    { sector: "xAI", premiumDiscountPct: 55, category: "premium" },
    { sector: "Anduril", premiumDiscountPct: 42, category: "premium" },
    { sector: "Databricks", premiumDiscountPct: 30, category: "premium" },
    { sector: "Stripe", premiumDiscountPct: 15, category: "premium" },
    { sector: "Fintech Avg", premiumDiscountPct: -25, category: "discount" },
    { sector: "Enterprise SaaS Avg", premiumDiscountPct: -35, category: "discount" },
    { sector: "Consumer Apps Avg", premiumDiscountPct: -45, category: "discount" },
    { sector: "Late-Stage SaaS (2021 cohort)", premiumDiscountPct: -55, category: "discount" },
  ]);
  res.json(data);
});

router.get("/market/magnificent-seven", async (_req, res): Promise<void> => {
  const data = GetMagnificentSevenResponse.parse([
    { company: "SpaceX", valuationB: 350, sector: "Aerospace / Defense", valuationGrowthSince2023Pct: 300 },
    { company: "OpenAI", valuationB: 300, sector: "Frontier AI", valuationGrowthSince2023Pct: 420 },
    { company: "Anthropic", valuationB: 60, sector: "Frontier AI", valuationGrowthSince2023Pct: 380 },
    { company: "Databricks", valuationB: 62, sector: "AI Infrastructure", valuationGrowthSince2023Pct: 180 },
    { company: "Stripe", valuationB: 70, sector: "Fintech", valuationGrowthSince2023Pct: 120 },
    { company: "xAI", valuationB: 50, sector: "Frontier AI", valuationGrowthSince2023Pct: 500 },
    { company: "Anduril", valuationB: 28, sector: "Defense Tech", valuationGrowthSince2023Pct: 280 },
  ]);
  res.json(data);
});

router.get("/market/ipo-pipeline", async (_req, res): Promise<void> => {
  const data = GetIpoPipelineResponse.parse({
    companies: [
      { name: "SpaceX", valuationB: 350 },
      { name: "OpenAI", valuationB: 300 },
      { name: "Anthropic", valuationB: 60 },
    ],
    totalCapNeededAt15FloatB: 400,
    projectedFloatPctMin: 3,
    projectedFloatPctMax: 8,
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
    { year: "2025 H2", spvSharePct: 52, traditionalSharePct: 48 },
  ]);
  res.json(data);
});

export default router;
