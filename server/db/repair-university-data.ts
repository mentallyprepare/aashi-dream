import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { universities } from "./schema.js";
import { nowIso } from "../lib/time.js";

const now = nowIso();

const qs2026Updates: Record<string, number> = {
  MIT: 1,
  "Imperial College London": 2,
  "Stanford University": 3,
  "University of Oxford": 4,
  "Harvard University": 5,
  "University of Cambridge": 6,
  UCL: 9,
  "National University of Singapore": 8,
  "University of Hong Kong": 11,
  "Nanyang Technological University": 12,
  "Peking University": 14,
  "Tsinghua University": 17,
  "University of Pennsylvania": 15,
  "Cornell University": 16,
  "UC Berkeley": 17,
  "Yale University": 21,
  "Princeton University": 25,
  "McGill University": 27,
  "University of Toronto": 29,
  "King's College London": 31,
  "Australian National University": 32,
  "Chinese University of Hong Kong": 32,
  "University of Edinburgh": 34,
  "University of Manchester": 35,
  "University of Melbourne": 19,
  "UNSW Sydney": 20,
  "Monash University": 36,
  "University of Tokyo": 36,
  "Columbia University": 38,
  "Seoul National University": 38,
  "University of Queensland": 42,
  "Northwestern University": 42,
  "University of Michigan": 45,
};

for (const [name, qsRanking] of Object.entries(qs2026Updates)) {
  db.update(universities)
    .set({
      qsRanking,
      isEstimated: true,
      notes:
        "QS rank updated against QS World University Rankings 2026 where available. Program acceptance rates are estimates because many graduate programs do not publish exact rates.",
      updatedAt: now,
    })
    .where(eq(universities.name, name))
    .run();
}

console.log("Repaired selected university QS 2026 rankings and data confidence notes.");
