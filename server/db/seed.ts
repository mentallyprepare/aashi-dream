import { count } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import {
  applications,
  careers,
  ieltsProgress,
  lorContacts,
  people,
  productPortfolio,
  profile,
  researchPapers,
  scholarships,
  sopDocuments,
  tasks,
  universities,
  universityShortlist,
  visaTracker,
} from "./schema.js";

const now = () => new Date().toISOString();

type UniversitySeedRow = [
  string,
  string,
  string,
  number | null,
  "A" | "B" | "C" | "D",
  "reach" | "target" | "safe",
  string,
  number,
  number,
  number,
  boolean,
  boolean,
  number | null,
  [number, number, number, number, number],
];

const universitySeeds = ([
  ["Harvard University", "USA", "Cambridge", 5, "A", "reach", "Psychology / Mind Brain Behavior", 58000, 30000, 3, false, true, 4, [9, 8, 8, 10, 8]],
  ["Stanford University", "USA", "Stanford", 3, "A", "reach", "Symbolic Systems / Psychology pathway", 62000, 32000, 3, true, true, 4, [10, 8, 10, 10, 10]],
  ["MIT", "USA", "Cambridge", 1, "A", "reach", "Media Lab / HCI-adjacent pathway", 61000, 31000, 3, true, true, 5, [9, 7, 10, 9, 10]],
  ["University of Pennsylvania", "USA", "Philadelphia", 15, "A", "reach", "Master of Behavioral and Decision Sciences", 62000, 26000, 3, false, false, 12, [10, 9, 8, 9, 8]],
  ["Columbia University", "USA", "New York", 38, "A", "reach", "MA Quantitative Methods in Social Sciences", 67000, 34000, 3, true, false, 18, [8, 8, 8, 9, 8]],
  ["Princeton University", "USA", "Princeton", 25, "A", "reach", "Psychology / Social Psychology research pathway", 59000, 27000, 3, true, true, 5, [8, 8, 7, 10, 7]],
  ["Yale University", "USA", "New Haven", 21, "A", "reach", "Psychology / Behavioral science pathway", 52000, 25000, 3, false, true, 6, [8, 8, 7, 10, 7]],
  ["Cornell University", "USA", "Ithaca", 16, "A", "reach", "Information Science / Psychology pathway", 64000, 26000, 3, true, true, 10, [8, 8, 9, 9, 8]],
  ["UC Berkeley", "USA", "Berkeley", 17, "A", "reach", "Master of Information Management and Systems", 54000, 30000, 3, true, true, 14, [8, 7, 10, 8, 10]],
  ["Carnegie Mellon University", "USA", "Pittsburgh", 52, "A", "reach", "Master of Human-Computer Interaction", 56000, 24000, 3, true, false, 16, [8, 8, 10, 8, 10]],
  ["University of Oxford", "UK", "Oxford", 4, "A", "reach", "MSc Psychological Research", 43000, 23000, 2, false, false, 8, [8, 8, 7, 10, 7]],
  ["University of Cambridge", "UK", "Cambridge", 6, "A", "reach", "MPhil Psychology and Education", 46000, 23000, 2, false, false, 8, [8, 8, 7, 10, 7]],
  ["UCL", "UK", "London", 9, "A", "reach", "MSc Cognitive and Decision Sciences", 42000, 26000, 2, false, false, 18, [9, 8, 9, 9, 8]],
  ["Imperial College London", "UK", "London", 2, "A", "reach", "Innovation, Entrepreneurship and Management", 48000, 27000, 2, false, false, 20, [7, 7, 10, 7, 10]],
  ["London School of Economics", "UK", "London", 56, "A", "reach", "MSc Behavioural Science", 41000, 26000, 2, false, false, 15, [10, 9, 8, 9, 8]],
  ["King's College London", "UK", "London", 31, "A", "target", "MSc Mental Health Studies", 38000, 25000, 2, false, false, 30, [7, 7, 7, 8, 7]],
  ["University of Edinburgh", "UK", "Edinburgh", 34, "A", "target", "MSc Psychology of Mental Health", 36000, 21000, 2, false, false, 28, [8, 7, 7, 8, 7]],
  ["University of Warwick", "UK", "Coventry", 74, "A", "target", "MSc Behavioural and Economic Science", 35000, 19000, 2, false, false, 24, [9, 8, 7, 8, 7]],
  ["University of Manchester", "UK", "Manchester", 35, "A", "target", "MSc Business Psychology", 33000, 19000, 2, false, false, 34, [7, 9, 8, 7, 7]],
  ["University of Bristol", "UK", "Bristol", 51, "A", "target", "MSc Psychology of Education", 33000, 20000, 2, false, false, 32, [7, 7, 7, 8, 7]],
  ["New York University", "USA", "New York", 55, "B", "target", "MA Psychology / Consumer Psychology pathway", 62000, 33000, 3, false, false, 28, [7, 9, 8, 7, 7]],
  ["Northwestern University", "USA", "Evanston", 42, "B", "target", "MS Integrated Marketing Communications", 62000, 27000, 3, false, false, 32, [7, 10, 9, 7, 8]],
  ["University of Michigan", "USA", "Ann Arbor", 45, "B", "target", "MS Survey and Data Science", 52000, 24000, 3, true, false, 34, [8, 9, 8, 8, 7]],
  ["University of Toronto", "Canada", "Toronto", 29, "B", "reach", "Psychology / Information pathway", 43000, 26000, 3, false, false, 20, [8, 8, 8, 9, 7]],
  ["McGill University", "Canada", "Montreal", 27, "B", "target", "Psychology / Human behavior pathway", 32000, 21000, 3, false, false, 30, [8, 7, 7, 8, 7]],
  ["University of Amsterdam", "Europe", "Amsterdam", 53, "B", "target", "Research Master's Psychology", 24000, 21000, 1, false, false, 25, [9, 8, 7, 9, 7]],
  ["Leiden University", "Europe", "Leiden", 141, "B", "target", "MSc Psychology: Economic and Consumer Psychology", 23000, 19000, 1, false, false, 35, [8, 10, 7, 8, 7]],
  ["University of Bath", "UK", "Bath", 132, "B", "target", "MSc Applied Psychology and Economic Behaviour", 32000, 19000, 2, false, false, 32, [9, 9, 7, 8, 7]],
  ["University of St Andrews", "UK", "St Andrews", 104, "B", "target", "MSc Psychology", 34000, 19000, 2, false, false, 28, [7, 7, 6, 8, 6]],
  ["University of Melbourne", "Australia", "Melbourne", 19, "B", "target", "Master of Applied Psychology", 39000, 24000, 3, false, false, 30, [7, 8, 7, 8, 7]],
  ["National University of Singapore", "Singapore", "Singapore", 8, "B", "reach", "Psychology / Social science research pathway", 36000, 25000, 1, false, false, 18, [9, 8, 8, 9, 8]],
  ["Nanyang Technological University", "Singapore", "Singapore", 12, "B", "reach", "Psychology / Communication and information pathway", 34000, 23000, 1, false, false, 20, [8, 8, 9, 8, 9]],
  ["Georgia Tech", "USA", "Atlanta", 114, "C", "target", "MS Human-Computer Interaction", 36000, 21000, 3, true, false, 35, [7, 7, 10, 7, 9]],
  ["University of Wisconsin-Madison", "USA", "Madison", 116, "C", "target", "Educational Psychology / Consumer research pathway", 34000, 20000, 3, true, false, 38, [7, 8, 7, 8, 7]],
  ["Tilburg University", "Europe", "Tilburg", 347, "C", "safe", "MSc Economic Psychology", 19000, 16000, 1, false, false, 45, [8, 10, 7, 7, 7]],
  ["University of Groningen", "Europe", "Groningen", 159, "C", "target", "MSc Applied Social Psychology", 22000, 17000, 1, false, false, 42, [8, 8, 7, 8, 7]],
  ["Trinity College Dublin", "Europe", "Dublin", 75, "C", "target", "MSc Applied Psychology", 26000, 22000, 2, false, false, 35, [7, 7, 7, 8, 7]],
  ["University College Dublin", "Europe", "Dublin", 118, "C", "target", "MSc Behavioural Economics", 25000, 22000, 2, false, false, 40, [8, 9, 7, 7, 7]],
  ["University of Queensland", "Australia", "Brisbane", 42, "C", "target", "Master of Mental Health", 33000, 22000, 3, false, false, 40, [7, 7, 6, 8, 7]],
  ["Monash University", "Australia", "Melbourne", 36, "C", "target", "Master of Applied Psychology", 35000, 23000, 3, false, false, 42, [7, 8, 7, 8, 7]],
  ["UNSW Sydney", "Australia", "Sydney", 20, "C", "target", "Master of Design / Psychology pathway", 36000, 25000, 3, false, false, 35, [7, 8, 9, 7, 8]],
  ["University of Hong Kong", "Asia", "Hong Kong", 11, "C", "target", "Master of Social Sciences in Psychology", 31000, 26000, 2, false, false, 24, [8, 8, 7, 8, 7]],
  ["Chinese University of Hong Kong", "Asia", "Hong Kong", 32, "C", "target", "Psychology / Social science pathway", 29000, 25000, 2, false, false, 30, [8, 8, 7, 8, 7]],
  ["University of Sussex", "UK", "Brighton", 278, "C", "safe", "MSc Foundations of Clinical Psychology and Mental Health", 28000, 19000, 2, false, false, 55, [7, 7, 6, 7, 6]],
  ["University of Kent", "UK", "Canterbury", 380, "C", "safe", "MSc Social and Applied Psychology", 25000, 18000, 2, false, false, 60, [7, 7, 6, 7, 6]],
  ["University of Glasgow", "UK", "Glasgow", 79, "C", "target", "MSc Psychological Science", 31000, 19000, 2, false, false, 38, [7, 7, 6, 8, 6]],
  ["Lund University", "Europe", "Lund", 75, "D", "target", "MSc Psychology / Social scientific data", 0, 16000, 1, false, false, 35, [8, 7, 7, 8, 7]],
  ["KU Leuven", "Europe", "Leuven", 63, "D", "target", "MSc Psychology: Theory and Research", 7500, 16000, 1, false, false, 35, [8, 7, 7, 9, 7]],
  ["Erasmus University Rotterdam", "Europe", "Rotterdam", 140, "D", "target", "MSc Behavioural Economics", 22000, 18000, 1, false, false, 35, [9, 9, 7, 7, 7]],
  ["University of Vienna", "Europe", "Vienna", 152, "D", "safe", "MSc Psychology", 2000, 16000, 1, false, false, 50, [7, 7, 6, 8, 6]],
  ["Ghent University", "Europe", "Ghent", 169, "D", "target", "MSc Psychology", 7000, 16000, 1, false, false, 45, [7, 7, 6, 8, 6]],
  ["Australian National University", "Australia", "Canberra", 32, "D", "target", "Master of Culture, Health and Medicine", 34000, 23000, 3, false, false, 40, [7, 7, 6, 8, 7]],
  ["Aalto University", "Europe", "Espoo", 113, "D", "target", "International Design Business Management", 18000, 17000, 1, false, false, 40, [7, 8, 10, 7, 9]],
  ["University of Stirling", "UK", "Stirling", 517, "D", "safe", "MSc Behavioural Science", 24000, 17000, 2, false, false, 55, [8, 7, 6, 7, 6]],
  ["University of Malaya", "Asia", "Kuala Lumpur", 58, "D", "safe", "Master of Psychological Medicine pathway", 9000, 10000, 1, false, false, 55, [7, 7, 6, 7, 6]],
  ["City University of Hong Kong", "Asia", "Hong Kong", 63, "D", "safe", "Applied Social Sciences pathway", 24000, 24000, 2, false, false, 45, [7, 7, 7, 7, 7]],
  ["Peking University", "Asia", "Beijing", 14, "A", "reach", "Psychology / Social Science graduate pathway", 36000, 18000, 1, false, false, 12, [8, 7, 7, 9, 7]],
  ["Tsinghua University", "Asia", "Beijing", 17, "A", "reach", "Global innovation / social science pathway", 38000, 18000, 1, false, false, 12, [7, 7, 9, 8, 9]],
  ["University of Tokyo", "Asia", "Tokyo", 36, "B", "target", "Psychology / Interdisciplinary information studies pathway", 30000, 22000, 1, false, false, 28, [8, 7, 8, 9, 7]],
  ["Seoul National University", "Asia", "Seoul", 38, "B", "target", "Psychology / Social science graduate pathway", 24000, 18000, 1, false, false, 30, [8, 7, 7, 8, 7]],
] satisfies UniversitySeedRow[]).map((row) => {
  const [name, country, city, qsRanking, tier, difficulty, program, tuition, living, visa, stem, gre, acceptance, scores] = row;
  const [behavioralScienceFit, consumerPsychFit, pmFit, researchFit, startupFit] = scores;
  return {
    name,
    country,
    city,
    qsRanking,
    tier,
    acceptanceDifficulty: difficulty,
    programName: program,
    department: "Psychology / Behavioral Science / Product-adjacent",
    behavioralScienceFit,
    consumerPsychFit,
    pmFit,
    researchFit,
    startupFit,
    ieltsMin: country === "USA" ? 7 : 6.5,
    greRequired: gre,
    greMin: gre ? 320 : null,
    tuitionUsd: tuition,
    livingCostUsd: living,
    scholarshipAvailable: true,
    acceptanceRate: acceptance,
    stemDesignation: stem,
    workVisaYears: visa,
    careerOutcomeScore: Math.min(10, Math.round((pmFit + researchFit + startupFit) / 3) + 1),
    roiScore: Math.min(10, Math.max(5, Math.round((10 - tuition / 15000) + (visa > 1 ? 2 : 1) + behavioralScienceFit / 3))),
    applicationUrl: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${program} admissions`)}`,
    notes: `QS rank is aligned to QS 2026 where available. Currency is stored in USD with conversion notes. Program acceptance and fit values are estimates pending official verification.`,
    isEstimated: true,
    createdAt: now(),
    updatedAt: now(),
  };
});

