import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { scholarships } from "./schema.js";
import { nowIso } from "../lib/time.js";

const now = nowIso();

type ScholarshipPatch = {
  country: string;
  type: string;
  amountUsd: number | null;
  deadline: string;
  eligibilitySummary: string;
  url: string;
  winningProbability: "low" | "medium" | "high";
  notes: string;
};

const patches: Record<string, ScholarshipPatch> = {
  Chevening: {
    country: "UK",
    type: "government",
    amountUsd: 55000,
    deadline: "2026-10-07",
    eligibilitySummary: "Fully funded UK scholarship for future leaders. 2026/27 India applications are closed; date is next-cycle planning estimate based on the official 2026/27 timeline.",
    url: "https://www.chevening.org/scholarship/india/",
    winningProbability: "medium",
    notes: "Official 2026/27 cycle closed on 7 Oct 2025. Build leadership essays, 2 references, and UK course shortlist before the next opening.",
  },
  "LSE Graduate Support Scheme": {
    country: "UK",
    type: "need",
    amountUsd: 18000,
    deadline: "2027-04-23",
    eligibilitySummary: "Need-based LSE support for taught master's applicants. You normally access it after submitting the LSE admission application through the Graduate Applicant Portal.",
    url: "https://www.lse.ac.uk/study-at-lse/Graduate/fees-and-funding/secure/graduate-support-scheme",
    winningProbability: "medium",
    notes: "LSE says funding is limited and recommends applying as soon as possible. For 2026 entry, the GSS deadline was 23 Apr 2026 and applicants needed an offer by then.",
  },
  "UCL India Excellence Scholarship": {
    country: "UK",
    type: "merit",
    amountUsd: 6300,
    deadline: "2027-02-26",
    eligibilitySummary: "For India-domiciled postgraduate taught applicants with an outstanding academic record and eligible institution background. Next-cycle date is an estimate from the 2026 deadline.",
    url: "https://www.ucl.ac.uk/scholarships/ucl-india-excellence-scholarship",
    winningProbability: "medium",
    notes: "2026 deadline was 26 Feb 2026. This is a strong UCL-specific target if GPA/class rank is strong.",
  },
  "GREAT Scholarships": {
    country: "UK",
    type: "merit",
    amountUsd: 12500,
    deadline: "2027-04-30",
    eligibilitySummary: "UK university-specific GREAT awards for Indian postgraduate applicants. Deadlines vary by institution.",
    url: "https://www.britishcouncil.in/study-uk/scholarships/great-scholarships",
    winningProbability: "high",
    notes: "British Council says deadlines vary by institution. Track each target university separately once shortlist is final.",
  },
  "Commonwealth Master's Scholarship": {
    country: "UK",
    type: "government",
    amountUsd: 52000,
    deadline: "2026-10-20",
    eligibilitySummary: "Commonwealth route for eligible candidates from Commonwealth countries. Highly competitive and usually needs strong development impact framing.",
    url: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    winningProbability: "medium",
    notes: "Use psychology + student mental health + Mentally Prepare as development/social impact proof. Verify India nominating route each cycle.",
  },
  "DAAD Master's Scholarships": {
    country: "Germany",
    type: "government",
    amountUsd: 24000,
    deadline: "2026-10-31",
    eligibilitySummary: "DAAD master's scholarships vary by programme and country. Use the DAAD database for the exact India route.",
    url: "https://www.daad.de/en/studying-in-germany/scholarships/",
    winningProbability: "medium",
    notes: "Germany fit improves if you can explain why Germany, why this programme, and why your research/product path needs that ecosystem.",
  },
  "Erasmus Mundus Joint Masters": {
    country: "Europe",
    type: "merit",
    amountUsd: 55000,
    deadline: "2027-01-10",
    eligibilitySummary: "Joint master's scholarships vary by programme. Many open around Oct-Nov and close around Jan-Feb.",
    url: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
    winningProbability: "medium",
    notes: "Do not track as one scholarship only. Track each EMJM programme separately once you identify behavioural science, HCI, psychology, or digital society fits.",
  },
  "Knight-Hennessy Scholars": {
    country: "USA",
    type: "merit",
    amountUsd: 85000,
    deadline: "2026-10-08",
    eligibilitySummary: "Stanford graduate funding route. 2027 cohort application opened 1 Jun 2026; requires separate Stanford admission application.",
    url: "https://knight-hennessy.stanford.edu/admission/before-you-apply",
    winningProbability: "low",
    notes: "Extremely competitive. Only worth serious effort if Stanford programme fit and leadership narrative are unusually strong.",
  },
  "Gates Cambridge": {
    country: "UK",
    type: "merit",
    amountUsd: 70000,
    deadline: "2026-12-03",
    eligibilitySummary: "Full-cost Cambridge scholarship. International deadlines vary by course round, usually Dec/Jan.",
    url: "https://www.gatescambridge.org/apply/how-to-apply/",
    winningProbability: "low",
    notes: "Needs outstanding intellectual fit, leadership, and contribution-to-others story. Research paper matters here.",
  },
  "Inlaks Shivdasani Scholarship": {
    country: "Global",
    type: "merit",
    amountUsd: 100000,
    deadline: "2027-03-30",
    eligibilitySummary: "Indian students for top international graduate programmes. Date is next-cycle planning estimate.",
    url: "https://www.inlaksfoundation.org/scholarships/",
    winningProbability: "medium",
    notes: "Strong for high-quality admit plus clear creative/research/professional trajectory.",
  },
  "J.N. Tata Endowment": {
    country: "Global",
    type: "need",
    amountUsd: 12000,
    deadline: "2027-03-21",
    eligibilitySummary: "Loan scholarship for Indians pursuing higher studies abroad. Date is next-cycle planning estimate.",
    url: "https://jntataendowment.org/",
    winningProbability: "high",
    notes: "Practical backup funding route. Track even if aiming for full scholarships.",
  },
  "KC Mahindra Scholarship": {
    country: "Global",
    type: "merit",
    amountUsd: 12000,
    deadline: "2027-03-31",
    eligibilitySummary: "Indian postgraduate study abroad scholarship. Date is next-cycle planning estimate.",
    url: "https://www.kcmet.org/",
    winningProbability: "high",
    notes: "Good backup route once admits are in hand.",
  },
};

for (const [name, patch] of Object.entries(patches)) {
  const existing = db.select().from(scholarships).where(eq(scholarships.name, name)).get();
  const values = {
    name,
    country: patch.country,
    type: patch.type,
    amountUsd: patch.amountUsd,
    deadline: patch.deadline,
    eligibilitySummary: patch.eligibilitySummary,
    url: patch.url,
    winningProbability: patch.winningProbability,
    status: existing?.status ?? "researching",
    notes: patch.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) {
    db.update(scholarships).set(values).where(eq(scholarships.name, name)).run();
  } else {
    db.insert(scholarships).values(values).run();
  }
}

console.log("Repaired scholarship intelligence data and added high-priority missing routes.");
