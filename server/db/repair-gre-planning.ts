import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import { profile, tasks } from "./schema.js";
import { nowIso } from "../lib/time.js";

initDb();

const now = nowIso();
const profileRow = db.select().from(profile).where(eq(profile.id, 1)).get();

if (profileRow) {
  db.update(profile)
    .set({
      ielts: {
        ...profileRow.ielts,
        planned_date: "2026-11",
        target: profileRow.ielts?.target ?? 7.5,
        gre: {
          planned_date: "2026-11",
          target_total: 320,
          quant_target: 160,
          verbal_target: 160,
          awa_target: 4,
          current_total: null,
          status: "planning_for_first_week_of_november",
          strategy:
            "Use GRE for USA routes such as Penn MBDS or other programmes that require it. Keep UK and Europe decisions IELTS/programme-led unless a course explicitly asks for GRE.",
        },
      },
      experienceTags: Array.from(new Set([...(profileRow.experienceTags ?? []).filter((tag) => tag !== "GRE October 2026 plan"), "GRE November 2026 plan", "USA test strategy"])),
      updatedAt: now,
    })
    .where(eq(profile.id, 1))
    .run();
}

const taskSeeds = [
  {
    title: "Book GRE and IELTS for first week of November 2026",
    category: "tests",
    priority: "p1",
    status: "todo",
    dueDate: "2026-09-20",
    source: "manual",
    notes: "Choose test dates at least three days apart, confirm passport-name match, request dyslexia accommodations early, and add Penn MBDS score-code planning.",
  },
  {
    title: "Start 8-week dyslexia-friendly GRE and IELTS sprint",
    category: "tests",
    priority: "p1",
    status: "todo",
    dueDate: "2026-09-10",
    source: "manual",
    notes: "Use 25-minute blocks, official ETS/Cambridge material, one error notebook, weekly review and gradual timed practice.",
  },
  {
    title: "Decide USA GRE-required shortlist",
    category: "applications",
    priority: "p1",
    status: "todo",
    dueDate: "2026-09-15",
    source: "manual",
    notes: "Mark Penn MBDS as GRE-required unless waiver applies. Verify CMU MHCI, NYU MA Psychology, Berkeley MIMS and other USA routes one by one.",
  },
];

for (const task of taskSeeds) {
  const existing = db.select().from(tasks).where(eq(tasks.title, task.title)).get();
  const values = {
    ...task,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) {
    db.update(tasks).set(values).where(eq(tasks.id, existing.id)).run();
  } else {
    db.insert(tasks).values(values).run();
  }
}

console.log("Repaired GRE and IELTS November planning profile and tasks.");
