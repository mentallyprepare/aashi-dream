import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  degree: text("degree").notNull(),
  university: text("university").notNull(),
  year: text("year").notNull(),
  gpa: real("gpa"),
  ielts: text("ielts", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  research: text("research", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  startup: text("startup", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  achievements: text("achievements", { mode: "json" }).$type<Array<Record<string, unknown>>>().notNull(),
  experienceTags: text("experience_tags", { mode: "json" }).$type<string[]>().notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const universities = sqliteTable("universities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  qsRanking: integer("qs_ranking"),
  programName: text("program_name").notNull(),
  department: text("department").notNull(),
  behavioralScienceFit: integer("behavioral_science_fit").notNull(),
  consumerPsychFit: integer("consumer_psych_fit").notNull(),
  pmFit: integer("pm_fit").notNull(),
  researchFit: integer("research_fit").notNull(),
  startupFit: integer("startup_fit").notNull(),
  ieltsMin: real("ielts_min").notNull(),
  greRequired: integer("gre_required", { mode: "boolean" }).notNull(),
  greMin: integer("gre_min"),
  tuitionUsd: integer("tuition_usd").notNull(),
  livingCostUsd: integer("living_cost_usd").notNull(),
  scholarshipAvailable: integer("scholarship_available", { mode: "boolean" }).notNull(),
  acceptanceRate: real("acceptance_rate"),
  acceptanceDifficulty: text("acceptance_difficulty").notNull(),
  stemDesignation: integer("stem_designation", { mode: "boolean" }).notNull(),
  workVisaYears: real("work_visa_years").notNull(),
  careerOutcomeScore: integer("career_outcome_score").notNull(),
  roiScore: integer("roi_score").notNull(),
  tier: text("tier").notNull(),
  applicationUrl: text("application_url").notNull(),
  notes: text("notes").notNull(),
  isEstimated: integer("is_estimated", { mode: "boolean" }).notNull(),
  ...timestamps,
});

export const universityShortlist = sqliteTable("university_shortlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: integer("university_id").notNull(),
  status: text("status").notNull(),
  priority: integer("priority").notNull(),
  notes: text("notes").notNull(),
  deadline: text("deadline"),
  ...timestamps,
});

export const scholarships = sqliteTable("scholarships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  country: text("country").notNull(),
  type: text("type").notNull(),
  amountUsd: integer("amount_usd"),
  deadline: text("deadline"),
  eligibilitySummary: text("eligibility_summary").notNull(),
  url: text("url").notNull(),
  winningProbability: text("winning_probability").notNull(),
  status: text("status").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const careers = sqliteTable("careers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  avgSalaryUsd: integer("avg_salary_usd").notNull(),
  growthRate: real("growth_rate").notNull(),
  demandLevel: text("demand_level").notNull(),
  topCountries: text("top_countries", { mode: "json" }).$type<string[]>().notNull(),
  requiredSkills: text("required_skills", { mode: "json" }).$type<string[]>().notNull(),
  bestUniversities: text("best_universities", { mode: "json" }).$type<number[]>().notNull(),
  roadmapSteps: text("roadmap_steps", { mode: "json" }).$type<string[]>().notNull(),
  description: text("description").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const researchPapers = sqliteTable("research_papers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  status: text("status").notNull(),
  targetJournal: text("target_journal"),
  impactFactor: real("impact_factor"),
  submissionDate: text("submission_date"),
  reviewerComments: text("reviewer_comments"),
  citationCount: integer("citation_count").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const ieltsProgress = sqliteTable("ielts_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  listening: real("listening"),
  reading: real("reading"),
  writing: real("writing"),
  speaking: real("speaking"),
  overall: real("overall"),
  isMock: integer("is_mock", { mode: "boolean" }).notNull(),
  notes: text("notes").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sopDocuments = sqliteTable("sop_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  targetUniversityId: integer("target_university_id"),
  content: text("content").notNull(),
  version: integer("version").notNull(),
  status: text("status").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const lorContacts = sqliteTable("lor_contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  relationship: text("relationship").notNull(),
  email: text("email"),
  institution: text("institution").notNull(),
  strengthScore: integer("strength_score").notNull(),
  status: text("status").notNull(),
  deadline: text("deadline"),
  targetUniversities: text("target_universities", { mode: "json" }).$type<number[]>().notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: integer("university_id").notNull(),
  program: text("program").notNull(),
  status: text("status").notNull(),
  deadline: text("deadline"),
  submittedDate: text("submitted_date"),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const visaTracker = sqliteTable("visa_tracker", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  country: text("country").notNull().unique(),
  visaType: text("visa_type").notNull(),
  status: text("status").notNull(),
  fundsRequiredUsd: integer("funds_required_usd").notNull(),
  documentsChecklist: text("documents_checklist", { mode: "json" }).$type<string[]>().notNull(),
  workRightsSummary: text("work_rights_summary").notNull(),
  stayBackYears: real("stay_back_years").notNull(),
  timelineNotes: text("timeline_notes").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const productPortfolio = sqliteTable("product_portfolio", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metrics: text("metrics", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull(),
  url: text("url"),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const aiReports = sqliteTable("ai_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportType: text("report_type").notNull(),
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  generatedAt: text("generated_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date"),
  source: text("source").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  universityId: integer("university_id"),
  role: text("role").notNull(),
  email: text("email"),
  linkedin: text("linkedin"),
  researchArea: text("research_area"),
  lab: text("lab"),
  recentPublications: text("recent_publications", { mode: "json" }).$type<string[]>().notNull(),
  matchScore: integer("match_score").notNull(),
  status: text("status").notNull(),
  lastInteraction: text("last_interaction"),
  nextFollowUp: text("next_follow_up"),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  status: text("status").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const courseIntelligence = sqliteTable("course_intelligence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: integer("university_id").notNull(),
  programName: text("program_name").notNull(),
  intakeTerm: text("intake_term").notNull(),
  intakeFrequency: text("intake_frequency").notNull(),
  intakeCount: integer("intake_count"),
  intakeCountStatus: text("intake_count_status").notNull(),
  applicationStatus: text("application_status").notNull(),
  applicationOpenDate: text("application_open_date"),
  applicationCloseDate: text("application_close_date"),
  priorityFundingDate: text("priority_funding_date"),
  courseSummary: text("course_summary").notNull(),
  moduleHighlights: text("module_highlights", { mode: "json" }).$type<string[]>().notNull(),
  researchHighlights: text("research_highlights", { mode: "json" }).$type<string[]>().notNull(),
  researchFitActions: text("research_fit_actions", { mode: "json" }).$type<string[]>().notNull(),
  requirementHighlights: text("requirement_highlights", { mode: "json" }).$type<string[]>().notNull(),
  sourceUrls: text("source_urls", { mode: "json" }).$type<Array<{ label: string; url: string }>>().notNull(),
  sourceConfidence: text("source_confidence").notNull(),
  lastVerifiedAt: text("last_verified_at").notNull(),
  nextCheckDate: text("next_check_date").notNull(),
  notes: text("notes").notNull(),
  ...timestamps,
});

export const schema = {
  profile,
  universities,
  universityShortlist,
  scholarships,
  careers,
  researchPapers,
  ieltsProgress,
  sopDocuments,
  lorContacts,
  applications,
  visaTracker,
  productPortfolio,
  aiReports,
  tasks,
  people,
  documents,
  courseIntelligence,
};
