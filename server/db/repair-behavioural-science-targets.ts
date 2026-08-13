import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import { documents, tasks, universities, universityShortlist } from "./schema.js";

const now = () => new Date().toISOString();

const targets = [
  {
    label: "LSE",
    matchNames: ["London School of Economics"],
    programName: "MSc Behavioural Science",
    applicationUrl: "https://www.lse.ac.uk/study-at-lse/graduate/msc-behavioural-science",
    notes: "PRIMARY BEHAVIOURAL SCIENCE TARGET. Official LSE MSc Behavioural Science route. Strong fit for behavioural science, research, policy, consulting and private-sector behaviour insight roles.",
    sourceTitle: "LSE MSc Behavioural Science",
    sourceNotes: "Official programme page for Anushka's UK behavioural science target list.",
  },
  {
    label: "Warwick",
    matchNames: ["University of Warwick"],
    programName: "MSc Behavioural and Economic Science (Science Track)",
    applicationUrl: "https://warwick.ac.uk/study/postgraduate/courses/msc-behavioural-economics-science/",
    notes: "PRIMARY BEHAVIOURAL SCIENCE TARGET. Warwick science-track route combines psychology, behavioural economics, judgement and decision-making.",
    sourceTitle: "Warwick MSc Behavioural and Economic Science",
    sourceNotes: "Official Warwick course page for the behavioural science/economic science target.",
  },
  {
    label: "UCL",
    matchNames: ["UCL", "University College London (UCL)", "University College London"],
    programName: "MSc Behaviour Change",
    applicationUrl: "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/behaviour-change-msc",
    notes: "PRIMARY BEHAVIOURAL SCIENCE TARGET. UCL Behaviour Change route aligns with applied behavioural science, intervention design, health, sustainability and policy.",
    sourceTitle: "UCL Behaviour Change MSc",
    sourceNotes: "Official UCL Behaviour Change MSc page; use with UCL Centre for Behaviour Change context.",
    renameTo: "University College London (UCL)",
  },
  {
    label: "Erasmus Rotterdam",
    matchNames: ["Erasmus University Rotterdam"],
    programName: "MSc Economics and Business: Behavioural Economics specialisation",
    applicationUrl: "https://www.eur.nl/en/master/behavioural-economics",
    notes: "PRIMARY BEHAVIOURAL SCIENCE TARGET. Netherlands route for behavioural economics, consumer decision-making, strategy and policy.",
    sourceTitle: "Erasmus Rotterdam Behavioural Economics",
    sourceNotes: "Official Erasmus programme page for the Netherlands behavioural economics target.",
  },
  {
    label: "Carnegie Mellon",
    matchNames: ["Carnegie Mellon University"],
    programName: "Master of Human-Computer Interaction (behavioural design / UX research adjacent route)",
    applicationUrl: "https://hcii.cmu.edu/academics/mhci",
    notes: "PRIMARY US ADJACENT TARGET. CMU does not list a standalone taught Master's in Behavioural Science in the same style as LSE/Warwick/UCL. Use MHCI as the behavioural design, UX research and human-centred product route; verify final programme choice before applying.",
    sourceTitle: "CMU Master of Human-Computer Interaction",
    sourceNotes: "Official CMU MHCI page; behavioural-science-adjacent route for UX research and behavioural design.",
  },
];

initDb();

const universityRows = db.select().from(universities).all();
const shortlistRows = db.select().from(universityShortlist).all();
const sourceRows = db.select().from(documents).all();
const taskRows = db.select().from(tasks).all();

for (const target of targets) {
  const row = universityRows.find((university) => target.matchNames.includes(university.name));
  if (!row) continue;

  db.update(universities)
    .set({
      name: target.renameTo ?? row.name,
      programName: target.programName,
      applicationUrl: target.applicationUrl,
      behavioralScienceFit: Math.max(row.behavioralScienceFit, target.label === "Carnegie Mellon" ? 8 : 9),
      researchFit: Math.max(row.researchFit, 8),
      pmFit: Math.max(row.pmFit, target.label === "Carnegie Mellon" ? 10 : row.pmFit),
      notes: target.notes,
      updatedAt: now(),
    })
    .where(eq(universities.id, row.id))
    .run();

  const existingShortlists = shortlistRows.filter((shortlist) => shortlist.universityId === row.id);
  if (existingShortlists.length > 0) {
    for (const existingShortlist of existingShortlists) {
      db.update(universityShortlist)
        .set({
          status: "shortlisted",
          priority: 5,
          notes: "Master's in Behavioural Science primary target track.",
          updatedAt: now(),
        })
        .where(eq(universityShortlist.id, existingShortlist.id))
        .run();
    }
  } else {
    db.insert(universityShortlist)
      .values({
        universityId: row.id,
        status: "shortlisted",
        priority: 5,
        notes: "Master's in Behavioural Science primary target track.",
        deadline: null,
        createdAt: now(),
        updatedAt: now(),
      })
      .run();
  }

  if (!sourceRows.some((source) => source.title === target.sourceTitle || source.url === target.applicationUrl)) {
    db.insert(documents)
      .values({
        title: target.sourceTitle,
        type: "official_source",
        url: target.applicationUrl,
        status: "verified",
        notes: target.sourceNotes,
        createdAt: now(),
        updatedAt: now(),
      })
      .run();
  }
}

if (!taskRows.some((task) => task.title === "Build Master's in Behavioural Science comparison table")) {
  db.insert(tasks)
    .values({
      title: "Build Master's in Behavioural Science comparison table",
      category: "universities",
      priority: "p1",
      status: "todo",
      dueDate: "2026-08-18",
      source: "manual",
      notes: "Compare LSE, Warwick, UCL, Erasmus Rotterdam and CMU on requirements, scholarship path, UX research fit, SOP angle, deadlines, cost and visa route.",
      createdAt: now(),
      updatedAt: now(),
    })
    .run();
}

console.log("Behavioural science master's target track update complete.");
