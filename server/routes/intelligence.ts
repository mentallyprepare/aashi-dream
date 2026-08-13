import express from "express";
import { db } from "../db/client.js";
import {
  applications,
  ieltsProgress,
  lorContacts,
  people,
  productPortfolio,
  profile,
  researchPapers,
  sopDocuments,
  tasks,
  universities,
} from "../db/schema.js";
import { dateKey, nowIso } from "../lib/time.js";

const router = express.Router();

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readinessSnapshot() {
  const profileRow = db.select().from(profile).get();
  const ieltsRows = db.select().from(ieltsProgress).all();
  const researchRows = db.select().from(researchPapers).all();
  const sopRows = db.select().from(sopDocuments).all();
  const lorRows = db.select().from(lorContacts).all();
  const portfolioRows = db.select().from(productPortfolio).all();
  const peopleRows = db.select().from(people).all();
  const taskRows = db.select().from(tasks).all();
  const applicationRows = db.select().from(applications).all();

  const bestIelts = Math.max(...ieltsRows.map((row) => Number(row.overall ?? 0)), 0);
  const hasResearchSubmission = researchRows.some((row) => ["submission", "under_review", "accepted", "published"].includes(row.status));
  const hasPublication = researchRows.some((row) => row.status === "published");
  const finalSops = sopRows.filter((row) => row.status === "final").length;
  const submittedLors = lorRows.filter((row) => row.status === "submitted").length;
  const activePortfolio = portfolioRows.filter((row) => row.status === "active" || row.status === "completed").length;
  const contactedFaculty = peopleRows.filter((row) => ["contacted", "replied", "meeting_scheduled"].includes(row.status)).length;

  return {
    profile: profileRow,
    bestIelts,
    hasResearchSubmission,
    hasPublication,
    finalSops,
    submittedLors,
    activePortfolio,
    contactedFaculty,
    taskRows,
    applicationRows,
    researchRows,
    sopRows,
    lorRows,
    portfolioRows,
    peopleRows,
  };
}

function deltaForUniversity(uni: ReturnType<typeof db.select> extends never ? never : any, snapshot: ReturnType<typeof readinessSnapshot>) {
  const gaps: Array<{ label: string; severity: "critical" | "important" | "optional"; action: string }> = [];

  if (snapshot.bestIelts < uni.ieltsMin) {
    gaps.push({
      label: `IELTS ${uni.ieltsMin}+`,
      severity: "critical",
      action: `Take a diagnostic mock and build a plan to reach ${uni.ieltsMin}.`,
    });
  }

  if (uni.greRequired) {
    gaps.push({
      label: `GRE ${uni.greMin ?? 320}+`,
      severity: "important",
      action: "Verify whether GRE is required for your exact program and decide test/no-test route.",
    });
  }

  if (!snapshot.hasResearchSubmission && uni.researchFit >= 8) {
    gaps.push({
      label: "Research submission proof",
      severity: "critical",
      action: "Submit or pre-register the derealization gaming paper and create a 1-page research summary.",
    });
  }

  if (!snapshot.hasPublication && uni.acceptanceDifficulty === "reach") {
    gaps.push({
      label: "Publication / conference signal",
      severity: "important",
      action: "Turn the current paper into a conference abstract or poster if journal timing is slow.",
    });
  }

  if (snapshot.finalSops === 0) {
    gaps.push({
      label: "Program-specific SOP",
      severity: "critical",
      action: `Write a SOP that links psychology, Mentally Prepare, digital behavior, and ${uni.programName}.`,
    });
  }

  if (snapshot.submittedLors < 2) {
    gaps.push({
      label: "2 strong LORs",
      severity: "important",
      action: "Prepare recommender briefing notes for research supervisor and applied mentor.",
    });
  }

  if (snapshot.activePortfolio === 0 || uni.pmFit >= 9 || uni.startupFit >= 9) {
    gaps.push({
      label: "Product proof",
      severity: uni.pmFit >= 9 ? "critical" : "important",
      action: "Add Mentally Prepare metrics, user interviews, experiments, and founder story.",
    });
  }

  if (snapshot.contactedFaculty === 0 && uni.researchFit >= 8) {
    gaps.push({
      label: "Professor CRM outreach",
      severity: "important",
      action: "Find 2 relevant professors/labs and send a short research-fit email.",
    });
  }

  const penalty = gaps.reduce((sum, gap) => sum + (gap.severity === "critical" ? 14 : gap.severity === "important" ? 8 : 4), 0);
  const fit = (uni.behavioralScienceFit + uni.consumerPsychFit + uni.pmFit + uni.researchFit + uni.startupFit) * 2;
  const score = clamp(fit - penalty + (uni.acceptanceDifficulty === "safe" ? 18 : uni.acceptanceDifficulty === "target" ? 8 : 0));

  return {
    university: uni,
    deltaScore: score,
    gaps: gaps.slice(0, 7),
    unlocked: gaps.filter((gap) => gap.severity === "critical").length === 0,
  };
}

