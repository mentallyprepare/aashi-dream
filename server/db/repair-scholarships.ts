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
  status?: string;
  notes: string;
};

const patches: Record<string, ScholarshipPatch> = {
  Chevening: {
    country: "UK",
    type: "government",
    amountUsd: 55000,
    deadline: "2026-10-06",
    eligibilitySummary: "Fully funded UK scholarship for future leaders. India applications for 2027-2028 are open now and close 6 Oct 2026 at 11:00 UTC.",
    url: "https://www.chevening.org/scholarship/india/",
    winningProbability: "medium",
    status: "preparing",
    notes: "Live form. Create the Chevening account now, draft four essays, choose three eligible UK one-year master's courses, and confirm two referees before the last week of September.",
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
    deadline: "2026-02-26",
    eligibilitySummary: "For India-domiciled UCL postgraduate taught applicants. The 2026/27 deadline passed on 26 Feb 2026; 2027/28 date is not published yet.",
    url: "https://www.ucl.ac.uk/scholarships/ucl-india-excellence-scholarship",
    winningProbability: "medium",
    status: "researching",
    notes: "Closed for the published 2026/27 cycle. UCL says no separate form was required; applicants were considered automatically after a complete UCL admission application with references.",
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
    status: "preparing",
    notes: "Opening soon. CSC says 2027/28 applications open 8 Sep 2026 and close 20 Oct 2026 at 16:00 BST. Use psychology + student mental health + Mentally Prepare as development/social impact proof and verify the India nominating route.",
  },
  "DAAD Master's Scholarships": {
    country: "Germany",
    type: "government",
    amountUsd: 24000,
    deadline: "2026-10-31",
    eligibilitySummary: "DAAD master's scholarships vary by programme and country. Use the DAAD database for the exact India route.",
    url: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50026200",
    winningProbability: "medium",
    notes: "DAAD says applications are possible between 1 June and the stated deadline, and the portal appears only during the current application period. Verify the exact India deadline in the DAAD database before submission.",
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
    deadline: "2026-10-06",
    eligibilitySummary: "Stanford graduate funding route. 2027 cohort application opened 1 Jun 2026; requires separate Stanford admission application.",
    url: "https://knight-hennessy.stanford.edu/admission/preparing-your-applications/application-deadlines",
    winningProbability: "low",
    status: "preparing",
    notes: "Live form. KHS deadline is 6 Oct 2026 at 1:00 PM Pacific Time, and a separate Stanford graduate application is due by the earlier program deadline or 1 Dec 2026.",
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
  "UCL Global Masters Scholarship": {
    country: "UK",
    type: "need",
    amountUsd: 19000,
    deadline: "2026-05-07",
    eligibilitySummary: "Need-based UCL postgraduate taught scholarship. The 2026/27 deadline passed on 7 May 2026; 2027/28 date is not published yet.",
    url: "https://www.ucl.ac.uk/scholarships/ucl-global-masters-scholarship",
    winningProbability: "medium",
    status: "researching",
    notes: "Closed for the published 2026/27 cycle. UCL listed GBP 15,000 awards with India ring-fenced places, but applicants needed a complete admission application including references.",
  },
  "Inlaks Shivdasani Scholarship": {
    country: "Global",
    type: "merit",
    amountUsd: 100000,
    deadline: "2026-03-30",
    eligibilitySummary: "Indian students for top international graduate programmes. Applications are closed for 2026; next cycle has not been announced.",
    url: "https://inlaksfoundation.org/opportunities/scholarship/",
    winningProbability: "medium",
    status: "researching",
    notes: "Closed now. Inlaks states the Apply Now link appears only when the opportunity is open. Keep as a watch item for the next cycle, especially for behavioural science or consumer psychology admits.",
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
    status: patch.status ?? existing?.status ?? "researching",
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