const scholarshipsSeed = [
  ["Chevening", "UK", "government", 55000, "2026-11-05", "Leadership-focused full scholarship for UK master's study.", "https://www.chevening.org/scholarships/", "medium"],
  ["Commonwealth Master's Scholarship", "UK", "government", 52000, "2026-12-12", "For candidates from eligible Commonwealth countries.", "https://cscuk.fcdo.gov.uk/scholarships/", "medium"],
  ["Fulbright Foreign Student Program", "USA", "government", 60000, "2026-07-15", "Highly competitive US graduate study award.", "https://foreign.fulbrightonline.org/", "low"],
  ["Erasmus Mundus Joint Masters", "Europe", "merit", 55000, "2027-01-10", "EU-funded joint master's scholarship.", "https://erasmus-plus.ec.europa.eu/", "medium"],
  ["DAAD Master's Scholarships", "Germany", "government", 24000, "2026-10-31", "Funding for Germany postgraduate study.", "https://www.daad.de/en/studying-in-germany/scholarships/", "medium"],
  ["GREAT Scholarships", "UK", "merit", 12500, "2027-04-30", "UK university-specific awards for international students.", "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships", "high"],
  ["Gates Cambridge", "UK", "merit", 70000, "2026-12-03", "Full-cost Cambridge award for outstanding applicants.", "https://www.gatescambridge.org/", "low"],
  ["Rhodes Scholarship", "UK", "merit", 75000, "2026-10-02", "Oxford leadership scholarship.", "https://www.rhodeshouse.ox.ac.uk/", "low"],
  ["Marshall Scholarship", "UK", "government", 70000, "2026-09-24", "US citizens only; track as reference, not eligible unless citizenship fits.", "https://www.marshallscholarship.org/", "low"],
  ["Clarendon Scholarship", "UK", "merit", 65000, "2026-12-15", "Oxford graduate scholarship considered with application.", "https://www.ox.ac.uk/clarendon", "low"],
  ["Schwarzman Scholars", "China", "leadership", 70000, "2026-09-12", "Global leadership master's at Tsinghua.", "https://www.schwarzmanscholars.org/", "medium"],
  ["Knight-Hennessy Scholars", "USA", "merit", 85000, "2026-10-08", "Stanford graduate funding.", "https://knight-hennessy.stanford.edu/", "low"],
  ["AAUW International Fellowship", "USA", "women", 25000, "2026-11-15", "Women pursuing graduate study in the US.", "https://www.aauw.org/resources/programs/fellowships-grants/", "medium"],
  ["Inlaks Shivdasani Scholarship", "Global", "merit", 100000, "2027-03-30", "Indian students for top global graduate programs.", "https://www.inlaksfoundation.org/scholarships/", "medium"],
  ["J.N. Tata Endowment", "Global", "need", 12000, "2027-03-21", "Loan scholarship for Indians pursuing higher studies abroad.", "https://jntataendowment.org/", "high"],
  ["KC Mahindra Scholarship", "Global", "merit", 12000, "2027-03-31", "Indian postgraduate study abroad scholarship.", "https://www.kcmet.org/", "high"],
  ["Aga Khan Foundation ISP", "Global", "need", 30000, "2027-03-31", "Need-based graduate support in select countries.", "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarship-programme", "medium"],
  ["Lund Global Scholarship", "Sweden", "merit", 18000, "2027-02-15", "Tuition scholarship for non-EU master's students.", "https://www.lunduniversity.lu.se/", "high"],
  ["KU Leuven Global Minds", "Belgium", "research", 12000, "2027-02-01", "Development and research-focused scholarships.", "https://www.kuleuven.be/global", "medium"],
  ["Erasmus Trustfonds", "Netherlands", "merit", 15000, "2027-04-01", "Erasmus Rotterdam scholarship support.", "https://www.eur.nl/en/education/practical-matters/financial-matters/scholarships", "high"],
  ["Amsterdam Merit Scholarship", "Netherlands", "merit", 25000, "2027-01-15", "University of Amsterdam merit awards.", "https://www.uva.nl/en/education/fees-and-funding/scholarships/scholarships.html", "medium"],
  ["Leiden Excellence Scholarship", "Netherlands", "merit", 19000, "2027-02-01", "Leiden merit scholarship for excellent non-EEA students.", "https://www.universiteitleiden.nl/en/scholarships", "medium"],
  ["Orange Tulip Scholarship", "Netherlands", "merit", 10000, "2027-04-01", "Country-specific Netherlands awards.", "https://www.studyinnl.org/finances/orange-tulip-scholarship-programme", "medium"],
  ["NUS Graduate Scholarship", "Singapore", "research", 30000, "2027-01-15", "Program-specific NUS graduate support.", "https://nus.edu.sg/", "medium"],
  ["NTU Research Scholarship", "Singapore", "research", 32000, "2027-01-31", "Research-based postgraduate support.", "https://www.ntu.edu.sg/admissions/graduate/financialmatters/scholarships", "medium"],
  ["MEXT Scholarship", "Japan", "government", 25000, "2027-06-10", "Japanese government scholarship via embassy/university routes.", "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/", "medium"],
  ["Global Korea Scholarship", "South Korea", "government", 25000, "2027-03-01", "Korean government scholarship for graduate study.", "https://www.studyinkorea.go.kr/", "medium"],
  ["Australia Awards", "Australia", "government", 60000, "2027-04-30", "Australia government scholarship route.", "https://www.dfat.gov.au/people-to-people/australia-awards", "low"],
  ["Melbourne Graduate Scholarship", "Australia", "merit", 20000, "2027-03-31", "University of Melbourne graduate scholarships.", "https://scholarships.unimelb.edu.au/", "medium"],
  ["UCL Global Masters Scholarship", "UK", "need", 20000, "2027-05-01", "Need-based UCL award for international master's students.", "https://www.ucl.ac.uk/scholarships/ucl-global-masters-scholarship", "medium"],
].map(([name, country, type, amountUsd, deadline, eligibilitySummary, url, winningProbability]) => ({
  name: String(name),
  country: String(country),
  type: String(type),
  amountUsd: Number(amountUsd),
  deadline: String(deadline),
  eligibilitySummary: String(eligibilitySummary),
  url: String(url),
  winningProbability: String(winningProbability),
  status: "researching",
  notes: "Seeded deadline should be verified against the latest cycle before applying.",
  createdAt: now(),
  updatedAt: now(),
}));