router.get("/profile-delta", (_request, response) => {
  const snapshot = readinessSnapshot();
  const rows = db.select().from(universities).all();
  const deltas = rows
    .map((uni) => deltaForUniversity(uni, snapshot))
    .sort((a, b) => b.deltaScore - a.deltaScore);
  response.json({ generatedAt: nowIso(), deltas });
});

router.get("/top-action", (_request, response) => {
  const snapshot = readinessSnapshot();
  const overdueOrUpcoming = snapshot.taskRows
    .filter((task) => task.status !== "done")
    .sort((a, b) => dateKey(a.dueDate).localeCompare(dateKey(b.dueDate)));

  let action = overdueOrUpcoming[0]
    ? {
        title: overdueOrUpcoming[0].title,
        why: overdueOrUpcoming[0].notes || "This is the next dated task with the highest urgency.",
        source: "tasks",
        priority: overdueOrUpcoming[0].priority,
      }
    : {
        title: "Create one professor outreach target",
        why: "No open tasks were found. Faculty Intelligence is the fastest way to become more elite-applicant-like.",
        source: "system",
        priority: "p1",
      };

  if (!snapshot.hasResearchSubmission) {
    action = {
      title: "Finish research submission package",
      why: "Your research paper is the strongest hidden asset. Submission proof upgrades admissions, SOP, LOR, and professor outreach.",
      source: "research",
      priority: "p1",
    };
  } else if (snapshot.bestIelts === 0) {
    action = {
      title: "Take IELTS diagnostic mock",
      why: "IELTS is currently unknown. A diagnostic score unlocks the real university delta.",
      source: "ielts",
      priority: "p1",
    };
  } else if (snapshot.contactedFaculty === 0) {
    action = {
      title: "Contact one matched professor",
      why: "Elite applicants build faculty fit before applying. This is currently zero in your CRM.",
      source: "faculty",
      priority: "p1",
    };
  }

  response.json({ generatedAt: nowIso(), action });
});

router.get("/top1-report", (_request, response) => {
  const snapshot = readinessSnapshot();
  const deltas = db
    .select()
    .from(universities)
    .all()
    .map((uni) => deltaForUniversity(uni, snapshot))
    .sort((a, b) => b.deltaScore - a.deltaScore)
    .slice(0, 8);

  response.json({
    generatedAt: nowIso(),
    strengths: [
      "Psychology honours-with-research foundation",
      "Current derealization and gaming research paper",
      "Mentally Prepare founder/product proof",
      "HPAIR + HP Dreams + IIT Kharagpur competition signals",
      "Clear bridge between digital behavior, consumer psychology, and product thinking",
    ],
    weaknesses: [
      snapshot.bestIelts ? "IELTS score exists but still needs target mapping" : "IELTS score not yet known",
      snapshot.finalSops ? "SOPs exist but need final polish" : "No final SOPs yet",
      snapshot.submittedLors >= 2 ? "LOR base started" : "LORs not submitted yet",
      snapshot.contactedFaculty ? "Faculty CRM started" : "No professor outreach yet",
    ],
    biggestOpportunity: "Use the research paper plus Mentally Prepare as a combined digital behavior/product psychology story.",
    biggestRisk: "Applying as a generic psychology student instead of a psychology researcher and mental-health product builder.",
    mostImportantAction: snapshot.hasResearchSubmission ? "Start professor outreach for top-fit programs." : "Finish the research paper submission package.",
    plan30d: [
      "Complete research submission package",
      "Take IELTS diagnostic and create weekly study plan",
      "Create professor CRM shortlist for 8 universities",
      "Write master SOP narrative spine",
    ],
    plan90d: [
      "Submit/present research paper",
      "Finalize top 12 university shortlist",
      "Contact 12 faculty/alumni leads",
      "Build Mentally Prepare product proof page",
      "Prepare scholarship evidence folder",
    ],
    probabilities: {
      eliteAdmissions: clamp(30 + (snapshot.hasResearchSubmission ? 15 : 0) + (snapshot.bestIelts >= 7.5 ? 20 : 0) + snapshot.contactedFaculty * 2),
      scholarship: clamp(35 + snapshot.finalSops * 5 + snapshot.submittedLors * 8),
      researchPublication: snapshot.hasResearchSubmission ? 72 : 48,
      pmCareer: clamp(62 + snapshot.activePortfolio * 12),
    },
    deltas,
  });
});

