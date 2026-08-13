import { eq } from "drizzle-orm";
import { db } from "./client.js";
import {
  applications,
  ieltsProgress,
  lorContacts,
  people,
  profile,
  researchPapers,
  scholarships,
  tasks,
  universityShortlist,
} from "./schema.js";
import { nowIso } from "../lib/time.js";

const now = nowIso();

const scholarshipDates: Record<string, string> = {
  Chevening: "2026-11-05",
  "Commonwealth Master's Scholarship": "2026-12-12",
  "Fulbright Foreign Student Program": "2026-07-15",
  "Erasmus Mundus Joint Masters": "2027-01-10",
  "DAAD Master's Scholarships": "2026-10-31",
  "GREAT Scholarships": "2027-04-30",
  "Gates Cambridge": "2026-12-03",
  "Rhodes Scholarship": "2026-10-02",
  "Marshall Scholarship": "2026-09-24",
  "Clarendon Scholarship": "2026-12-15",
  "Schwarzman Scholars": "2026-09-12",
  "Knight-Hennessy Scholars": "2026-10-08",
  "AAUW International Fellowship": "2026-11-15",
  "Inlaks Shivdasani Scholarship": "2027-03-30",
  "J.N. Tata Endowment": "2027-03-21",
  "KC Mahindra Scholarship": "2027-03-31",
  "Aga Khan Foundation ISP": "2027-03-31",
  "Lund Global Scholarship": "2027-02-15",
  "KU Leuven Global Minds": "2027-02-01",
  "Erasmus Trustfonds": "2027-04-01",
  "Amsterdam Merit Scholarship": "2027-01-15",
  "Leiden Excellence Scholarship": "2027-02-01",
  "Orange Tulip Scholarship": "2027-04-01",
  "NUS Graduate Scholarship": "2027-01-15",
  "NTU Research Scholarship": "2027-01-31",
  "MEXT Scholarship": "2027-06-10",
  "Global Korea Scholarship": "2027-03-01",
  "Australia Awards": "2027-04-30",
  "Melbourne Graduate Scholarship": "2027-03-31",
  "UCL Global Masters Scholarship": "2027-05-01",
};

const profileRow = db.select().from(profile).get();
if (profileRow) {
  db.update(profile)
    .set({
      ielts: { ...profileRow.ielts, planned_date: "2026-10" },
      research: { ...profileRow.research, target_submission: "2026-07" },
      updatedAt: now,
    })
    .where(eq(profile.id, profileRow.id))
    .run();
}

for (const [name, deadline] of Object.entries(scholarshipDates)) {
  db.update(scholarships)
    .set({
      deadline,
      notes: "Seeded deadline estimate for the next available cycle. Verify official page before applying.",
      updatedAt: now,
    })
    .where(eq(scholarships.name, name))
    .run();
}

db.update(researchPapers)
  .set({ submissionDate: "2026-07-31", updatedAt: now })
  .where(eq(researchPapers.title, "First-Person vs Third-Person Games: Do They Differently Affect Derealization?"))
  .run();

const taskDates: Record<string, string> = {
  "Finish research paper submission package": "2026-07-31",
  "Build IELTS October preparation calendar": "2026-06-15",
  "Create professor CRM shortlist for UCL, LSE, Bath, Erasmus": "2026-06-20",
};

for (const [title, dueDate] of Object.entries(taskDates)) {
  db.update(tasks).set({ dueDate, updatedAt: now }).where(eq(tasks.title, title)).run();
}

const lorDates: Record<string, string> = {
  "Research Supervisor": "2026-09-15",
  "Internship Mentor": "2026-09-30",
};

for (const [name, deadline] of Object.entries(lorDates)) {
  db.update(lorContacts).set({ deadline, updatedAt: now }).where(eq(lorContacts.name, name)).run();
}

db.update(ieltsProgress)
  .set({ date: "2026-06-01" })
  .where(eq(ieltsProgress.date, "2025-06-01"))
  .run();

db.update(people)
  .set({ nextFollowUp: "2026-06-20", updatedAt: now })
  .where(eq(people.nextFollowUp, "2025-06-20"))
  .run();

db.update(applications)
  .set({ deadline: "2027-01-15", updatedAt: now })
  .where(eq(applications.deadline, "2026-01-15"))
  .run();

db.update(universityShortlist)
  .set({ deadline: "2027-01-15", updatedAt: now })
  .where(eq(universityShortlist.deadline, "2026-01-15"))
  .run();

console.log("Repaired Anushka OS dates for Asia/Kolkata current cycle.");