const careerSeeds = [
  ["Product Manager", 125000, 9.2, "high", ["USA", "UK", "Singapore"], ["Roadmapping", "User research", "Analytics", "Stakeholder management"]],
  ["UX Researcher", 105000, 8.6, "high", ["USA", "UK", "Netherlands"], ["Interviewing", "Mixed methods", "Usability testing", "Insight synthesis"]],
  ["Behavioral Scientist", 98000, 8.1, "high", ["UK", "Europe", "Singapore"], ["Experiment design", "Statistics", "Behavioral economics", "Policy/product translation"]],
  ["Consumer Insights Manager", 112000, 7.8, "high", ["USA", "UK", "Netherlands"], ["Survey design", "Segmentation", "Storytelling", "Market research"]],
  ["Behavioral Designer", 97000, 8.4, "medium", ["UK", "Europe", "Australia"], ["Choice architecture", "Behavior change", "Service design", "Ethics"]],
  ["Growth PM", 135000, 9.4, "high", ["USA", "Singapore", "UK"], ["A/B testing", "Funnels", "SQL", "Experimentation"]],
  ["Innovation Strategist", 118000, 7.6, "medium", ["USA", "UK", "UAE"], ["Trends", "Design thinking", "Business cases", "Research synthesis"]],
  ["Research Scientist", 110000, 7.4, "medium", ["USA", "Canada", "Europe"], ["Publication", "Methods", "Statistics", "Grant writing"]],
  ["Data Scientist (Behavioral)", 130000, 9.1, "high", ["USA", "Canada", "Germany"], ["Python", "Statistics", "Causal inference", "Behavioral data"]],
  ["Design Strategist", 102000, 7.9, "medium", ["USA", "UK", "Australia"], ["Systems thinking", "Research", "Narrative", "Product strategy"]],
].map(([title, avgSalaryUsd, growthRate, demandLevel, topCountries, requiredSkills]) => ({
  title: String(title),
  avgSalaryUsd: Number(avgSalaryUsd),
  growthRate: Number(growthRate),
  demandLevel: String(demandLevel),
  topCountries: topCountries as string[],
  requiredSkills: requiredSkills as string[],
  bestUniversities: [],
  roadmapSteps: ["Build proof portfolio", "Publish one research-backed case study", "Network with 10 professionals", "Apply to aligned programs"],
  description: `${title} path aligned to psychology, behavioral science, product, and digital behavior.`,
  notes: "Seeded salary is USD estimate; verify by country before final planning.",
  createdAt: now(),
  updatedAt: now(),
}));