router.get("/research-reputation", (_request, response) => {
  const snapshot = readinessSnapshot();
  const paper = snapshot.researchRows[0] ?? null;
  const statusScore: Record<string, number> = {
    idea: 15,
    draft: 35,
    submission: 58,
    under_review: 72,
    revision: 78,
    accepted: 92,
    published: 100,
  };
  const publicationProbability = clamp(statusScore[paper?.status ?? "idea"] ?? 20);
  const portfolioBonus = snapshot.activePortfolio ? 12 : 0;
  const impactPotential = clamp(publicationProbability * 0.55 + portfolioBonus + 22);
  response.json({
    generatedAt: nowIso(),
    currentPaper: paper,
    publicationProbability,
    journalQuality: paper?.targetJournal ? "Shortlist needed" : "Target journal missing",
    researchImpactPotential: impactPotential >= 75 ? "high" : impactPotential >= 50 ? "medium" : "low",
    expectedReviewTimeline: paper?.submissionDate ? "8-16 weeks after submission, varies by journal" : "Set submission date first",
    futureIdeas: [
      "AI and loneliness",
      "Parasocial relationships with AI companions",
      "Digital identity and derealization",
      "Consumer psychology of AI companions",
      "Student isolation and belonging",
      "Social media and belonging",
      "Behavioral design in mental health apps",
    ],
    nextMoves: [
      "Create a 250-word abstract",
      "Create a one-page research summary for professors",
      "Shortlist 5 target journals or conferences",
      "Map the paper to Mentally Prepare and digital wellbeing",
    ],
  });
});

router.get("/ielts-readiness", (_request, response) => {
  const snapshot = readinessSnapshot();
  const target = Number(snapshot.profile?.ielts?.target ?? 7.5);
  const plannedDate = String(snapshot.profile?.ielts?.planned_date ?? "2026-10");
  const rows = db.select().from(ieltsProgress).all().sort((a, b) => a.date.localeCompare(b.date));
  const best = Math.max(...rows.map((row) => Number(row.overall ?? 0)), 0);
  const readiness = best ? clamp((best / target) * 100) : 0;
  const unlocks = [6.5, 7, 7.5, 8].map((band) => ({
    band,
    unlocked: best >= band,
    universities: db
      .select()
      .from(universities)
      .all()
      .filter((uni) => uni.ieltsMin <= band)
      .slice(0, 8)
      .map((uni) => uni.name),
  }));
  response.json({
    generatedAt: nowIso(),
    plannedDate,
    target,
    best,
    readiness,
    scores: rows,
    unlocks,
    weeklyPlan: [
      { skill: "Writing", focus: "Task 2 structure + examples", cadence: "3 essays/week" },
      { skill: "Speaking", focus: "Part 2 fluency and follow-up reasoning", cadence: "4 drills/week" },
      { skill: "Reading", focus: "Timed passages and keyword traps", cadence: "3 passages/week" },
      { skill: "Listening", focus: "Section 3/4 detail capture", cadence: "3 tests/week" },
    ],
  });
});

export default router;
