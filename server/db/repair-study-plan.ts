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
          ...((profileRow.ielts?.gre as Record<string, unknown> | undefined) ?? {}),
          planned_date: "2026-11",
          target_total: 320,
          quant_target: 160,
          verbal_target: 160,
          awa_target: 4,
          status: "planning_for_first_week_of_november",
          strategy:
            "Use GRE for selected USA routes such as Penn MBDS. Keep IELTS as the universal English test and leave at least three days between the two exams.",
        },
      },
      research: {
        ...profileRow.research,
        study_paths: [
          {
            priority: "P1",
            name: "MSc Behavioural Science",
            status: "primary",
            reason: "Best direct fit with psychology honours, behavioural research, UX research and Mentally Prepare.",
            careers: ["Behavioural Scientist", "UX Researcher", "Behavioural Product Manager"],
          },
          {
            priority: "P2",
            name: "MSc Marketing / Consumer Analytics",
            status: "second_option",
            reason: "Commercial route into consumer insights, marketing analytics and product strategy; requires stronger quantitative evidence.",
            careers: ["Consumer Insights Analyst", "Marketing Analyst", "Product Strategist"],
          },
        ],
      },
      experienceTags: Array.from(new Set([
        ...(profileRow.experienceTags ?? []).filter((tag) => tag !== "GRE October 2026 plan"),
        "GRE November 2026 plan",
        "Marketing and Consumer Analytics pathway",
      ])),
      updatedAt: now,
    })
    .where(eq(profile.id, 1))
    .run();
}

for (const legacyTitle of ["Register GRE General Test for October 2026", "Build 6-week GRE study sprint"]) {
  const legacyTask = db.select().from(tasks).where(eq(tasks.title, legacyTitle)).get();
  if (legacyTask) {
    db.update(tasks)
      .set({ status: "done", notes: `${legacyTask.notes} Superseded by the November 2026 combined test plan.`, updatedAt: now })
      .where(eq(tasks.id, legacyTask.id))
      .run();
  }
}

const oldIeltsTask = db.select().from(tasks).where(eq(tasks.title, "Build IELTS October preparation calendar")).get();
if (oldIeltsTask) {
  db.update(tasks)
    .set({
      title: "Build November GRE and IELTS preparation calendar",
      category: "tests",
      dueDate: "2026-09-10",
      notes: "Target IELTS 7.5 and GRE 320+; begin with untimed diagnostics and request dyslexia accommodations early.",
      updatedAt: now,
    })
    .where(eq(tasks.id, oldIeltsTask.id))
    .run();
}

const courseTaskTitle = "Build Marketing and Consumer Analytics second-route shortlist";
const existingCourseTask = db.select().from(tasks).where(eq(tasks.title, courseTaskTitle)).get();
const courseTask = {
  title: courseTaskTitle,
  category: "applications",
  priority: "p2",
  status: existingCourseTask?.status ?? "todo",
  dueDate: "2026-09-25",
  source: "manual",
  notes: "Select 4-6 programmes with consumer behaviour, market research, experimentation, statistics and analytics. Avoid broad marketing degrees with weak analytical content.",
  createdAt: existingCourseTask?.createdAt ?? now,
  updatedAt: now,
};

if (existingCourseTask) {
  db.update(tasks).set(courseTask).where(eq(tasks.id, existingCourseTask.id)).run();
} else {
  db.insert(tasks).values(courseTask).run();
}

console.log("Repaired November test plan and two-course strategy.");
