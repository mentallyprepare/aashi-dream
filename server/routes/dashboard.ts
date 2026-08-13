import { count } from "drizzle-orm";
import express from "express";
import { db } from "../db/client.js";
import {
  applications,
  careers,
  ieltsProgress,
  lorContacts,
  productPortfolio,
  profile,
  researchPapers,
  scholarships,
  sopDocuments,
  tasks,
  universities,
} from "../db/schema.js";
import { dateKey, isFutureOrTodayDate, nowIso, todayInIst } from "../lib/time.js";

const router = express.Router();

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const behavioralScienceTargetMatchers = [
  { label: "LSE", region: "UK", route: "Direct behavioural science", match: (name: string) => name.includes("london school of economics") },
  { label: "Warwick", region: "UK", route: "Behavioural + economic science", match: (name: string) => name.includes("warwick") },
  { label: "UCL", region: "UK", route: "Behaviour change", match: (name: string) => name.includes("ucl") || name.includes("university college london") },
  { label: "Erasmus Rotterdam", region: "Netherlands", route: "Behavioural economics", match: (name: string) => name.includes("erasmus") },
  { label: "Carnegie Mellon", region: "USA", route: "Behavioural design / HCI adjacent", match: (name: string) => name.includes("carnegie mellon") },
];

router.get("/kpis", (_request, response) => {
  const profileRow = db.select().from(profile).get();
  const universityRows = db.select().from(universities).all();
  const scholarshipRows = db.select().from(scholarships).all();
  const careerRows = db.select().from(careers).all();
  const taskRows = db.select().from(tasks).all();
  const researchRows = db.select().from(researchPapers).all();
  const sopRows = db.select().from(sopDocuments).all();
  const lorRows = db.select().from(lorContacts).all();
  const applicationRows = db.select().from(applications).all();
  const portfolioRows = db.select().from(productPortfolio).all();
  const ieltsRows = db.select().from(ieltsProgress).all();

  const ieltsTarget = Number(profileRow?.ielts?.target ?? 7.5);
  const bestIelts = Math.max(...ieltsRows.map((row) => Number(row.overall ?? 0)), 0);
  const ieltsReadiness = bestIelts > 0 ? clamp((bestIelts / ieltsTarget) * 100) : 0;
  const researchStrength = clamp(
    researchRows.filter((row) => row.status === "published").length * 30 +
      researchRows.filter((row) => row.status === "submission" || row.status === "under_review").length * 20 +
      researchRows.filter((row) => row.status === "draft").length * 10 +
      Number(profileRow?.achievements?.length ?? 0) * 5,
  );
  const sopReadiness = applicationRows.length ? clamp((sopRows.filter((row) => row.status === "final").length / applicationRows.length) * 100) : 0;
  const lorReadiness = clamp((lorRows.filter((row) => row.status === "submitted").length / Math.max(2, lorRows.length || 2)) * 100);
  const portfolioScore = clamp(portfolioRows.filter((row) => row.status === "active").length * 20 + portfolioRows.filter((row) => row.status === "completed").length * 15);
  const eliteReadiness = clamp(ieltsReadiness * 0.2 + researchStrength * 0.2 + lorReadiness * 0.15 + sopReadiness * 0.1 + 70 * 0.1 + 65 * 0.25);
  const applicationsProgress = applicationRows.length
    ? clamp((applicationRows.filter((row) => ["applied", "interview", "offer", "scholarship", "visa", "finalized"].includes(row.status)).length / applicationRows.length) * 100)
    : 0;

  const upcomingDeadlines = [
    ...applicationRows.map((row) => ({ type: "application", title: row.program, deadline: row.deadline, status: row.status })),
    ...scholarshipRows.map((row) => ({ type: "scholarship", title: row.name, deadline: row.deadline, status: row.status })),
    ...taskRows.map((row) => ({ type: "task", title: row.title, deadline: row.dueDate, status: row.status })),
  ]
    .filter((item) => item.status !== "done" && isFutureOrTodayDate(item.deadline))
    .sort((a, b) => dateKey(a.deadline).localeCompare(dateKey(b.deadline)))
    .slice(0, 10);
  const behavioralScienceTargets = behavioralScienceTargetMatchers.flatMap((target) => {
    const row = universityRows.find((university) => target.match(university.name.toLowerCase()));
    if (!row) return [];
    return [{
      ...row,
      targetLabel: target.label,
      targetRegion: target.region,
      targetRoute: target.route,
      fitScore: Math.round((row.behavioralScienceFit + row.consumerPsychFit + row.pmFit + row.researchFit + row.startupFit) / 5),
    }];
  });

  response.json({
    generatedAt: nowIso(),
    today: todayInIst(),
    timezone: "Asia/Kolkata",
    profile: profileRow,
    kpis: [
      { label: "Elite University Readiness", value: eliteReadiness, suffix: "%", tone: "indigo" },
      { label: "IELTS Readiness", value: ieltsReadiness, suffix: "%", tone: "blue" },
      { label: "Research Strength", value: researchStrength, suffix: "%", tone: "emerald" },
      { label: "SOP Readiness", value: sopReadiness, suffix: "%", tone: "amber" },
      { label: "LOR Readiness", value: lorReadiness, suffix: "%", tone: "violet" },
      { label: "Scholarship Match", value: scholarshipRows.filter((row) => ["medium", "high"].includes(row.winningProbability) && row.status !== "rejected").length, suffix: "", tone: "emerald" },
      { label: "Applications Progress", value: applicationsProgress, suffix: "%", tone: "blue" },
      { label: "Product Portfolio Score", value: portfolioScore, suffix: "%", tone: "indigo" },
    ],
    universityMatches: universityRows
      .map((row) => ({
        ...row,
        fitScore: Math.round((row.behavioralScienceFit + row.consumerPsychFit + row.pmFit + row.researchFit + row.startupFit) / 5),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 5),
    behavioralScienceTargets,
    upcomingDeadlines,
    thisWeeksTasks: taskRows
      .filter((row) => row.status !== "done")
      .sort((a, b) => dateKey(a.dueDate).localeCompare(dateKey(b.dueDate)))
      .slice(0, 8),
    researchProgress: researchRows[0] ?? null,
    careerRecommendations: careerRows.slice(0, 3),
    scholarshipOpportunities: scholarshipRows
      .filter((row) => row.status !== "rejected" && isFutureOrTodayDate(row.deadline))
      .sort((a, b) => dateKey(a.deadline).localeCompare(dateKey(b.deadline)))
      .slice(0, 5),
    counts: {
      universities: db.select({ value: count() }).from(universities).get()?.value ?? 0,
      scholarships: db.select({ value: count() }).from(scholarships).get()?.value ?? 0,
      careers: db.select({ value: count() }).from(careers).get()?.value ?? 0,
    },
  });
});

export default router;