async function seedIfEmpty() {
  initDb();
  const [{ value: profileRows }] = db.select({ value: count() }).from(profile).all();
  if (profileRows === 0) {
    db.insert(profile).values({
      id: 1,
      name: "Anushka Navin Kumar",
      degree: "BSc Psychology (Honours with Research)",
      university: "Christ University",
      year: "Final Year (4th Year)",
      gpa: null,
      ielts: { planned_date: "2026-10", target: 7.5, current_score: null },
      research: {
        current_paper: "First-Person vs Third-Person Games: Do They Differently Affect Derealization?",
        status: "preparing_for_submission",
        target_submission: "2026-07",
        interests: ["Behavioral Science", "Consumer Psychology", "Cyberpsychology", "Digital Behavior", "HCI", "UX", "Product Psychology"],
      },
      startup: {
        name: "Mentally Prepare",
        focus: ["Student mental health", "Social isolation", "Emotional wellbeing", "Behavioral design"],
      },
      achievements: [
        { title: "HPAIR Harvard Conference Delegate", type: "conference" },
        { title: "HP Dreams Unlocked Top 40 Finalist", type: "competition" },
        { title: "IIT Kharagpur Empresario Semi-Finalist", type: "competition" },
      ],
      experienceTags: [
        "UX Researcher Internship",
        "User interviews",
        "Usability testing",
        "Insight synthesis",
        "Research operations",
        "Psychology internships",
        "Community management",
        "Student engagement",
        "Product building",
        "Behavioral observation",
        "Social media analytics",
      ],
      updatedAt: now(),
    }).run();
  }

  db.insert(universities).values(universitySeeds).onConflictDoNothing().run();
  db.insert(scholarships).values(scholarshipsSeed).onConflictDoNothing().run();
  db.insert(careers).values(careerSeeds).onConflictDoNothing().run();
  db.insert(researchPapers)
    .values({
      title: "First-Person vs Third-Person Games: Do They Differently Affect Derealization?",
      status: "submission",
      targetJournal: "Cyberpsychology / digital behavior journal shortlist",
      impactFactor: null,
      submissionDate: "2026-07-31",
      reviewerComments: null,
      citationCount: 0,
      notes: "Core hidden asset. Convert to abstract, poster, professor outreach, and SOP evidence.",
      createdAt: now(),
      updatedAt: now(),
    })
    .onConflictDoNothing()
    .run();
  db.insert(productPortfolio)
    .values({
      title: "Mentally Prepare",
      type: "startup",
      description: "Student mental health and emotional wellbeing initiative focused on isolation and behavioral design.",
      metrics: { users: null, interviews: 0, experiments: 0, community_size: null },
      status: "active",
      url: null,
      notes: "Use as founder/product proof in applications.",
      createdAt: now(),
      updatedAt: now(),
    })
    .onConflictDoNothing()
    .run();
  db.insert(productPortfolio)
    .values({
      title: "UX Research Internship Evidence Log",
      type: "case_study",
      description: "Current UX Researcher internship proof log: research questions, interviews, usability tests, synthesis, recommendations, and product impact.",
      metrics: { interviews: 0, usability_tests: 0, insight_themes: 0, recommendations_shipped: 0 },
      status: "active",
      url: null,
      notes: "Turn internship work into a portfolio-ready UX research case study for HCI, UX, product psychology, and consumer insights applications.",
      createdAt: now(),
      updatedAt: now(),
    })
    .onConflictDoNothing()
    .run();

  const visaSeeds = [
    ["USA", "F-1 + OPT/STEM OPT", "not_started", 75000, ["I-20", "SEVIS", "DS-160", "Visa appointment", "Funds proof"], "OPT up to 12 months; STEM programs can qualify for 24-month extension.", 3],
    ["UK", "Student visa + Graduate Route", "not_started", 52000, ["CAS", "TB test if required", "Funds proof", "IELTS if needed"], "Graduate Route usually 2 years after eligible degree.", 2],
    ["Canada", "Study permit + PGWP", "not_started", 45000, ["LOA", "GIC/funds", "SOP", "Biometrics"], "PGWP length depends on program length.", 3],
    ["Germany", "Student residence permit", "not_started", 30000, ["Blocked account", "Admission letter", "Insurance"], "Post-study job search route available.", 1.5],
    ["Netherlands", "MVV/residence permit", "not_started", 42000, ["Admission", "Funds proof", "Insurance"], "Orientation year permit available.", 1],
    ["Ireland", "Stamp 2 + graduate scheme", "not_started", 45000, ["Admission", "Funds proof", "Insurance"], "Third Level Graduate Programme may allow stay-back.", 2],
    ["Australia", "Student visa subclass 500", "not_started", 55000, ["CoE", "GTE/GS statement", "Funds", "Health cover"], "Temporary Graduate visa pathway depends on degree and rules.", 2],
    ["Singapore", "Student Pass", "not_started", 48000, ["IPA", "Admission", "Funds", "Medical"], "Work rights are limited during study; employment pass after job offer.", 1],
  ].map(([country, visaType, status, fundsRequiredUsd, documentsChecklist, workRightsSummary, stayBackYears]) => ({
    country: String(country),
    visaType: String(visaType),
    status: String(status),
    fundsRequiredUsd: Number(fundsRequiredUsd),
    documentsChecklist: documentsChecklist as string[],
    workRightsSummary: String(workRightsSummary),
    stayBackYears: Number(stayBackYears),
    timelineNotes: "Verify rules before application because visa policy changes frequently.",
    notes: "",
    createdAt: now(),
    updatedAt: now(),
  }));
  db.insert(visaTracker).values(visaSeeds).onConflictDoNothing().run();

  const existingTasks = db.select({ value: count() }).from(tasks).all()[0]?.value ?? 0;
  if (existingTasks === 0) {
    db.insert(tasks).values([
      { title: "Finish research paper submission package", category: "research", priority: "p1", status: "in_progress", dueDate: "2026-07-31", source: "ai", notes: "Highest leverage action.", createdAt: now(), updatedAt: now() },
      { title: "Build IELTS October preparation calendar", category: "ielts", priority: "p1", status: "todo", dueDate: "2026-06-15", source: "ai", notes: "Target 7.5; writing needs early diagnostics.", createdAt: now(), updatedAt: now() },
      { title: "Convert UX Researcher internship into a case study", category: "portfolio", priority: "p1", status: "todo", dueDate: "2026-08-20", source: "manual", notes: "Document research goal, method, interview/usability evidence, insights, recommendation, and product impact.", createdAt: now(), updatedAt: now() },
      { title: "Create professor CRM shortlist for UCL, LSE, Bath, Erasmus", category: "network", priority: "p2", status: "todo", dueDate: "2026-06-20", source: "ai", notes: "Professor CRM is a top ROI feature.", createdAt: now(), updatedAt: now() },
    ]).run();
  }

  const existingSops = db.select({ value: count() }).from(sopDocuments).all()[0]?.value ?? 0;
  if (existingSops === 0) {
    db.insert(sopDocuments).values({
      title: "Master Story Bank",
      type: "story_bank",
      targetUniversityId: null,
      content: "Psychology researcher + Mentally Prepare founder + digital behavior/product psychology explorer.",
      version: 1,
      status: "draft",
      notes: "Use as source material for all SOP drafts.",
      createdAt: now(),
      updatedAt: now(),
    }).run();
  }

  const existingLors = db.select({ value: count() }).from(lorContacts).all()[0]?.value ?? 0;
  if (existingLors === 0) {
    db.insert(lorContacts).values([
      { name: "Research Supervisor", role: "Faculty mentor", relationship: "research_supervisor", email: null, institution: "Christ University", strengthScore: 8, status: "not_requested", deadline: "2026-09-15", targetUniversities: [], notes: "Best for research credibility.", createdAt: now(), updatedAt: now() },
      { name: "Internship Mentor", role: "Professional mentor", relationship: "internship_mentor", email: null, institution: "Psychology internship", strengthScore: 7, status: "not_requested", deadline: "2026-09-30", targetUniversities: [], notes: "Best for applied psychology and work ethic.", createdAt: now(), updatedAt: now() },
    ]).run();
  }

  const existingIelts = db.select({ value: count() }).from(ieltsProgress).all()[0]?.value ?? 0;
  if (existingIelts === 0) {
    db.insert(ieltsProgress).values({ date: "2026-06-01", listening: null, reading: null, writing: null, speaking: null, overall: null, isMock: true, notes: "Add first diagnostic mock score.", createdAt: now() }).run();
  }

  const existingPeople = db.select({ value: count() }).from(people).all()[0]?.value ?? 0;
  if (existingPeople === 0) {
    db.insert(people).values([
      { name: "UCL HCI / cognition faculty lead", type: "professor", universityId: null, role: "Professor", email: null, linkedin: null, researchArea: "Cognitive science, HCI, decision-making", lab: "To verify", recentPublications: [], matchScore: 86, status: "not_contacted", lastInteraction: null, nextFollowUp: "2026-06-20", notes: "Placeholder lead for Faculty Intelligence CRM.", createdAt: now(), updatedAt: now() },
      { name: "Erasmus behavioral economics faculty lead", type: "professor", universityId: null, role: "Professor", email: null, linkedin: null, researchArea: "Behavioral economics, consumer decision-making", lab: "To verify", recentPublications: [], matchScore: 88, status: "not_contacted", lastInteraction: null, nextFollowUp: "2026-06-20", notes: "Replace with verified professor after research scan.", createdAt: now(), updatedAt: now() },
    ]).run();
  }

  const existingApps = db.select({ value: count() }).from(applications).all()[0]?.value ?? 0;
  const allUniversities = db.select().from(universities).all();
  if (existingApps === 0) {
    const shortlistNames = ["UCL", "London School of Economics", "University of Bath", "Erasmus University Rotterdam", "University of Amsterdam", "University of Pennsylvania"];
    const appRows = allUniversities
      .filter((uni) => shortlistNames.includes(uni.name))
      .map((uni) => ({
        universityId: uni.id,
        program: uni.programName,
        status: "researching",
        deadline: "2027-01-15",
        submittedDate: null,
        notes: "Seeded from Anushka OS shortlist.",
        createdAt: now(),
        updatedAt: now(),
      }));
    db.insert(applications).values(appRows).run();
    db.insert(universityShortlist).values(appRows.map((row, index) => ({
      universityId: row.universityId,
      status: "researching",
      priority: index + 1,
      notes: "Initial shortlist; edit priority after research.",
      deadline: row.deadline,
      createdAt: now(),
      updatedAt: now(),
    }))).run();
  }
}

seedIfEmpty();
console.log("Anushka OS seed complete.");
