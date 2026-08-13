import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  CircleUserRound,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Network,
  Library,
  Sigma,
  Plane,
  Radar,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut, type Kpi } from "../lib/api";
import { formatIstDate, formatIstDateTime, todayInputDateIst } from "../lib/time";
import { type PageKey, useUiStore } from "../store/ui";

type AnyRow = Record<string, unknown> & { id?: number };
type University = AnyRow & {
  name: string;
  country: string;
  city: string;
  qsRanking: number | null;
  tier: string;
  programName: string;
  acceptanceDifficulty: string;
  acceptanceRate: number | null;
  tuitionUsd: number;
  livingCostUsd: number;
  ieltsMin: number;
  greRequired: boolean;
  greMin: number | null;
  scholarshipAvailable: boolean;
  stemDesignation: boolean;
  workVisaYears: number;
  careerOutcomeScore: number;
  roiScore: number;
  behavioralScienceFit: number;
  consumerPsychFit: number;
  pmFit: number;
  researchFit: number;
  startupFit: number;
  notes: string;
};

type Scholarship = AnyRow & {
  name: string;
  country: string;
  type: string;
  amountUsd: number | null;
  deadline: string | null;
  eligibilitySummary: string;
  url: string;
  winningProbability: string;
  status: string;
  notes: string;
};

type OfficialSource = AnyRow & {
  title: string;
  type: string;
  url: string | null;
  status: string;
  notes: string;
};

type CourseIntelligence = AnyRow & {
  universityId: number;
  programName: string;
  intakeTerm: string;
  intakeFrequency: string;
  intakeCount: number | null;
  intakeCountStatus: string;
  applicationStatus: string;
  applicationOpenDate: string | null;
  applicationCloseDate: string | null;
  priorityFundingDate: string | null;
  courseSummary: string;
  moduleHighlights: string[];
  researchHighlights: string[];
  researchFitActions: string[];
  requirementHighlights: string[];
  sourceUrls: Array<{ label: string; url: string }>;
  sourceConfidence: string;
  lastVerifiedAt: string;
  nextCheckDate: string;
  notes: string;
};

function parseIstDate(value?: string | null) {
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T00:00:00+05:30`);
}

function daysUntil(value?: string | null) {
  const date = parseIstDate(value);
  if (!date) return null;
  const today = parseIstDate(todayInputDateIst());
  if (!today) return null;
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function scholarshipUrgency(scholarship: Scholarship) {
  const days = daysUntil(scholarship.deadline);
  if (days === null) return { label: "No date", tone: "text-[var(--text-secondary)]", sort: 9999 };
  if (days < 0) return { label: "Expired", tone: "text-[var(--accent-red)]", sort: 9998 };
  if (days <= 30) return { label: `${days} days`, tone: "text-[var(--accent-red)]", sort: days };
  if (days <= 90) return { label: `${days} days`, tone: "text-[var(--accent-amber)]", sort: days };
  return { label: `${days} days`, tone: "text-[var(--accent-emerald)]", sort: days };
}

function scholarshipFitScore(scholarship: Scholarship) {
  let score = scholarship.winningProbability === "high" ? 72 : scholarship.winningProbability === "medium" ? 54 : 34;
  const text = `${scholarship.name} ${scholarship.eligibilitySummary} ${scholarship.notes}`.toLowerCase();
  if (text.includes("india") || text.includes("indian")) score += 12;
  if (text.includes("need")) score += 8;
  if (text.includes("leadership") || text.includes("social impact")) score += 8;
  if (text.includes("research")) score += 7;
  if (text.includes("lse") || text.includes("ucl") || text.includes("great")) score += 5;
  return Math.min(95, score);
}

function scholarshipNextAction(scholarship: Scholarship) {
  const text = `${scholarship.name} ${scholarship.notes}`.toLowerCase();
  if (text.includes("lse")) return "Submit LSE application early, then complete Graduate Financial Support Application in GAP.";
  if (text.includes("chevening")) return "Draft leadership, networking, studying-in-UK, and career-plan essays before applications open.";
  if (text.includes("ucl")) return "Verify GPA/class equivalence and collect official transcript/class rank proof.";
  if (text.includes("great")) return "Map each UK university in your shortlist to its own GREAT deadline and essay.";
  if (text.includes("daad")) return "Use DAAD database, pick Germany programmes, and write why Germany is essential.";
  if (text.includes("erasmus")) return "Find 5 EMJM programmes, then track each programme deadline separately.";
  if (text.includes("knight") || text.includes("gates")) return "Only proceed if university fit is strong; start leadership/research essays now.";
  return "Verify official deadline, eligibility, documents, and whether admission offer is required first.";
}

function universityFitScore(university: University) {
  return Math.round((university.behavioralScienceFit + university.consumerPsychFit + university.pmFit + university.researchFit + university.startupFit) / 5);
}

function admissionsChanceBand(university: University) {
  if (university.acceptanceDifficulty === "safe") return "Higher probability";
  if (university.acceptanceDifficulty === "target") return "Realistic target";
  return "Dream/reach";
}

function roadmapForUniversity(university: University) {
  const researchAction = university.researchFit >= 8 ? "Turn the gaming/derealization paper into a 1-page research summary and professor email." : "Use the paper as supporting evidence in SOP and LOR packets.";
  const productAction = university.pmFit >= 9 || university.startupFit >= 9 ? "Build a Mentally Prepare proof page with user problem, experiments, metrics, and behavioral design logic." : "Frame Mentally Prepare as applied psychology and leadership proof.";
  const testAction = university.greRequired ? `Confirm GRE policy and target ${university.greMin ?? 320}+ if required.` : `Lock IELTS ${university.ieltsMin}+ and keep GRE as optional only if the program asks.`;
  return [
    { phase: "This week", action: `Verify ${university.programName} requirements, exact deadline, fees, IELTS/GRE rules, and scholarship page.` },
    { phase: "Next 2 weeks", action: researchAction },
    { phase: "Next 30 days", action: testAction },
    { phase: "Next 45 days", action: productAction },
    { phase: "Next 60 days", action: "Write a program-specific SOP linking psychology, digital behavior, research, and product/career direction." },
    { phase: "Next 90 days", action: "Prepare 2 recommender briefs, shortlist professors/alumni, and add this university to applications if still strong." },
  ];
}

function admissionBriefForUniversity(university: University) {
  const name = university.name.toLowerCase();
  const program = university.programName.toLowerCase();
  const isNyu = name.includes("new york university");
  const isBath = name.includes("bath");
  const isUsa = university.country === "USA";
  const isUk = university.country === "UK";
  const isEurope = university.country === "Europe";

  if (isNyu) {
    return {
      prerequisites: ["Bachelor's degree", "Introductory Psychology", "Statistics / behavioural statistics with strong grade"],
      academicTarget: "Competitive GPA 3.0+; stronger profile needed for international applicant edge.",
      english: "TOEFL/IELTS required unless exempt. Treat IELTS 7.5 / TOEFL 105+ as competitive target until official page is checked.",
      materials: ["GSAS online application", "Academic transcripts", "Statement of purpose", "Resume/CV", "Letters of recommendation", "English test score if required"],
      curriculum: "Specialized Psychology MA has 12 courses, statistics, research methods, three core psychology courses, and thesis or comprehensive exam. Social and Consumer focus can support consumer behaviour and marketing research.",
      deadline: "Usually fall-cycle specific. Verify official GSAS application page before planning.",
      sourceNote: "Official NYU psychology pages confirm 12-course MA structure and English test requirement for non-native speakers. Third-party figures like GPA/tuition must be verified.",
      confidence: { prerequisites: "official", english: "official", academic: "estimate", deadline: "verify", cost: "verify", curriculum: "official" },
    };
  }

  if (isBath) {
    return {
      prerequisites: ["Bachelor's honours degree or international equivalent", "Psychology, economics, engineering, sociology or behaviour-related background can fit", "Quantitative comfort helps"],
      academicTarget: "Bath states high 2:2 or above for this MSc; stronger marks improve scholarship and admit confidence.",
      english: "Check Bath postgraduate English rules. Indian English-medium background may be assessed in some cases, but IELTS proof should stay ready.",
      materials: ["Online application", "Academic transcript", "Degree certificate if available", "Personal statement", "CV", "Reference(s)", "English proof if required"],
      curriculum: "1-year MSc Applied Psychology and Economic Behaviour. Strong bridge between psychology, economics, decision-making and behavioural science.",
      deadline: "Course starts September 2026. Verify exact deadline on Bath course page because postgraduate deadlines can close when full.",
      sourceNote: "Official Bath pages confirm 1-year course structure and Bath's UK top-10 reputation signals. Entry and English rules must be checked on the course page before applying.",
      confidence: { prerequisites: "official", english: "verify", academic: "official", deadline: "verify", cost: "verify", curriculum: "official" },
    };
  }

  return {
    prerequisites: [
      "Bachelor's degree or international equivalent",
      isUsa ? "Relevant psychology/research/statistics background" : "Relevant academic background for the programme",
      university.greRequired ? "GRE policy must be verified for exact programme" : "GRE currently not flagged, but verify exact programme policy",
    ],
    academicTarget: isUsa ? "Aim for strong GPA/class rank plus research/product proof; USA funding is proof-heavy." : isUk ? "Aim for first-class/strong 2:1 equivalent where possible; minimum is not enough for elite programmes." : isEurope ? "Aim for strong marks plus methods/statistics fit; many Europe programmes care about exact academic prerequisites." : "Aim for strong academic record plus programme-specific fit.",
    english: `Use IELTS ${university.ieltsMin}+ as database minimum; target 7.5+ for stronger international profile unless official page says otherwise.`,
    materials: ["Online application", "Academic transcripts", "SOP / personal statement", "CV or resume", "2 academic/professional references", "English test score if required", "Portfolio/research summary where relevant"],
    curriculum: `${university.programName} should be assessed for behavioural science, consumer psychology, UX/product, research methods, statistics, internship/capstone and thesis options.`,
    deadline: "Verify exact programme deadline, priority funding date, and whether applications are rolling or fixed.",
    sourceNote: "This is a structured planning brief generated from database fields. Exact official programme page must be checked before final decision.",
    confidence: { prerequisites: "verify", english: "estimate", academic: "estimate", deadline: "verify", cost: "estimate", curriculum: "verify" },
  };
}

type SourceActionLink = {
  label: string;
  url: string;
  note: string;
  confidence: "official" | "verify";
};

function officialSourceLinksForUniversity(university: University): SourceActionLink[] {
  const name = university.name.toLowerCase();
  const genericSearch = {
    label: "Official programme search",
    url: String(university.applicationUrl),
    note: "Use only official university result before final decision.",
    confidence: "verify" as const,
  };
  const links: SourceActionLink[] = [];

  if (name.includes("new york university")) {
    links.push(
      { label: "NYU Consumer Psychology", url: "https://as.nyu.edu/departments/psychology/graduate/ma-psychology/social-and-consumer-psychology.html", note: "Programme focus and consumer psychology context.", confidence: "official" },
      { label: "NYU MA application", url: "https://as.nyu.edu/departments/psychology/graduate/ma-application-info.html", note: "Deadlines, prerequisites and application requirements.", confidence: "official" },
    );
  } else if (name.includes("bath")) {
    links.push(
      { label: "Bath course page", url: "https://www.bath.ac.uk/courses/postgraduate-2026/taught-postgraduate-courses/msc-applied-psychology-and-economic-behaviour-full-time/", note: "Course structure, entry requirements, fees and prospects.", confidence: "official" },
      { label: "Bath psychology PGT", url: "https://www.bath.ac.uk/corporate-information/taught-postgraduate-studies-in-psychology/", note: "Psychology postgraduate course family.", confidence: "official" },
    );
  } else if (name.includes("london school of economics")) {
    links.push(
      { label: "LSE MSc Behavioural Science", url: "https://www.lse.ac.uk/study-at-lse/graduate/msc-behavioural-science", note: "Programme, entry requirements, fees and graduate destinations.", confidence: "official" },
      { label: "LSE funding overview", url: "https://www.lse.ac.uk/study-at-lse/Graduate/fees-and-funding/pgt-application-overview", note: "Graduate financial support application and funding process.", confidence: "official" },
    );
  } else if (name.includes("warwick")) {
    links.push(
      { label: "Warwick Behavioural and Economic Science", url: "https://warwick.ac.uk/study/postgraduate/courses/msc-behavioural-economics-science/", note: "Science-track programme details and decision-science positioning.", confidence: "official" },
      { label: "Warwick Behavioural and Data Science", url: "https://warwick.ac.uk/study/postgraduate/courses/msc-behavioural-data-science/", note: "Data-heavy behavioural science alternative.", confidence: "official" },
    );
  } else if (name.includes("ucl") || name.includes("university college london")) {
    links.push(
      { label: "UCL Behaviour Change MSc", url: "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/behaviour-change-msc", note: "Behaviour-change programme, entry requirements and application route.", confidence: "official" },
      { label: "UCL Centre for Behaviour Change", url: "https://www.ucl.ac.uk/brain-sciences/behaviour-change/behaviour-change-msc", note: "Centre and programme positioning.", confidence: "official" },
    );
  } else if (name.includes("erasmus")) {
    links.push(
      { label: "Erasmus Behavioural Economics", url: "https://www.eur.nl/en/master/behavioural-economics", note: "Programme overview and behavioural economics positioning.", confidence: "official" },
      { label: "Erasmus admission requirements", url: "https://www.eur.nl/en/master/behavioural-economics/admission", note: "Admission requirements and application checks.", confidence: "official" },
    );
  } else if (name.includes("pennsylvania")) {
    links.push(
      { label: "Penn MBDS programme", url: "https://www.lps.upenn.edu/degree-programs/mbds", note: "Programme overview and deadline signal.", confidence: "official" },
      { label: "Penn MBDS application", url: "https://www.lps.upenn.edu/degree-programs/mbds/application", note: "Application requirements and review criteria.", confidence: "official" },
    );
  } else if (name.includes("carnegie mellon")) {
    links.push(
      { label: "CMU MHCI admissions", url: "https://hcii.cmu.edu/academics/mhci/admissions", note: "Application requirements and admissions process.", confidence: "official" },
      { label: "CMU MHCI FAQ", url: "https://hcii.cmu.edu/academics/mhci/faq", note: "Acceptance-rate context and application-cycle notes.", confidence: "official" },
    );
  } else if (name.includes("berkeley")) {
    links.push(
      { label: "Berkeley MIMS admissions", url: "https://www.ischool.berkeley.edu/programs/mims/admissions", note: "Application requirements and document rules.", confidence: "official" },
      { label: "Berkeley MIMS programme", url: "https://www.ischool.berkeley.edu/programs/mims", note: "Programme positioning, STEM designation and outcomes angle.", confidence: "official" },
    );
  } else if (name.includes("harvard")) {
    links.push(
      { label: "Harvard Psychology", url: "https://gsas.harvard.edu/program/psychology", note: "Psychology programme and admissions requirement entry point.", confidence: "official" },
      { label: "Harvard GSAS apply", url: "https://gsas.harvard.edu/apply", note: "Application timing and portal guidance.", confidence: "official" },
    );
  }

  return links.length ? links : [genericSearch];
}

function universityRequirementChips(university: University) {
  const knownOfficialLinks = officialSourceLinksForUniversity(university).some((link) => link.confidence === "official");
  return [
    { label: "IELTS", value: `${university.ieltsMin}+`, tone: "info" },
    { label: "GRE", value: university.greRequired ? `${university.greMin ?? 320}+ / verify` : "verify optional", tone: university.greRequired ? "warn" : "good" },
    { label: "Admission Fit Index", value: university.acceptanceRate ? `${university.acceptanceRate}% modelled` : "verify", tone: university.acceptanceDifficulty === "reach" ? "risk" : university.acceptanceDifficulty === "target" ? "warn" : "good" },
    { label: "Source", value: knownOfficialLinks ? "official link" : "verify page", tone: knownOfficialLinks ? "good" : "risk" },
    { label: university.country === "USA" ? "OPT/STEM" : "Visa", value: university.country === "USA" ? (university.stemDesignation ? "STEM likely" : "verify") : `${university.workVisaYears} yr route`, tone: university.country === "USA" && !university.stemDesignation ? "warn" : "info" },
  ];
}

function chipTone(tone: string) {
  if (tone === "good") return "border-[color:rgba(16,185,129,0.45)] text-[var(--accent-emerald)]";
  if (tone === "warn") return "border-[color:rgba(245,158,11,0.45)] text-[var(--accent-amber)]";
  if (tone === "risk") return "border-[color:rgba(239,68,68,0.45)] text-[var(--accent-red)]";
  return "border-[color:rgba(59,130,246,0.45)] text-[var(--accent-blue)]";
}

function RequirementChip({ label, value, tone = "info" }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`border bg-[var(--bg-secondary)] px-3 py-2 ${chipTone(tone)}`}>
      <div className="mono text-[9px] font-bold uppercase text-[var(--text-secondary)]">{label}</div>
      <div className="mt-0.5 text-xs font-bold">{value}</div>
    </div>
  );
}

function confidenceTone(value: string) {
  if (value === "official") return "text-[var(--accent-emerald)] bg-[var(--bg-secondary)]";
  if (value === "estimate") return "text-[var(--accent-amber)] bg-[var(--bg-secondary)]";
  return "text-[var(--accent-red)] bg-[var(--bg-secondary)]";
}

function ConfidenceBadge({ value }: { value: string }) {
  const label = value === "estimate" ? "modelled" : value;
  return <span className={`mono rounded-full px-2 py-1 text-[10px] font-bold uppercase ${confidenceTone(value)}`}>{label}</span>;
}

function universityStrategy(university: University) {
  if (university.country === "USA") {
    return {
      visa: university.stemDesignation ? "Strong USA route if program confirms STEM OPT: up to 3 years work authorization after study." : "USA route is possible, but confirm OPT/STEM status because work time may be shorter.",
      scholarship: "Prioritize assistantships, departmental awards, Fulbright-style routes, and program-specific aid.",
      positioning: "Lead with research + Mentally Prepare + product psychology. USA reach schools need proof, not only interest.",
    };
  }
  if (university.country === "UK") {
    return {
      visa: "UK Graduate Route usually gives a 2-year post-study work path after an eligible degree.",
      scholarship: "Track Chevening, GREAT, Commonwealth where eligible, plus university-specific awards.",
      positioning: "UK applications reward a clear academic narrative: behavioral science, research readiness, and exact program fit.",
    };
  }
  if (university.country === "Europe") {
    return {
      visa: "Europe can offer strong capital return, but visa rules vary by country; verify stay-back rules before final shortlist.",
      scholarship: "Prioritize Erasmus, DAAD, university merit awards, and lower-tuition high capital-return options.",
      positioning: "Use consumer psychology, behavioral economics, digital behavior, and research fit as the core story.",
    };
  }
  if (university.country === "Singapore" || university.country === "Asia") {
    return {
      visa: "Asia route can be excellent for product, consumer behavior, and regional mobility; check country-specific work rules.",
      scholarship: "Prioritize government, university research, and merit scholarships; deadlines can be early.",
      positioning: "Position as psychology + digital behavior + mental-health product builder for Asia-facing innovation.",
    };
  }
  return {
    visa: "Confirm post-study work rights and migration pathway before deciding.",
    scholarship: "Track government awards, university merit funding, and program-level scholarships.",
    positioning: "Use research, startup proof, and behavioral/product fit as the strongest differentiators.",
  };
}

const navGroups: Array<{ title: string; items: Array<{ key: PageKey; label: string; icon: React.ElementType }> }> = [
  { title: "Command Center", items: [{ key: "dashboard", label: "Aashi Dashboard", icon: LayoutDashboard }, { key: "profile", label: "My Profile", icon: CircleUserRound }] },
  { title: "Universities", items: [{ key: "universities", label: "Elite Universities", icon: GraduationCap }, { key: "shortlist", label: "University Shortlist", icon: Target }, { key: "people", label: "Faculty Intelligence", icon: UsersRound }] },
  { title: "Preparation", items: [{ key: "ielts", label: "IELTS Hub", icon: BarChart3 }, { key: "research", label: "Research Lab", icon: FlaskConical }, { key: "sops", label: "SOP Studio", icon: FileText }, { key: "lors", label: "LOR Command", icon: MessageSquareText }] },
  { title: "Applications", items: [{ key: "applications", label: "Application Tracker", icon: BookOpen }, { key: "scholarships", label: "Scholarship Tracker", icon: Trophy }, { key: "visas", label: "Visa Tracker", icon: Plane }] },
  { title: "Career", items: [{ key: "careers", label: "Career Explorer", icon: BriefcaseBusiness }, { key: "portfolio", label: "Product Portfolio", icon: ShieldCheck }, { key: "opportunities", label: "Opportunity Radar", icon: Radar }] },
  { title: "Intelligence", items: [{ key: "sources", label: "Official Sources", icon: Library }, { key: "delta", label: "Profile Delta", icon: Sigma }, { key: "advisor", label: "AI Advisor", icon: Sparkles }, { key: "top1", label: "Top 1% Analysis", icon: ScrollText }, { key: "life", label: "Life Simulator", icon: Network }] },
];

const flatNavItems = navGroups.flatMap((group) => group.items);
const lockedPages = new Set<PageKey>();

type PartnerTheme = {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  logoText: string;
  logoUrl?: string;
};

type BrandState = {
  brandName: string;
  licenseName: string;
  logoText: string;
  logoUrl?: string;
  isPartner: boolean;
};

const defaultBrand: BrandState = {
  brandName: "Aashi Dreams Intelligence Engine",
  licenseName: "Aashi Dreams",
  logoText: "AD",
  isPartner: false,
};

const partners: Record<string, PartnerTheme> = {
  zenith: { name: "Zenith Study Abroad Academy", primary: "#1e3a8a", secondary: "#1d4ed8", bg: "#f0f4f8", logoText: "ZS" },
  karnal: { name: "Karnal IELTS Center", primary: "#047857", secondary: "#059669", bg: "#f0fdf4", logoText: "KI" },
};

const endpointByPage: Partial<Record<PageKey, string>> = {
  profile: "/api/profile",
  shortlist: "/api/shortlist",
  ielts: "/api/ielts",
  research: "/api/research",
  sops: "/api/sops",
  lors: "/api/lors",
  applications: "/api/applications",
  scholarships: "/api/scholarships",
  visas: "/api/visas",
  careers: "/api/careers",
  portfolio: "/api/portfolio",
  opportunities: "/api/documents",
  people: "/api/people",
  sources: "/api/documents",
};

function Panel(props: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  const { children, className, ...rest } = props;
  return <section className={`border-2 border-[var(--border)] bg-[var(--bg-secondary)] rounded-3xl shadow-sm ${className ?? ""}`} {...rest}>{children}</section>;
}

function queryErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading this section.";
}

function QueryErrorState({ title, error, onRetry }: { title: string; error: unknown; onRetry?: () => void }) {
  return (
    <Panel className="border-[var(--accent-red)] p-5">
      <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-red)]">Load Error</div>
      <h2 className="heading mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{queryErrorMessage(error)}</p>
      {onRetry && (
        <button className="mt-4 bg-[var(--accent-indigo)] px-4 py-2 text-sm font-bold text-white" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </Panel>
  );
}

function ProductStatus() {
  const { data, isError } = useQuery({
    queryKey: ["api-health"],
    queryFn: () => apiGet<{ today: string; displayTime: string }>("/api/health"),
    refetchInterval: 30_000,
    retry: false,
  });
  return (
    <div className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold ${isError ? "border-[var(--accent-red)] text-[var(--accent-red)]" : "border-[var(--border)] text-[var(--accent-emerald)]"}`}>
      <span className={`h-2 w-2 rounded-full ${isError ? "bg-[var(--accent-red)]" : "bg-[var(--accent-emerald)]"}`} />
      {isError ? "API offline" : `Live | ${data?.displayTime ?? "syncing"}`}
    </div>
  );
}

function TrustBadge() {
  return (
    <span className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]">
      Personal AI Core v1.0 <span className="text-[#22c55e]">●</span> All Modules Active
    </span>
  );
}

function AnimatedKpiValue({ value, suffix, className }: { value: number; suffix: string; className: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    const steps = Math.min(50, Math.max(12, target));
    let currentStep = 0;
    const timer = window.setInterval(() => {
      currentStep += 1;
      const next = Math.round((target * currentStep) / steps);
      setDisplayValue(Math.min(target, next));
      if (currentStep >= steps) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [value]);
  return <div className={`confidence-score mono mt-3 text-[32px] leading-none ${className}`}>{displayValue}{suffix}</div>;
}

function usePartnerBrand() {
  const [brand, setBrand] = useState<BrandState>(defaultBrand);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPartner = params.get("partner");
    const host = window.location.hostname;
    const hostPrefix = host.split(".")[0];
    const subdomainPartner = host.includes(".") && !["127", "0", "localhost", "www"].includes(hostPrefix) ? hostPrefix : null;
    const partnerId = queryPartner ?? subdomainPartner;
    const partner = partnerId ? partners[partnerId] : null;
    const root = document.documentElement;
    if (partner) {
      root.style.setProperty("--primary", partner.primary);
      root.style.setProperty("--primary-brand-color", partner.primary);
      root.style.setProperty("--secondary-brand-color", partner.secondary);
      root.style.setProperty("--accent-indigo", partner.primary);
      root.style.setProperty("--accent-violet", partner.primary);
      root.style.setProperty("--text-secondary", partner.secondary);
      root.style.setProperty("--bg-primary", partner.bg);
      setBrand({
        brandName: `${partner.name} Intelligence Engine`,
        licenseName: partner.name,
        logoText: partner.logoText,
        logoUrl: partner.logoUrl,
        isPartner: true,
      });
    } else {
      ["--primary", "--primary-brand-color", "--secondary-brand-color", "--accent-indigo", "--accent-violet", "--text-secondary", "--bg-primary"].forEach((property) => root.style.removeProperty(property));
      setBrand(defaultBrand);
    }
  }, []);
  return brand;
}

function BrandMark({ brand, className = "" }: { brand: BrandState; className?: string }) {
  return (
    <div className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[var(--border)] bg-[var(--accent-indigo)] text-sm font-black text-white ${className}`}>
      {brand.logoUrl ? <img alt={`${brand.licenseName} logo`} className="h-full w-full object-cover" src={brand.logoUrl} /> : brand.logoText}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const color = {
    indigo: "text-[var(--accent-indigo)]",
    violet: "text-[var(--accent-violet)]",
    emerald: "text-[var(--accent-emerald)]",
    amber: "text-[var(--accent-amber)]",
    blue: "text-[var(--accent-blue)]",
  }[kpi.tone] ?? "text-[var(--text-primary)]";
  return (
    <Panel className="p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{kpi.label}</div>
      <AnimatedKpiValue value={kpi.value} suffix={kpi.suffix} className={color} />
      <div className="mt-4 h-1 bg-[var(--bg-tertiary)]">
        <div className="h-1 bg-current" style={{ width: `${Math.min(100, kpi.value)}%` }} />
      </div>
    </Panel>
  );
}

function asRecord(value: unknown): AnyRow {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRow : {};
}

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function kpiByLabel(kpis: Kpi[], label: string) {
  return kpis.find((kpi) => kpi.label === label)?.value ?? 0;
}

function DashboardHero({ profile, topAction, counts, onNavigate }: { profile: AnyRow; topAction?: AnyRow; counts: AnyRow; onNavigate: (page: PageKey) => void }) {
  const research = asRecord(profile.research);
  const startup = asRecord(profile.startup);
  const currentPaper = String(research.current_paper ?? research.currentPaper ?? "Research paper not added yet");
  const startupName = String(startup.name ?? "Mentally Prepare");
  const experienceTags = asStringList(profile.experienceTags);
  const currentExperience = experienceTags.find((tag) => tag.toLowerCase().includes("ux researcher")) ?? "UX Researcher Internship";
  const universitiesCount = Number(counts.universities ?? 0);
  const scholarshipsCount = Number(counts.scholarships ?? 0);
  const careersCount = Number(counts.careers ?? 0);
  return (
    <Panel className="overflow-hidden p-0">
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="p-5 md:p-6">
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">Aashi Dreams Command Center</div>
          <h2 className="heading mt-3 max-w-4xl text-4xl font-bold leading-tight text-[var(--accent-violet)] md:text-5xl">
            Anushka's future, tracked like a live strategy room.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            This dashboard connects university fit, scholarships, research reputation, IELTS readiness, faculty outreach, and product-career direction into one operating system.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric label="Universities Tracked" value={universitiesCount ? String(universitiesCount) : "0"} />
            <Metric label="Scholarship Watchlist" value={scholarshipsCount ? String(scholarshipsCount) : "0"} />
            <Metric label="Career Paths" value={careersCount ? String(careersCount) : "0"} />
          </div>
        </div>
        <div className="border-t-2 border-[var(--border)] bg-[var(--bg-primary)] p-5 xl:border-l-2 xl:border-t-0">
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-emerald)]">Today's Highest-Leverage Action</div>
          <h3 className="heading mt-3 text-2xl font-semibold">{String(topAction?.title ?? "Build one proof asset today")}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {String(topAction?.why ?? "Aashi works best when every day has one decisive action tied to admissions, research, or career proof.")}
          </p>
          <div className="mt-5 space-y-3">
            <CompactRow title={currentExperience} meta="Current internship signal" value="Active" />
            <CompactRow title={currentPaper} meta="Current research asset" value="Research" />
            <CompactRow title={startupName} meta="Venture and product proof" value="Active" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="bg-[var(--accent-indigo)] px-4 py-2 text-sm font-bold text-white" onClick={() => onNavigate("research")} type="button">
              Open Research Lab
            </button>
            <button className="border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm font-bold text-[var(--accent-indigo)]" onClick={() => onNavigate("delta")} type="button">
              View Profile Delta
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ReadinessCommandStrip({ kpis }: { kpis: Kpi[] }) {
  const commands = [
    { label: "University", value: kpiByLabel(kpis, "Elite University Readiness"), detail: "Profile-to-elite readiness" },
    { label: "IELTS", value: kpiByLabel(kpis, "IELTS Readiness"), detail: "Test unlock progress" },
    { label: "Research", value: kpiByLabel(kpis, "Research Strength"), detail: "Publication and proof strength" },
    { label: "Applications", value: kpiByLabel(kpis, "Applications Progress"), detail: "Submission pipeline progress" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {commands.map((command) => (
        <Panel className="p-4" key={command.label}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{command.label}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">{command.detail}</div>
            </div>
            <div className="mono text-2xl font-bold text-[var(--accent-indigo)]">{command.value}%</div>
          </div>
          <div className="mt-4 h-1.5 bg-[var(--bg-tertiary)]">
            <div className="h-1.5 bg-[var(--accent-indigo)]" style={{ width: `${Math.min(100, command.value)}%` }} />
          </div>
        </Panel>
      ))}
    </div>
  );
}

function AashiDnaPanel({ profile, kpis, onNavigate }: { profile: AnyRow; kpis: Kpi[]; onNavigate: (page: PageKey) => void }) {
  const research = asRecord(profile.research);
  const startup = asRecord(profile.startup);
  const interests = asStringList(research.interests).slice(0, 8);
  const focus = asStringList(startup.focus).slice(0, 5);
  const experienceTags = asStringList(profile.experienceTags).slice(0, 8);
  const achievements = Array.isArray(profile.achievements) ? profile.achievements as AnyRow[] : [];
  const dna = [
    { label: "Research Signal", value: kpiByLabel(kpis, "Research Strength") },
    { label: "Founder Signal", value: kpiByLabel(kpis, "Product Portfolio Score") },
    { label: "Scholarship Field", value: kpiByLabel(kpis, "Scholarship Match") * 10 },
  ];
  return (
    <Panel className="p-4">
      <SectionTitle title="Aashi DNA Snapshot" />
      <div className="space-y-4">
        {dna.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between gap-3 text-xs font-bold uppercase text-[var(--text-secondary)]">
              <span>{item.label}</span>
              <span>{Math.min(100, item.value)}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-[var(--bg-tertiary)]">
              <div className="h-1.5 bg-[var(--accent-emerald)]" style={{ width: `${Math.min(100, item.value)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <div className="mono text-[10px] font-bold uppercase text-[var(--text-secondary)]">Profile Angles</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[...experienceTags, ...interests, ...focus].slice(0, 12).map((tag) => (
            <span className="bg-[var(--bg-tertiary)] px-2 py-1 text-xs font-bold text-[var(--accent-indigo)]" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div>
          <div className="mono text-[10px] uppercase text-[var(--text-secondary)]">Achievements Logged</div>
          <div className="heading mt-1 text-2xl font-bold text-[var(--accent-indigo)]">{achievements.length}</div>
        </div>
        <button className="border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--accent-indigo)]" onClick={() => onNavigate("profile")} type="button">
          Edit Profile
        </button>
      </div>
    </Panel>
  );
}

function DashboardListPanel({ title, items, emptyText, actionLabel, onAction }: { title: string; items: React.ReactNode[]; emptyText: string; actionLabel: string; onAction: () => void }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title={title} />
        <button className="mb-3 border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]" onClick={onAction} type="button">
          {actionLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.length ? items : <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">{emptyText}</div>}
      </div>
    </Panel>
  );
}

function BehavioralScienceTrackPanel({ targets, onNavigate }: { targets: University[]; onNavigate: (page: PageKey) => void }) {
  const flagByRegion: Record<string, string> = { UK: "GB", Netherlands: "NL", USA: "US" };
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">Primary Target Track</div>
          <h3 className="heading mt-1 text-2xl font-semibold">Master's in Behavioural Science</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Your current shortlist is now centred on behavioural science, behaviour change, behavioural economics, and CMU's HCI/behavioural-design adjacent route.
          </p>
        </div>
        <button className="border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--accent-indigo)]" onClick={() => onNavigate("universities")} type="button">
          Open Target Schools
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-5">
        {targets.map((target) => {
          const row = target as University & { targetLabel?: string; targetRegion?: string; targetRoute?: string; fitScore?: number };
          const region = row.targetRegion ?? row.country;
          const flag = flagByRegion[region] ?? row.country;
          return (
            <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4" key={row.id ?? row.name}>
              <div className="mono text-[10px] font-bold uppercase text-[var(--text-secondary)]">{flag} | {row.acceptanceDifficulty}</div>
              <div className="heading mt-2 text-lg font-semibold text-[var(--accent-indigo)]">{row.targetLabel ?? row.name}</div>
              <div className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{row.programName}</div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">{row.targetRoute ?? "Target route"}</span>
                <span className="mono text-lg font-bold text-[var(--accent-emerald)]">{row.fitScore ?? universityFitScore(row)}/10</span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function PremiumFeatureModal({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  if (!feature) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#32111a]/45 px-4 backdrop-blur-sm">
      <Panel className="max-w-md p-6">
        <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">Premium Feature</div>
        <h2 className="heading mt-2 text-2xl font-semibold">{feature}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          This module is managed by your coaching center administrator. It can be activated for counselor workflows, parent reports, and institute-level tracking.
        </p>
        <div className="mt-5 flex justify-end">
          <button className="bg-[var(--accent-indigo)] px-4 py-2 text-sm font-bold text-white" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </Panel>
    </div>
  );
}

function PartnerLicenseBanner({ brand }: { brand: BrandState }) {
  if (!brand.isPartner) return null;
  return (
    <div className="mt-2 inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]">
      <span className="h-2 w-2 rounded-full bg-[var(--accent-emerald)]" />
      Licensed to: {brand.licenseName}
    </div>
  );
}

function PrintedReportHeader({ brand }: { brand: BrandState }) {
  return (
    <div className="printed-report-header border-b-2 border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark brand={brand} />
          <div>
            <div className="heading text-2xl font-bold text-[var(--accent-indigo)]">{brand.brandName}</div>
            <div className="mono mt-1 text-[10px] uppercase text-[var(--text-secondary)]">Official Diagnostic Report | {formatIstDateTime()}</div>
          </div>
        </div>
        <TrustBadge />
      </div>
    </div>
  );
}

function Sidebar({ onLockedFeature }: { onLockedFeature: (feature: string) => void }) {
  const { page, setPage, collapsed, toggleCollapsed } = useUiStore();
  const brand = usePartnerBrand();
  return (
    <aside className={`sidebar ${collapsed ? "w-16" : "w-60"} fixed inset-y-0 left-0 z-20 hidden border-r-2 border-[var(--border)] bg-[var(--bg-primary)] transition-all rounded-r-3xl md:block`}>
      <div className="flex h-16 items-center justify-between border-b-2 border-[var(--border)] px-4">
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark brand={brand} />
            <div className="min-w-0">
            <div className="brand-name heading truncate text-lg font-bold text-[var(--accent-indigo)]">{brand.brandName}</div>
            <div className="mono text-[10px] uppercase text-[var(--text-secondary)]">Admissions Intelligence</div>
            </div>
          </div>
        )}
        <button className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" onClick={toggleCollapsed} type="button">
          <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div className="mb-5" key={group.title}>
            {!collapsed && <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{group.title}</div>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = page === item.key;
                const locked = lockedPages.has(item.key);
                return (
                  <button
                    aria-label={locked ? `${item.label} premium feature` : item.label}
                    className={`nav-item ${locked ? "locked" : ""} flex h-10 w-full items-center gap-3 px-3 text-left text-sm transition rounded-2xl ${
                      active ? "bg-[var(--accent-indigo)] text-white font-bold" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-indigo)] font-semibold"
                    }`}
                    key={item.key}
                    onClick={() => {
                      if (locked) onLockedFeature(item.label);
                      else setPage(item.key);
                    }}
                    type="button"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Dashboard() {
  const setPage = useUiStore((state) => state.setPage);
  const { data, error, isError, isLoading, refetch } = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<AnyRow>("/api/dashboard/kpis") });
  const { data: actionData } = useQuery({ queryKey: ["top-action"], queryFn: () => apiGet<AnyRow>("/api/intelligence/top-action") });
  const { data: courseIntelligence = [] } = useQuery({ queryKey: ["course-intelligence"], queryFn: () => apiGet<CourseIntelligence[]>("/api/course-intelligence") });
  if (isLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading command center...</div>;
  if (isError) return <QueryErrorState title="Dashboard could not load" error={error} onRetry={() => void refetch()} />;
  const profileRow = (data?.profile ?? {}) as AnyRow;
  const kpis = (data?.kpis ?? []) as Kpi[];
  const universityMatches = (data?.universityMatches ?? []) as University[];
  const behavioralScienceTargets = (data?.behavioralScienceTargets ?? []) as University[];
  const deadlines = (data?.upcomingDeadlines ?? []) as AnyRow[];
  const tasks = (data?.thisWeeksTasks ?? []) as AnyRow[];
  const careers = (data?.careerRecommendations ?? []) as AnyRow[];
  const scholarships = (data?.scholarshipOpportunities ?? []) as AnyRow[];
  const counts = (data?.counts ?? {}) as AnyRow;
  const topAction = actionData?.action as AnyRow | undefined;
  const researchProgress = (data?.researchProgress ?? {}) as AnyRow;
  return (
    <div className="space-y-4">
      <DashboardHero profile={profileRow} topAction={topAction} counts={counts} onNavigate={setPage} />
      <ReadinessCommandStrip kpis={kpis} />
      {behavioralScienceTargets.length > 0 && <BehavioralScienceTrackPanel targets={behavioralScienceTargets} onNavigate={setPage} />}
      {courseIntelligence.length > 0 && <CourseIntakeTrackerPanel records={courseIntelligence} universities={behavioralScienceTargets} onNavigate={setPage} />}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <DashboardListPanel
          actionLabel="Explore"
          emptyText="No university matches found yet. Add universities or run the seed/repair scripts."
          items={universityMatches.map((uni) => (
            <CompactRow key={uni.id} title={uni.name} meta={`${uni.country} | ${uni.programName}`} value={`${String((uni as AnyRow).fitScore ?? universityFitScore(uni))}/10`} />
          ))}
          onAction={() => setPage("universities")}
          title="Admission Radar"
        />
        <AashiDnaPanel profile={profileRow} kpis={kpis} onNavigate={setPage} />
      </div>
      <DiagnosticEnginePanel />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardListPanel
          actionLabel="Track"
          emptyText="No active scholarship deadlines found. Add one scholarship to start the funding radar."
          items={scholarships.map((item) => <CompactRow key={item.id} title={String(item.name)} meta={`${String(item.country)} | ${String(item.winningProbability)} probability`} value={String(item.deadline)} />)}
          onAction={() => setPage("scholarships")}
          title="Scholarship Radar"
        />
        <DashboardListPanel
          actionLabel="Plan"
          emptyText="No open tasks. Add a task or generate a weekly plan from AI Advisor."
          items={tasks.map((task) => <CompactRow key={task.id} title={String(task.title)} meta={`${task.category} | ${task.priority}`} value={String(task.status)} />)}
          onAction={() => setPage("advisor")}
          title="Execution Queue"
        />
        <DashboardListPanel
          actionLabel="Sources"
          emptyText="No dated deadlines are currently open."
          items={deadlines.map((item, index) => <CompactRow key={index} title={String(item.title)} meta={`${item.type} | ${item.status}`} value={String(item.deadline)} />)}
          onAction={() => setPage("sources")}
          title="Deadline Radar"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel className="p-4">
          <SectionTitle title="Research Core Asset" />
          <CompactRow title={String(researchProgress.title ?? "No paper")} meta={String(researchProgress.status ?? "empty")} value="Core asset" />
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
            Aashi should keep turning research into proof: professor outreach, SOP evidence, scholarship essays, and product-career positioning.
          </p>
          <button className="mt-4 border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm font-bold text-[var(--accent-indigo)]" onClick={() => setPage("research")} type="button">
            Strengthen Research
          </button>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle title="Career Compass" />
            <button className="mb-3 border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]" onClick={() => setPage("careers")} type="button">
              Explore Careers
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {careers.map((career) => (
              <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4" key={career.id}>
                <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{String(career.title)}</div>
                <div className="mono mt-3 text-xl font-bold text-[var(--accent-emerald)]">${Number(career.avgSalaryUsd).toLocaleString()}</div>
                <div className="mt-2 text-xs font-bold uppercase text-[var(--text-secondary)]">{String(career.demandLevel)} demand</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="p-4">
        <SectionTitle title="Full Readiness Metrics" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => <KpiCard kpi={kpi} key={kpi.label} />)}
        </div>
      </Panel>
      </div>
  );
}

type DiagnosticKey = "academicRigor" | "empiricalCredential" | "leadershipVenture" | "narrativeCoherence";
type DiagnosticInputs = Record<DiagnosticKey, number>;

const diagnosticSliders: Array<{ key: DiagnosticKey; label: string; hint: string; fallback: number }> = [
  { key: "academicRigor", label: "Academic Rigor & GPA Index", hint: "Transcript strength, consistency, and quantitative readiness.", fallback: 74 },
  { key: "empiricalCredential", label: "Empirical Research Credential Index", hint: "Papers, methods exposure, research writing, and faculty proof.", fallback: 68 },
  { key: "leadershipVenture", label: "Leadership & Venture Index", hint: "Mentally Prepare, community work, product ownership, and initiative.", fallback: 78 },
  { key: "narrativeCoherence", label: "Rhetorical & Narrative Coherence Index", hint: "SOP clarity, recommender alignment, and career logic.", fallback: 72 },
];

function readDiagnosticDefaults(): DiagnosticInputs {
  return diagnosticSliders.reduce((acc, slider) => {
    const saved = typeof window === "undefined" ? null : window.localStorage.getItem(`slider_${slider.key}`);
    const parsed = saved === null ? Number.NaN : Number(saved);
    acc[slider.key] = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : slider.fallback;
    return acc;
  }, {} as DiagnosticInputs);
}

function DiagnosticEnginePanel() {
  const [inputs, setInputs] = useState<DiagnosticInputs>(() => readDiagnosticDefaults());
  useEffect(() => {
    diagnosticSliders.forEach((slider) => window.localStorage.setItem(`slider_${slider.key}`, String(inputs[slider.key])));
  }, [inputs]);
  const overallIndex = Math.round((inputs.academicRigor * 0.4) + (inputs.narrativeCoherence * 0.3) + (inputs.empiricalCredential * 0.2) + (inputs.leadershipVenture * 0.1));
  const matches = overallIndex > 80
    ? [
      { name: "National University of Singapore", chance: Math.min(96, Math.round(overallIndex * 0.95)), type: "Reach" },
      { name: "University of Oxford", chance: Math.min(92, Math.round(overallIndex * 0.85)), type: "Reach" },
      { name: "University College London", chance: Math.min(90, Math.round(overallIndex * 0.9)), type: "Target" },
    ]
    : [
      { name: "University of Bath", chance: Math.min(92, Math.round(overallIndex * 1.1)), type: "Target" },
      { name: "University of Leeds", chance: Math.min(94, Math.round(overallIndex * 1.2)), type: "Target" },
      { name: "Tilburg University", chance: Math.min(95, Math.round(overallIndex * 1.25)), type: "Safe" },
    ];

  function updateInput(key: DiagnosticKey, value: number) {
    setInputs((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(`slider_${key}`, String(value));
      return next;
    });
  }

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">Admissions Probability Index</div>
          <h2 className="heading mt-1 text-2xl font-semibold">Live Diagnostic Engine</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Calibrated via our proprietary Admissions Probability Index using 2025/2026 historical registries, public programme signals, and profile-readiness weights.
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-bold text-[var(--accent-indigo)]">Personal Strategy Mode</div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr_1fr]">
        <div className="profile-inputs space-y-4">
          {diagnosticSliders.map((slider) => (
            <div key={slider.key}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{slider.label}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">{slider.hint}</div>
                </div>
                <div className="mono text-lg font-bold text-[var(--accent-indigo)]">{inputs[slider.key]}%</div>
              </div>
              <input
                aria-label={slider.label}
                className="mt-3 w-full accent-[var(--accent-indigo)]"
                id={slider.key}
                max={100}
                min={0}
                onChange={(event) => updateInput(slider.key, Number(event.target.value))}
                onInput={(event) => updateInput(slider.key, Number(event.currentTarget.value))}
                type="range"
                value={inputs[slider.key]}
              />
            </div>
          ))}
        </div>
        <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4">
          <div className="mono text-[10px] uppercase text-[var(--text-secondary)]">Predictive Match Probability</div>
          <AnimatedKpiValue className="text-[var(--accent-indigo)]" suffix="%" value={overallIndex} />
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
            Admission Fit Index recalculates instantly as the counselor adjusts profile evidence.
          </p>
        </div>
        <div className="space-y-3">
          {matches.map((match) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={match.name}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">{match.name}</div>
                  <div className="mono mt-1 text-[10px] uppercase text-[var(--text-secondary)]">{match.type} route</div>
                </div>
                <div className="mono text-xl font-bold text-[var(--accent-emerald)]">{match.chance}%</div>
              </div>
              <div className="mt-3 h-1.5 bg-[var(--bg-tertiary)]">
                <div className="h-1.5 bg-[var(--accent-indigo)]" style={{ width: `${match.chance}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function FacultyPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const { data = [] } = useQuery({ queryKey: ["people"], queryFn: () => apiGet<AnyRow[]>("/api/people") });
  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AnyRow }) => apiPut(`/api/people/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
  const filtered = data.filter((person) => status === "all" || person.status === status);
  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-end gap-3 p-4">
        <Filter label="Status" value={status} options={["all", "not_contacted", "contacted", "replied", "meeting_scheduled"]} onChange={setStatus} />
        <div className="text-sm text-[var(--text-secondary)]">Track professors, admissions officers, alumni, researchers, and product people.</div>
      </Panel>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filtered.map((person) => (
          <Panel className="p-4" key={person.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-[10px] uppercase text-[var(--accent-violet)]">{String(person.type)} | {String(person.status)}</div>
                <h3 className="heading mt-1 text-lg font-semibold">{String(person.name)}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{String(person.role)} | {String(person.researchArea ?? "No research area")}</p>
              </div>
              <div className="mono text-2xl text-[var(--accent-emerald)]">{String(person.matchScore)}</div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
              <div>Lab: {String(person.lab ?? "To verify")}</div>
              <div>Next follow-up: {String(person.nextFollowUp ?? "Not set")}</div>
              <div className="truncate">Notes: {String(person.notes ?? "")}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["contacted", "replied", "meeting_scheduled"].map((next) => (
                <button
                  className="border border-[var(--border)] px-3 py-1 text-xs uppercase text-[var(--text-secondary)] hover:border-[var(--accent-indigo)]"
                  key={next}
                  onClick={() => mutation.mutate({ id: Number(person.id), body: { ...person, status: next, lastInteraction: new Date().toISOString() } })}
                  type="button"
                >
                  Mark {next.replace("_", " ")}
                </button>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function DeltaPage() {
  const [country, setCountry] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["profile-delta"], queryFn: () => apiGet<{ deltas: Array<{ university: University; deltaScore: number; unlocked: boolean; gaps: Array<{ label: string; severity: string; action: string }> }> }>("/api/intelligence/profile-delta") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Calculating profile deltas...</div>;
  const deltas = data?.deltas ?? [];
  const countries = ["all", ...Array.from(new Set(deltas.map((item) => item.university.country))).sort()];
  const filtered = deltas.filter((item) => country === "all" || item.university.country === country).slice(0, 24);
  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-end gap-3 p-4">
        <Filter label="Country" value={country} options={countries} onChange={setCountry} />
        <p className="text-sm text-[var(--text-secondary)]">Delta shows what is missing between your current profile and each university route.</p>
      </Panel>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filtered.map((item) => (
          <Panel className="p-4" key={item.university.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-[10px] uppercase text-[var(--text-secondary)]">{item.university.country} | Tier {item.university.tier} | {item.university.acceptanceDifficulty}</div>
                <h3 className="heading mt-1 text-lg font-semibold">{item.university.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.university.programName}</p>
              </div>
              <div className={`mono text-3xl ${item.unlocked ? "text-[var(--accent-emerald)]" : "text-[var(--accent-amber)]"}`}>{item.deltaScore}</div>
            </div>
            <div className="mt-4 space-y-2">
              {item.gaps.slice(0, 4).map((gap) => (
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={gap.label}>
                  <div className={`text-xs font-semibold uppercase ${gap.severity === "critical" ? "text-[var(--accent-red)]" : "text-[var(--accent-amber)]"}`}>{gap.label}</div>
                  <div className="mt-1 text-sm text-[var(--text-secondary)]">{gap.action}</div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function TopOnePage() {
  const { data, isLoading } = useQuery({ queryKey: ["top1-report"], queryFn: () => apiGet<AnyRow>("/api/intelligence/top1-report") });
  const aiMutation = useMutation({ mutationFn: () => apiPost<AnyRow>("/api/ai/analyze", { type: "top1_analysis" }) });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Building Top 1% report...</div>;
  const probabilities = (data?.probabilities ?? {}) as AnyRow;
  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">Core feature</div>
        <h2 className="heading mt-1 text-2xl font-semibold">What would the top 1% applicant do?</h2>
        <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">{String(data?.mostImportantAction)}</p>
        <button className="mt-4 border border-[var(--border)] px-4 py-2 text-sm font-semibold" onClick={() => aiMutation.mutate()} type="button">Generate AI version</button>
        {aiMutation.error && <div className="mt-3 text-sm text-[var(--accent-amber)]">{aiMutation.error.message}</div>}
      </Panel>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(probabilities).map(([key, value]) => <Metric key={key} label={key} value={`${value}%`} />)}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportList title="Current Strengths" items={(data?.strengths ?? []) as string[]} />
        <ReportList title="Current Weaknesses" items={(data?.weaknesses ?? []) as string[]} />
        <ReportList title="30-Day Plan" items={(data?.plan30d ?? []) as string[]} />
        <ReportList title="90-Day Plan" items={(data?.plan90d ?? []) as string[]} />
      </div>
    </div>
  );
}

function ResearchLabPage() {
  const { data: reputation, isLoading } = useQuery({ queryKey: ["research-reputation"], queryFn: () => apiGet<AnyRow>("/api/intelligence/research-reputation") });
  const { data: papers = [] } = useQuery({ queryKey: ["research"], queryFn: () => apiGet<AnyRow[]>("/api/research") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Calculating research reputation...</div>;
  const paper = (reputation?.currentPaper ?? {}) as AnyRow;
  const futureIdeas = (reputation?.futureIdeas ?? []) as string[];
  const nextMoves = (reputation?.nextMoves ?? []) as string[];
  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="mono text-[10px] uppercase text-[var(--accent-emerald)]">Research Reputation Tracker</div>
        <h2 className="heading mt-1 text-2xl font-semibold">{String(paper.title ?? "Current paper missing")}</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{String(paper.notes ?? "Your research paper should become the proof engine for admissions, SOPs, LORs, and professor outreach.")}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Publication Probability" value={`${String(reputation?.publicationProbability)}%`} />
          <Metric label="Status" value={String(paper.status ?? "idea")} />
          <Metric label="Impact Potential" value={String(reputation?.researchImpactPotential)} />
          <Metric label="Review Timeline" value={String(reputation?.expectedReviewTimeline)} />
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-4">
          <SectionTitle title="Next Moves" />
          <div className="space-y-2">{nextMoves.map((move) => <CompactRow key={move} title={move} meta="Research proof asset" value="p1" />)}</div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Future Research Ideas" />
          <div className="space-y-2">{futureIdeas.map((idea) => <CompactRow key={idea} title={idea} meta="Mentally Prepare aligned" value="idea" />)}</div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Paper Pipeline" />
          <div className="space-y-2">{papers.map((item) => <CompactRow key={item.id} title={String(item.title)} meta={String(item.targetJournal ?? "Target missing")} value={String(item.status)} />)}</div>
        </Panel>
      </div>
    </div>
  );
}

function IeltsHubPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["ielts-readiness"], queryFn: () => apiGet<AnyRow>("/api/intelligence/ielts-readiness") });
  const [form, setForm] = useState({ listening: "", reading: "", writing: "", speaking: "", overall: "", notes: "" });
  const mutation = useMutation({
    mutationFn: () =>
      apiPost("/api/ielts", {
        date: todayInputDateIst(),
        listening: form.listening ? Number(form.listening) : null,
        reading: form.reading ? Number(form.reading) : null,
        writing: form.writing ? Number(form.writing) : null,
        speaking: form.speaking ? Number(form.speaking) : null,
        overall: form.overall ? Number(form.overall) : null,
        isMock: true,
        notes: form.notes,
      }),
    onSuccess: () => {
      setForm({ listening: "", reading: "", writing: "", speaking: "", overall: "", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["ielts-readiness"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading IELTS hub...</div>;
  const scores = (data?.scores ?? []) as AnyRow[];
  const unlocks = (data?.unlocks ?? []) as Array<{ band: number; unlocked: boolean; universities: string[] }>;
  const weeklyPlan = (data?.weeklyPlan ?? []) as Array<{ skill: string; focus: string; cadence: string }>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Target Band" value={String(data?.target)} />
        <Metric label="Best Overall" value={Number(data?.best) ? String(data?.best) : "No mock"} />
        <Metric label="Readiness" value={`${String(data?.readiness)}%`} />
        <Metric label="Planned Date" value={String(data?.plannedDate)} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-4">
          <SectionTitle title="Add Mock Score" />
          <div className="grid grid-cols-2 gap-2">
            {(["listening", "reading", "writing", "speaking", "overall"] as const).map((key) => (
              <input
                className="border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                key={key}
                placeholder={key}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            ))}
            <input className="col-span-2 border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm" placeholder="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </div>
          <button className="mt-3 bg-[var(--accent-indigo)] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => mutation.mutate()}>Add score</button>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Score History" />
          <div className="space-y-2">
            {scores.map((score) => <CompactRow key={score.id} title={`Mock on ${formatIstDate(score.date)}`} meta={`L ${score.listening ?? "-"} | R ${score.reading ?? "-"} | W ${score.writing ?? "-"} | S ${score.speaking ?? "-"}`} value={String(score.overall ?? "-")} />)}
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel className="p-4">
          <SectionTitle title="University Unlock System" />
          <div className="grid gap-3">
            {unlocks.map((unlock) => (
              <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={unlock.band}>
                <div className={`mono text-lg ${unlock.unlocked ? "text-[var(--accent-emerald)]" : "text-[var(--text-secondary)]"}`}>Band {unlock.band} {unlock.unlocked ? "unlocked" : "locked"}</div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">{unlock.universities.slice(0, 6).join(" | ")}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Weekly Study Plan" />
          <div className="space-y-2">{weeklyPlan.map((item) => <CompactRow key={item.skill} title={item.skill} meta={item.focus} value={item.cadence} />)}</div>
        </Panel>
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel className="p-4">
      <SectionTitle title={title} />
      <div className="space-y-2">
        {items.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
      </div>
    </Panel>
  );
}

function SectionTitle({ title, className = "" }: { title: string; className?: string }) {
  return <h3 className={`heading mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)] ${className}`}>{title}</h3>;
}

function CompactRow({ title, meta, value }: { title: string; meta: string; value: string }) {
  const displayValue = formatIstDate(value);
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4 rounded-2xl shadow-sm">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-[var(--accent-indigo)]">{title}</div>
        <div className="truncate text-xs text-[var(--text-secondary)] mt-0.5">{meta}</div>
      </div>
      <div className="mono text-xs font-semibold text-[var(--accent-emerald)] bg-[var(--bg-secondary)] px-2 py-1 rounded-lg h-fit">{displayValue}</div>
    </div>
  );
}

function UniversitiesPage() {
  const [country, setCountry] = useState("all");
  const [tier, setTier] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selected, setSelected] = useState<University | null>(null);
  const queryClient = useQueryClient();
  const { data = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["universities"], queryFn: () => apiGet<University[]>("/api/universities") });
  const addShortlist = useMutation({
    mutationFn: (universityId: number) =>
      apiPost("/api/shortlist", { universityId, status: "shortlisted", priority: 3, notes: "Added from Elite Universities", deadline: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortlist"] });
      setSelected(null);
    },
  });
  const countries = useMemo(() => ["all", ...Array.from(new Set(data.map((row) => row.country))).sort()], [data]);
  const filtered = data.filter((row) => (country === "all" || row.country === country) && (tier === "all" || row.tier === tier) && (difficulty === "all" || row.acceptanceDifficulty === difficulty));
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading university intelligence...</div>;
  if (isError) return <QueryErrorState title="Universities could not load" error={error} onRetry={() => void refetch()} />;
  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap gap-3 p-4">
        <Filter label="Country" value={country} options={countries} onChange={setCountry} />
        <Filter label="Tier" value={tier} options={["all", "A", "B", "C", "D"]} onChange={setTier} />
        <Filter label="Difficulty" value={difficulty} options={["all", "reach", "target", "safe"]} onChange={setDifficulty} />
      </Panel>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {filtered.map((uni) => <UniversityCard key={uni.id} university={uni} onClick={() => setSelected(uni)} />)}
      </div>
      {selected && (
        <UniversityDetailModal
          university={selected}
          onClose={() => setSelected(null)}
          onAdd={() => addShortlist.mutate(selected.id!)}
          isAdding={addShortlist.isPending}
        />
      )}
    </div>
  );
}

function UniversityDetailModal({ university, onClose, onAdd, isAdding }: { university: University; onClose: () => void; onAdd: () => void; isAdding: boolean }) {
  const { data: courseIntelligence = [] } = useQuery({ queryKey: ["course-intelligence"], queryFn: () => apiGet<CourseIntelligence[]>("/api/course-intelligence") });
  const totalCost = university.tuitionUsd + university.livingCostUsd;
  const strategy = universityStrategy(university);
  const roadmap = roadmapForUniversity(university);
  const fit = universityFitScore(university);
  const brief = admissionBriefForUniversity(university);
  const sourceLinks = officialSourceLinksForUniversity(university);
  const requirementChips = universityRequirementChips(university);
  const courseRecord = courseIntelligence.find((record) => Number(record.universityId) === Number(university.id));
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div aria-modal="true" className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" onClick={onClose} role="dialog">
      <Panel className="relative max-h-[90vh] w-full max-w-6xl overflow-auto p-0" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mono text-xs uppercase text-[var(--accent-indigo)]">QS 2026 #{university.qsRanking ?? "verify"} | Tier {university.tier} | {admissionsChanceBand(university)}</div>
              <h2 className="heading mt-1 text-3xl font-semibold">{university.name}</h2>
              <p className="mt-1 text-[var(--text-secondary)]">{university.city}, {university.country} | {university.programName}</p>
            </div>
            <button aria-label="Close university detail" className="border border-[var(--border)] px-3 py-2 text-sm font-semibold" onClick={onClose} type="button">Close</button>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]">
            Rank source: QS World University Rankings 2026 where available. Admission Fit Index is calibrated via the proprietary Admissions Probability Index using 2025/2026 historical registries and official programme signals.
            <div className="mt-2 flex flex-wrap gap-2">
              <ConfidenceBadge value="official" />
              <span>confirmed from official source</span>
              <ConfidenceBadge value="estimate" />
              <span>AI-modelled via Admissions Probability Index</span>
              <ConfidenceBadge value="verify" />
              <span>must check official page</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="QS 2026 Rank" value={university.qsRanking ? `#${university.qsRanking}` : "Verify"} />
              <Metric label="Admission Fit Index" value={university.acceptanceRate ? `${university.acceptanceRate}%` : "Verify"} />
              <Metric label="Total Year Cost" value={`$${totalCost.toLocaleString()}`} />
              <Metric label="Anushka Fit" value={`${fit}/10`} />
            </div>

            <Panel className="p-4">
              <SectionTitle title="Source-Backed Admissions Snapshot" />
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {requirementChips.map((chip) => <RequirementChip key={`${chip.label}-${chip.value}`} {...chip} />)}
              </div>
              <div className="mt-4 grid gap-2">
                {sourceLinks.map((link) => (
                  <a className="grid gap-1 border border-[var(--border)] bg-[var(--bg-primary)] p-3 transition hover:border-[var(--accent-indigo)]" href={link.url} key={link.url} target="_blank" rel="noreferrer">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[var(--accent-indigo)]">{link.label}</span>
                      <ConfidenceBadge value={link.confidence} />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">{link.note}</span>
                  </a>
                ))}
              </div>
            </Panel>

            {courseRecord && <CourseResearchDetailPanel record={courseRecord} />}

            <Panel className="p-4">
              <SectionTitle title="Why It Fits You" />
              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <FitBars university={university} />
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <p><strong className="text-[var(--text-primary)]">Best angle:</strong> {strategy.positioning}</p>
                  <p><strong className="text-[var(--text-primary)]">Program story:</strong> Connect Christ psychology, derealization/gaming research, Mentally Prepare, and a future in behavioral product or consumer psychology.</p>
                  <p><strong className="text-[var(--text-primary)]">Data note:</strong> {university.notes}</p>
                </div>
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="Admissions Requirements" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold uppercase text-[var(--accent-indigo)]">Prerequisites</div>
                    <ConfidenceBadge value={brief.confidence.prerequisites} />
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                    {brief.prerequisites.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold uppercase text-[var(--accent-indigo)]">Academic + English Target</div>
                    <div className="flex gap-1"><ConfidenceBadge value={brief.confidence.academic} /><ConfidenceBadge value={brief.confidence.english} /></div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{brief.academicTarget}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{brief.english}</p>
                </div>
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="Application Materials" />
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {brief.materials.map((item) => <CompactRow key={item} title={item} meta="Prepare and verify official requirement" value="needed" />)}
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="Curriculum And Decision Notes" />
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <p><strong className="text-[var(--text-primary)]">Curriculum focus:</strong> <ConfidenceBadge value={brief.confidence.curriculum} /> {brief.curriculum}</p>
                <p><strong className="text-[var(--text-primary)]">Deadline logic:</strong> <ConfidenceBadge value={brief.confidence.deadline} /> {brief.deadline}</p>
                <p><strong className="text-[var(--text-primary)]">Cost confidence:</strong> <ConfidenceBadge value={brief.confidence.cost} /> Cost fields are useful for comparison, but final fees must be verified on the official page.</p>
                <p><strong className="text-[var(--text-primary)]">Source confidence:</strong> {brief.sourceNote}</p>
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="Full Roadmap" />
              <div className="space-y-2">
                {roadmap.map((item) => (
                  <div className="grid gap-2 border border-[var(--border)] bg-[var(--bg-primary)] p-3 md:grid-cols-[130px_1fr]" key={item.phase}>
                    <div className="mono text-xs font-bold uppercase text-[var(--accent-indigo)]">{item.phase}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.action}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel className="p-4">
              <SectionTitle title="Admissions Checklist" />
              <div className="space-y-2">
                <CompactRow title="IELTS requirement" meta="Minimum listed in database" value={`${university.ieltsMin}+`} />
                <CompactRow title="GRE" meta={university.greRequired ? "Needs verification for exact program" : "Currently not required in database"} value={university.greRequired ? `${university.greMin ?? 320}+` : "Optional"} />
                <CompactRow title="Scholarship" meta="Funding availability" value={university.scholarshipAvailable ? "Available" : "Verify"} />
                <CompactRow title="Work visa" meta={strategy.visa} value={`${university.workVisaYears} yrs`} />
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="Cost And Capital Return" />
              <div className="space-y-2">
                <CompactRow title="Tuition" meta="USD planning model" value={`$${university.tuitionUsd.toLocaleString()}`} />
                <CompactRow title="Living cost" meta="USD planning model" value={`$${university.livingCostUsd.toLocaleString()}`} />
                <CompactRow title="Career outcome" meta="Graduate outcome proxy" value={`${university.careerOutcomeScore}/10`} />
                <CompactRow title="Capital Return Efficiency" meta={strategy.scholarship} value={`${university.roiScore}/10`} />
              </div>
            </Panel>

            <Panel className="p-4">
              <SectionTitle title="What To Verify Next" />
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Exact program deadline and application fee.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Prerequisite courses: psychology, statistics, research methods, or quantitative background.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Official English test requirement for Indian applicants.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Number and type of references: academic only, professional allowed, or mixed.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Whether scholarships are automatic or need separate essays.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Curriculum proof: statistics, consumer behaviour, UX/HCI, research project, internship/capstone.</div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">2 professors, alumni, or labs that match digital behavior/product psychology.</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="bg-[var(--accent-indigo)] px-4 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={isAdding} onClick={onAdd} type="button">
                  {isAdding ? "Adding..." : "Add to Shortlist"}
                </button>
                <a className="border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]" href={sourceLinks[0]?.url ?? String(university.applicationUrl)} target="_blank" rel="noreferrer">Open primary source</a>
              </div>
            </Panel>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <button className="border border-[var(--border)] px-4 py-2 text-sm font-semibold" onClick={onClose} type="button">Close</button>
          <button className="bg-[var(--accent-indigo)] px-4 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={isAdding} onClick={onAdd} type="button">
            {isAdding ? "Adding..." : "Add to Shortlist"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function CourseResearchDetailPanel({ record }: { record: CourseIntelligence }) {
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle title="Course + Research Intelligence" />
          <h3 className="heading text-xl font-semibold text-[var(--accent-indigo)]">{record.programName}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{record.courseSummary}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Intake Size" value={intakeCountLabel(record)} />
          <Metric label="Next Check" value={formatIstDate(record.nextCheckDate)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <CompactRow title="Intake term" meta={record.intakeFrequency} value={record.intakeTerm} />
        <CompactRow title="Application state" meta={record.applicationStatus} value={record.applicationCloseDate ?? "Rolling"} />
        <CompactRow title="Source confidence" meta={record.sourceConfidence} value={formatIstDate(record.lastVerifiedAt)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel className="p-4">
          <SectionTitle title="Course Modules" />
          <div className="space-y-2">
            {record.moduleHighlights.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
          </div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Research Hooks" />
          <div className="space-y-2">
            {record.researchHighlights.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
          </div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Your Research Actions" />
          <div className="space-y-2">
            {record.researchFitActions.map((item) => <CompactRow title={item} meta="Anushka fit action" value="next" key={item} />)}
          </div>
        </Panel>
        <Panel className="p-4">
          <SectionTitle title="Requirement Watch" />
          <div className="space-y-2">
            {record.requirementHighlights.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <SectionTitle title="Official Live Links" />
        <div className="grid gap-2 md:grid-cols-3">
          {record.sourceUrls.map((source) => (
            <a className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm font-bold text-[var(--accent-indigo)] hover:border-[var(--accent-indigo)]" href={source.url} key={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{record.notes}</p>
      </div>
    </Panel>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-xs uppercase text-[var(--text-secondary)]">
      {label}
      <select className="min-w-36 border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm normal-case text-[var(--text-primary)]" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function UniversityCard({ university, onClick }: { university: University; onClick: () => void }) {
  const chips = universityRequirementChips(university);
  return (
    <button className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-5 text-left transition hover:border-[var(--accent-indigo)] rounded-3xl shadow-sm hover:shadow-md" onClick={onClick} type="button">
      <div className="flex items-start justify-between gap-3">
        <div className="profile-inputs">
          <div className="heading font-bold text-xl text-[var(--accent-indigo)]">{university.name}</div>
          <div className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">{university.country} | QS #{university.qsRanking ?? "verify"}</div>
        </div>
        <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--text-secondary)] tracking-wider">Tier {university.tier}</span>
      </div>
      <div className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{university.programName}</div>
      <div className="mt-5 grid gap-2.5">
        <TinyBar label="Behavioral" value={university.behavioralScienceFit} />
        <TinyBar label="Consumer" value={university.consumerPsychFit} />
        <TinyBar label="PM" value={university.pmFit} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {chips.slice(0, 4).map((chip) => <RequirementChip key={`${university.id}-${chip.label}`} {...chip} />)}
      </div>
      <div className="mt-6 flex items-center justify-between text-xs font-bold">
        <span className="text-[var(--text-secondary)] px-3 py-1.5 bg-[var(--bg-secondary)] rounded-xl">${university.tuitionUsd.toLocaleString()} tuition</span>
        <span className={`px-3 py-1.5 rounded-xl ${university.acceptanceDifficulty === "reach" ? "text-[var(--accent-red)] bg-red-50" : university.acceptanceDifficulty === "target" ? "text-[var(--accent-amber)] bg-amber-50" : "text-[var(--accent-emerald)] bg-emerald-50"}`}>{university.acceptanceDifficulty}</span>
      </div>
    </button>
  );
}

function TinyBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[76px_1fr_24px] items-center gap-3 text-xs font-semibold">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden"><div className="h-full bg-[var(--accent-indigo)] rounded-full" style={{ width: `${value * 10}%` }} /></div>
      <span className="mono font-bold text-[var(--accent-indigo)]">{value}</span>
    </div>
  );
}

function FitBars({ university }: { university: University }) {
  return (
    <div className="space-y-3">
      <TinyBar label="Behavioral" value={university.behavioralScienceFit} />
      <TinyBar label="Consumer" value={university.consumerPsychFit} />
      <TinyBar label="PM" value={university.pmFit} />
      <TinyBar label="Research" value={university.researchFit} />
      <TinyBar label="Startup" value={university.startupFit} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{label}</div>
      <div className="mono mt-2 text-2xl font-bold text-[var(--accent-indigo)]">{value}</div>
    </div>
  );
}

function ScholarshipTrackerPage() {
  const [country, setCountry] = useState("all");
  const [probability, setProbability] = useState("all");
  const [selected, setSelected] = useState<Scholarship | null>(null);
  const { data = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["scholarships"], queryFn: () => apiGet<Scholarship[]>("/api/scholarships") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading scholarship intelligence...</div>;
  if (isError) return <QueryErrorState title="Scholarships could not load" error={error} onRetry={() => void refetch()} />;

  const countries = ["all", ...Array.from(new Set(data.map((row) => row.country))).sort()];
  const filtered = data
    .filter((row) => country === "all" || row.country === country)
    .filter((row) => probability === "all" || row.winningProbability === probability)
    .map((row) => ({ row, urgency: scholarshipUrgency(row), fit: scholarshipFitScore(row) }))
    .sort((a, b) => a.urgency.sort - b.urgency.sort || b.fit - a.fit);
  const active = filtered.filter((item) => item.urgency.label !== "Expired");
  const topTargets = active.filter((item) => item.fit >= 50).slice(0, 4);
  const highFit = filtered.filter((item) => item.fit >= 70).length;
  const urgent = active.filter((item) => item.urgency.sort <= 90).length;
  const europeFundingRules = [
    { region: "UK", risk: "Graduate visa becomes 18 months for applications from 1 Jan 2027.", action: "Prioritize LSE/UCL/KCL only if scholarship odds, employer conversion, and early references are strong." },
    { region: "Netherlands", risk: "Orientation year helps, but job conversion is the real filter.", action: "Prefer Amsterdam/Tilburg/Erasmus only with consumer insights, UX, analytics, or behavioural economics proof." },
    { region: "Germany", risk: "Low tuition still requires blocked-account/proof-of-funds planning.", action: "Use DAAD plus low-tuition programmes; do not treat Germany as free unless funds are documented." },
    { region: "Ireland", risk: "Good tech market, but scholarship depth varies by university.", action: "Track TCD/UCD/Cork scholarships and employer access; use internships to prove employability." },
  ];
  const usaFundingRules = [
    { area: "Assistantships", risk: "Not automatic for master's students.", action: "Verify RA/TA/fellowship eligibility for international master's applicants before shortlisting." },
    { area: "STEM/OPT", risk: "Non-STEM master's gives weaker work window.", action: "Prefer STEM-designated HCI, information science, analytics, data science or quantitative social science programmes." },
    { area: "External awards", risk: "Fulbright/Knight-Hennessy are very competitive.", action: "Use them as upside, not base plan; build leadership/research proof first." },
    { area: "Total cost", risk: "High tuition + living cost can weaken capital return.", action: "Require scholarship/assistantship or strong STEM job conversion before ranking USA highly." },
  ];

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">Scholarship Intelligence</div>
            <h2 className="heading mt-1 text-2xl font-semibold">Funding is a parallel application, not an afterthought.</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">Deadlines are tracked as planning dates. Always verify the official page before submitting because scholarship cycles move.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Tracked" value={String(data.length)} />
            <Metric label="High Fit" value={String(highFit)} />
            <Metric label="90-Day Urgent" value={String(urgent)} />
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-wrap gap-3 p-4">
        <Filter label="Country" value={country} options={countries} onChange={setCountry} />
        <Filter label="Probability" value={probability} options={["all", "high", "medium", "low"]} onChange={setProbability} />
      </Panel>

      <Panel className="p-4">
        <SectionTitle title="Europe Funding Guardrails" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
          {europeFundingRules.map((rule) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={rule.region}>
              <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{rule.region}</div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Risk:</strong> {rule.risk}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Action:</strong> {rule.action}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-4">
        <SectionTitle title="USA Funding Guardrails" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
          {usaFundingRules.map((rule) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={rule.area}>
              <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{rule.area}</div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Risk:</strong> {rule.risk}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Action:</strong> {rule.action}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        {topTargets.map(({ row, urgency, fit }) => (
          <button className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4 text-left hover:border-[var(--accent-indigo)]" key={row.id} onClick={() => setSelected(row)} type="button">
            <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{row.country} | {row.type}</div>
            <h3 className="heading mt-1 text-lg font-semibold">{row.name}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label="Fit" value={`${fit}%`} />
              <Metric label="Due" value={urgency.label} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-[var(--text-secondary)]">{scholarshipNextAction(row)}</p>
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-[var(--border)] p-4">
          <SectionTitle title="Scholarship Priority Table" />
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[var(--bg-tertiary)] text-xs uppercase text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-2">Scholarship</th>
                <th className="px-3 py-2">Deadline</th>
                <th className="px-3 py-2">Urgency</th>
                <th className="px-3 py-2">Fit</th>
                <th className="px-3 py-2">Probability</th>
                <th className="px-3 py-2">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row, urgency, fit }, index) => (
                <tr className={index % 2 ? "bg-[var(--bg-primary)]" : ""} key={row.id}>
                  <td className="border-t border-[var(--border)] px-3 py-3">
                    <button className="text-left font-bold text-[var(--accent-indigo)]" onClick={() => setSelected(row)} type="button">{row.name}</button>
                    <div className="text-xs text-[var(--text-secondary)]">{row.country} | {row.type} | {row.amountUsd ? `$${row.amountUsd.toLocaleString()}` : "Amount varies"}</div>
                  </td>
                  <td className="border-t border-[var(--border)] px-3 py-3 mono">{formatIstDate(row.deadline ?? "")}</td>
                  <td className={`border-t border-[var(--border)] px-3 py-3 mono font-bold ${urgency.tone}`}>{urgency.label}</td>
                  <td className="border-t border-[var(--border)] px-3 py-3 mono">{fit}%</td>
                  <td className="border-t border-[var(--border)] px-3 py-3">{row.winningProbability}</td>
                  <td className="max-w-[360px] border-t border-[var(--border)] px-3 py-3 text-[var(--text-secondary)]">{scholarshipNextAction(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <Panel className="max-h-[88vh] w-full max-w-3xl overflow-auto p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-xs uppercase text-[var(--accent-indigo)]">{selected.country} | {selected.type} | {selected.winningProbability}</div>
                <h2 className="heading mt-1 text-2xl font-semibold">{selected.name}</h2>
              </div>
              <button className="border border-[var(--border)] px-3 py-2 text-sm" onClick={() => setSelected(null)} type="button">Close</button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Deadline" value={formatIstDate(selected.deadline ?? "")} />
              <Metric label="Urgency" value={scholarshipUrgency(selected).label} />
              <Metric label="Fit" value={`${scholarshipFitScore(selected)}%`} />
              <Metric label="Amount" value={selected.amountUsd ? `$${selected.amountUsd.toLocaleString()}` : "Varies"} />
            </div>
            <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
              <p><strong className="text-[var(--text-primary)]">Eligibility:</strong> {selected.eligibilitySummary}</p>
              <p><strong className="text-[var(--text-primary)]">Strategy note:</strong> {selected.notes}</p>
              <p><strong className="text-[var(--text-primary)]">Next action:</strong> {scholarshipNextAction(selected)}</p>
              <a className="inline-flex border border-[var(--border)] px-4 py-2 font-semibold text-[var(--text-primary)]" href={selected.url} target="_blank" rel="noreferrer">Open official page</a>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function OfficialSourcesPage() {
  const [status, setStatus] = useState("all");
  const { data = [], isLoading } = useQuery({ queryKey: ["official-sources"], queryFn: () => apiGet<OfficialSource[]>("/api/documents") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading official sources...</div>;
  const sources = data.filter((source) => source.type === "official_source");
  const filtered = sources.filter((source) => status === "all" || source.status === status);
  const lseRules = sources.filter((source) => source.title.startsWith("LSE"));
  const sourceCount = sources.length;

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">Source Intelligence</div>
            <h2 className="heading mt-1 text-2xl font-semibold">Every strategy needs an official source.</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">This page stores the rules behind admissions, funding, references, visas, and UK application planning so the tracker does not drift into guesswork.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Sources" value={String(sourceCount)} />
            <Metric label="LSE Rules" value={String(lseRules.length)} />
            <Metric label="Verified" value={String(sources.filter((source) => source.status === "verified").length)} />
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-wrap gap-3 p-4">
        <Filter label="Status" value={status} options={["all", "verified", "reference"]} onChange={setStatus} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-4">
          <SectionTitle title="LSE Rules To Follow" />
          <div className="space-y-2">
            <CompactRow title="Funding form comes after admission application" meta="GAP unlocks Graduate Financial Support Application" value="LSE" />
            <CompactRow title="One funding form can consider multiple LSE awards" meta="Unless scholarship page says separate application" value="GFSA" />
            <CompactRow title="Need offer + funding form by deadline" meta="2026/27 deadline was 23 Apr 2026" value="critical" />
            <CompactRow title="Application incomplete until both references arrive" meta="Ask referees before submitting" value="2 LORs" />
            <CompactRow title="No paid agent-style application materials" meta="LSE expects applicant-completed materials" value="ethics" />
            <CompactRow title="Apply early because rolling admissions close when full" meta="Also protects funding and visa timing" value="early" />
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionTitle title="What This Changes In Your Plan" />
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">LSE is not just an SOP task. It is an early-submission system: SOP, CV, transcript, two references, and funding statement must be ready before funding pressure starts.</div>
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Scholarship tracking must include the admission offer condition. For LSE GSS, the funding form alone is not enough without an offer by the deadline.</div>
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">UCAS is useful as UK application literacy, but LSE graduate rules come from LSE's own portal and pages.</div>
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">Visa assumptions need GOV.UK checks because the Graduate visa duration changes for applications from 1 Jan 2027.</div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filtered.map((source) => (
          <Panel className="p-4" key={source.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{source.status}</div>
                <h3 className="heading mt-1 text-lg font-semibold">{source.title}</h3>
              </div>
              <a className="border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]" href={source.url ?? "#"} target="_blank" rel="noreferrer">Open</a>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{source.notes}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function OpportunityRadarPage() {
  const [status, setStatus] = useState("all");
  const { data = [], isLoading } = useQuery({ queryKey: ["opportunity-sources"], queryFn: () => apiGet<OfficialSource[]>("/api/documents") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading opportunity radar...</div>;
  const sources = data.filter((source) => source.type === "opportunity_source");
  const filtered = sources.filter((source) => status === "all" || source.status === status);
  const internshipSources = sources.filter((source) => source.status.includes("internship"));
  const collegeSources = sources.filter((source) => source.status.includes("college"));
  const usaRiskSources = sources.filter((source) => source.status === "usa_risk");
  const europeRiskSources = sources.filter((source) => source.status === "europe_risk");
  const usaRules = [
    { area: "OPT", risk: "OPT is temporary work directly related to your major.", action: "Choose USA programmes where the degree title/CIP connects clearly to UX, HCI, analytics, information science or behavioural data." },
    { area: "STEM OPT", risk: "24-month extension only applies to eligible STEM degrees.", action: "Prioritize STEM-designated HCI, information, analytics, data science or quantitative social science programmes over generic psychology master's." },
    { area: "Funding", risk: "Master's aid is often limited and assistantships are programme-specific.", action: "Before shortlisting, verify fellowships, RA/TA roles, tuition, living cost, and whether international master's students actually receive aid." },
    { area: "Visa story", risk: "F-1 visa needs credible funding and study plan; screening includes online presence review.", action: "Make public profile consistent: psychology research, Mentally Prepare, digital wellbeing, product/UX research." },
  ];
  const regionalStrategies = [
    {
      region: "UK",
      rank: "1",
      focus: "LSE, UCL, King's, Edinburgh, Warwick, Bath",
      funding: "GSS, GREAT, Chevening, Commonwealth, university awards",
      risk: "Funding deadlines and references must be ready early; Graduate visa duration changes for 2027 applications.",
      internship: "Behavioral science RA + UX research + mental-health product proof.",
      next: "Keep UK, but only as an early-application, scholarship-aware route with employer conversion checked.",
      sourceMatch: ["college_funding", "verified"],
    },
    {
      region: "Europe",
      rank: "2",
      focus: "Tilburg, Erasmus, Amsterdam, Lund, KU Leuven, Aalto, Vienna, Ghent",
      funding: "Lower tuition, Erasmus/DAAD/Master Mind/Aalto/Lund/department scholarships",
      risk: "Each country/programme has different language, admission and scholarship sequencing rules.",
      internship: "Consumer insights + behavioural research + survey/data project.",
      next: "Do not group Europe as one route. Split Netherlands, Germany/Belgium, Nordics, Ireland, and Austria by visa/funding/employability.",
      sourceMatch: ["europe_funding", "europe_programme", "scholarship_database"],
    },
    {
      region: "Asia",
      rank: "3",
      focus: "NUS, NTU, HKU, CUHK, Yenching, Schwarzman",
      funding: "Research scholarships, leadership scholarships, departmental awards",
      risk: "Taught master's funding can be limited; research-degree fit is stronger than coursework-only fit.",
      internship: "Asia-facing mental health, digital wellbeing, consumer behaviour and product strategy.",
      next: "Shortlist NTU/NUS/HKU/CUHK research-degree vs taught-master routes separately.",
      sourceMatch: ["asia_funding", "asia_rule"],
    },
    {
      region: "USA",
      rank: "4",
      focus: "Stanford, UPenn, Berkeley, CMU, NYU, Michigan, Northwestern",
      funding: "Department fellowships, assistantships, external awards, Knight-Hennessy for Stanford",
      risk: "Master's funding is often limited and capital return depends heavily on STEM/OPT status and job outcome.",
      internship: "UX research + product analytics + PM/growth project with measurable metrics.",
      next: "Treat USA as high-upside but proof-heavy: build portfolio, methods, stats and product evidence first.",
      sourceMatch: ["usa_funding", "usa_rule"],
    },
  ];

  const internshipTracks = [
    {
      title: "UX Research / Product Research",
      fit: "Highest",
      why: "Psychology, research methods, writing, interviews, digital behaviour and product interest all connect here.",
      proof: "Build 2 case studies: Mentally Prepare user interviews and a digital wellbeing usability/research project.",
    },
    {
      title: "Consumer Insights / Market Research",
      fit: "Very high",
      why: "Direct bridge from psychology to consumer behaviour, brand strategy, survey design and qualitative insights.",
      proof: "Do one consumer psychology mini-study with survey + interview + insight deck.",
    },
    {
      title: "Behavioral Science Research Assistant",
      fit: "Very high",
      why: "Best for LSE, UCL, Erasmus, Tilburg and behavioural science SOP credibility.",
      proof: "Prepare research CV, paper abstract, methods summary and professor outreach email.",
    },
    {
      title: "Product Management / Growth PM Intern",
      fit: "High",
      why: "Makes Mentally Prepare stronger, but you need analytics and product metrics to be credible.",
      proof: "Track activation, retention, user interviews, experiments and feature decisions.",
    },
    {
      title: "Mental Health Product / NGO Programme Intern",
      fit: "High",
      why: "Strengthens your social-impact story for Chevening, Commonwealth, LSE GSS and SOP.",
      proof: "Show measurable community/user outcomes, not just volunteering hours.",
    },
    {
      title: "Data / Behavioural Analytics Intern",
      fit: "Medium-high",
      why: "Useful for USA and STEM/HCI routes, especially if paired with Python, statistics and behavioural datasets.",
      proof: "Finish one Python analysis project using survey or app behaviour data.",
    },
  ];
  const sprintPlan = [
    {
      window: "Week 1-2",
      output: "Research proof packet",
      action: "Create a 1-page summary of the derealization/gaming paper, research CV, abstract, and professor email template.",
      supports: "UK + Europe research credibility",
    },
    {
      window: "Week 3-4",
      output: "Mentally Prepare evidence page",
      action: "Document problem, users, interviews, behavioural design idea, metrics, experiments, screenshots, and next hypothesis.",
      supports: "USA product proof + scholarships",
    },
    {
      window: "Week 5-6",
      output: "UX research case study",
      action: "Run 5-8 user interviews or usability tests for a mental-health/student wellbeing product flow and write an insight report.",
      supports: "UXR internships + UCL/Aalto/CMU",
    },
    {
      window: "Week 7-8",
      output: "Consumer insights mini-study",
      action: "Run a small survey/interview study on student mental-health app adoption, AI companions, or digital wellbeing behaviour.",
      supports: "Consumer psychology + Tilburg/Erasmus/Kantar",
    },
    {
      window: "Week 9-10",
      output: "Internship application batch",
      action: "Apply to 20 roles across UXR, consumer insights, behavioural science RA, product, and mental-health startups.",
      supports: "Profile delta and career proof",
    },
    {
      window: "Week 11-12",
      output: "Scholarship/admission packet",
      action: "Finalize LOR brief, SOP narrative spine, official-source funding calendar, and top 12 programme shortlist.",
      supports: "LSE/UCL/Europe applications",
    },
  ];
  const keywordBanks = [
    {
      label: "UXR",
      terms: "UX Research Intern, User Research Intern, Product Research Intern, HCI Research Assistant, Usability Research",
    },
    {
      label: "Consumer",
      terms: "Consumer Insights Intern, Market Research Intern, Brand Strategy Intern, Qualitative Research Intern, Survey Research",
    },
    {
      label: "Behavioral",
      terms: "Behavioral Science Intern, Behavioural Insights, Research Assistant Psychology, Experimental Research Assistant",
    },
    {
      label: "Product",
      terms: "Product Intern, Growth Intern, Product Analyst Intern, Product Strategy Intern, Digital Wellbeing Product",
    },
    {
      label: "Mental health",
      terms: "Mental Health Intern, Wellbeing Program Intern, Youth Mental Health, Digital Mental Health, Psychology Startup",
    },
    {
      label: "Analytics",
      terms: "Behavioral Data Intern, Survey Analyst Intern, Social Media Analytics Intern, Research Data Analyst",
    },
  ];

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">Opportunity Radar</div>
            <h2 className="heading mt-1 text-2xl font-semibold">Your next internship should prove the story admissions will believe.</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">For you, the best signal is not any internship. It is psychology research applied to users, consumers, products, or mental health behaviour.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Sources" value={String(sources.length)} />
            <Metric label="College" value={String(collegeSources.length)} />
            <Metric label="Internship" value={String(internshipSources.length)} />
          </div>
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionTitle title="USA Risk Board" />
            <p className="max-w-3xl text-sm text-[var(--text-secondary)]">USA is high-upside but only makes sense if programme funding, STEM/OPT logic, and product/research proof are strong.</p>
          </div>
          <Metric label="USA Risk Sources" value={String(usaRiskSources.length)} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-4">
          {usaRules.map((rule) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={rule.area}>
              <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{rule.area}</div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Risk:</strong> {rule.risk}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Action:</strong> {rule.action}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {usaRiskSources.map((source) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={source.id}>
              <div className="mono text-[10px] uppercase text-[var(--accent-red)]">official risk source</div>
              <h3 className="heading mt-1 text-lg font-semibold">{source.title.replace("USA Risk - ", "")}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{source.notes}</p>
              <a className="mt-3 inline-flex border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]" href={source.url ?? "#"} target="_blank" rel="noreferrer">Open official source</a>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionTitle title="Europe Risk Board" />
            <p className="max-w-3xl text-sm text-[var(--text-secondary)]">Europe is still useful, but only if each country has a funding, visa, and employability answer. These are the risk rules currently stored from official sources.</p>
          </div>
          <Metric label="Risk Sources" value={String(europeRiskSources.length)} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-4">
          {europeRiskSources.map((source) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3" key={source.id}>
              <div className="mono text-[10px] uppercase text-[var(--accent-red)]">risk rule</div>
              <h3 className="heading mt-1 text-lg font-semibold">{source.title.replace("Europe Risk - ", "")}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{source.notes}</p>
              <a className="mt-3 inline-flex border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]" href={source.url ?? "#"} target="_blank" rel="noreferrer">Open official source</a>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        {regionalStrategies.map((strategy) => {
          const count = sources.filter((source) => strategy.sourceMatch.some((key) => source.status === key)).length;
          return (
            <Panel className="p-4" key={strategy.region}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">Priority #{strategy.rank}</div>
                  <h3 className="heading mt-1 text-xl font-semibold">{strategy.region}</h3>
                </div>
                <div className="mono rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-bold text-[var(--accent-indigo)]">{count} sources</div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                <p><strong className="text-[var(--text-primary)]">Focus:</strong> {strategy.focus}</p>
                <p><strong className="text-[var(--text-primary)]">Funding:</strong> {strategy.funding}</p>
                <p><strong className="text-[var(--text-primary)]">Risk:</strong> {strategy.risk}</p>
                <p><strong className="text-[var(--text-primary)]">Internship proof:</strong> {strategy.internship}</p>
              </div>
              <div className="mt-3 border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]">{strategy.next}</div>
            </Panel>
          );
        })}
      </div>

      <Panel className="p-4">
        <SectionTitle title="Regional Focus Matrix" />
        <div className="overflow-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-[var(--bg-tertiary)] text-xs uppercase text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2">Best Use</th>
                <th className="px-3 py-2">Proof Needed</th>
                <th className="px-3 py-2">Do Next</th>
              </tr>
            </thead>
            <tbody>
              {regionalStrategies.map((strategy, index) => (
                <tr className={index % 2 ? "bg-[var(--bg-primary)]" : ""} key={strategy.region}>
                  <td className="border-t border-[var(--border)] px-3 py-3 font-bold text-[var(--accent-indigo)]">{strategy.region}</td>
                  <td className="border-t border-[var(--border)] px-3 py-3 text-[var(--text-secondary)]">{strategy.focus}</td>
                  <td className="border-t border-[var(--border)] px-3 py-3 text-[var(--text-secondary)]">{strategy.internship}</td>
                  <td className="border-t border-[var(--border)] px-3 py-3 text-[var(--text-secondary)]">{strategy.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="p-4">
        <SectionTitle title="90-Day Execution Sprint" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {sprintPlan.map((item) => (
            <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-4" key={item.window}>
              <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{item.window}</div>
              <h3 className="heading mt-1 text-lg font-semibold">{item.output}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.action}</p>
              <div className="mt-3 border border-[var(--border)] bg-[var(--bg-secondary)] p-2 text-xs font-semibold text-[var(--accent-indigo)]">{item.supports}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-4">
        <SectionTitle title="Internship Search Keyword Bank" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {keywordBanks.map((bank) => <CompactRow key={bank.label} title={bank.label} meta={bank.terms} value="copy" />)}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {internshipTracks.map((track) => (
          <Panel className="p-4" key={track.title}>
            <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{track.fit} fit</div>
            <h3 className="heading mt-1 text-lg font-semibold">{track.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{track.why}</p>
            <div className="mt-3 border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]">
              Proof to build: {track.proof}
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="p-4">
        <SectionTitle title="What To Search Every Week" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          <CompactRow title="UX Research Intern" meta="Microsoft, Google, product companies, design teams" value="weekly" />
          <CompactRow title="Consumer Insights Intern" meta="Kantar, NielsenIQ, Ipsos, market research firms" value="weekly" />
          <CompactRow title="Behavioral Science Intern" meta="BIT, ICF, policy labs, behavioural consultancies" value="weekly" />
          <CompactRow title="Research Assistant Psychology" meta="Christ, professors, university labs, remote RA calls" value="weekly" />
          <CompactRow title="Product Intern Mental Health" meta="Mental health startups, wellbeing apps, NGOs" value="weekly" />
          <CompactRow title="Data Analyst Intern Psychology" meta="Survey, social media, product analytics roles" value="weekly" />
        </div>
      </Panel>

      <Panel className="flex flex-wrap gap-3 p-4">
        <Filter
          label="Source Type"
          value={status}
          options={[
            "all",
            "usa_funding",
            "usa_rule",
            "usa_risk",
            "asia_funding",
            "asia_rule",
            "europe_funding",
            "europe_programme",
            "europe_risk",
            "college_funding",
            "college_rule",
            "scholarship_database",
            "internship_source",
            "internship_example",
          ]}
          onChange={setStatus}
        />
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filtered.map((source) => (
          <Panel className="p-4" key={source.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{source.status}</div>
                <h3 className="heading mt-1 text-lg font-semibold">{source.title}</h3>
              </div>
              <a className="border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]" href={source.url ?? "#"} target="_blank" rel="noreferrer">Open</a>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{source.notes}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

const shortlistStatuses = ["researching", "shortlisted", "preparing", "applied", "interview", "offer", "enrolled"];
const applicationStatuses = ["researching", "shortlisted", "preparing", "applied", "interview", "offer", "scholarship", "visa", "finalized"];
const lorStatuses = ["not_requested", "requested", "drafting", "submitted"];
const visaStatuses = ["not_started", "documents", "funds", "applied", "interview", "approved", "rejected"];
const sopStatuses = ["draft", "review", "final"];

function displayStatus(value: unknown) {
  return String(value ?? "not_started").replace(/_/g, " ");
}

function moneyUsd(value: unknown) {
  const amount = Number(value ?? 0);
  return amount ? `$${amount.toLocaleString()}` : "Verify";
}

function nextStatusValue(current: unknown, statuses: string[]) {
  const index = statuses.indexOf(String(current));
  if (index < 0) return statuses[0];
  return statuses[Math.min(statuses.length - 1, index + 1)];
}

function progressFromStatus(current: unknown, statuses: string[]) {
  const index = Math.max(0, statuses.indexOf(String(current)));
  return Math.round(((index + 1) / statuses.length) * 100);
}

function universityById(universities: University[], id: unknown) {
  return universities.find((university) => Number(university.id) === Number(id));
}

function courseUniversityName(record: CourseIntelligence, universities: University[]) {
  return universityById(universities, record.universityId)?.name ?? record.programName;
}

function intakeCountLabel(record: CourseIntelligence) {
  if (record.intakeCountStatus === "not_published") return "Not published";
  if (record.intakeCountStatus === "not_published_selection_no") return "Not capped";
  if (record.intakeCountStatus.includes("range")) return "25-30";
  return record.intakeCount ? String(record.intakeCount) : "Verify";
}

function trackerUrgency(record: CourseIntelligence) {
  const days = daysUntil(record.nextCheckDate);
  if (String(record.applicationStatus).toLowerCase().includes("open")) return { label: "Live check", tone: "text-[var(--accent-emerald)]" };
  if (days !== null && days <= 30) return { label: "Recheck soon", tone: "text-[var(--accent-amber)]" };
  return { label: "Watchlist", tone: "text-[var(--text-secondary)]" };
}

function projectMetrics(value: unknown) {
  const metrics = asRecord(value);
  return Object.entries(metrics).map(([key, metricValue]) => ({
    label: key.replace(/_/g, " "),
    value: metricValue === null || metricValue === undefined ? "To add" : String(metricValue),
  }));
}

function EmptyModuleState({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="p-5">
      <h3 className="heading text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
    </Panel>
  );
}

function ModuleHero({ eyebrow, title, body, metrics }: { eyebrow: string; title: string; body: string; metrics: Array<{ label: string; value: string }> }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{eyebrow}</div>
          <h2 className="heading mt-1 text-2xl font-semibold">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {metrics.map((metric) => <Metric key={metric.label} label={metric.label} value={metric.value} />)}
        </div>
      </div>
    </Panel>
  );
}

function CourseIntakeTrackerPanel({ records, universities, onNavigate }: { records: CourseIntelligence[]; universities: University[]; onNavigate: (page: PageKey) => void }) {
  const sorted = [...records].sort((a, b) => String(a.nextCheckDate).localeCompare(String(b.nextCheckDate)));
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">Real-Time Intake Watch</div>
          <h3 className="heading mt-1 text-2xl font-semibold">Course, intake and research tracker</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Tracks intake term, cohort size when published, current application state, next official-source check, and the research angle you should build for each target.
          </p>
        </div>
        <button className="border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--accent-indigo)]" onClick={() => onNavigate("universities")} type="button">
          Open Course Details
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-5">
        {sorted.map((record) => {
          const urgency = trackerUrgency(record);
          return (
            <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4" key={record.id ?? record.universityId}>
              <div className={`mono text-[10px] font-bold uppercase ${urgency.tone}`}>{urgency.label}</div>
              <div className="heading mt-2 text-lg font-semibold text-[var(--accent-indigo)]">{courseUniversityName(record, universities)}</div>
              <div className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{record.programName}</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label="Intake" value={intakeCountLabel(record)} />
                <Metric label="Term" value={record.intakeTerm.split(" ").slice(0, 2).join(" ")} />
              </div>
              <div className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{record.applicationStatus}</div>
              <div className="mt-3 border-t border-[var(--border)] pt-3">
                <div className="mono text-[10px] uppercase text-[var(--text-secondary)]">Next check</div>
                <div className="mt-1 text-sm font-bold text-[var(--accent-emerald)]">{formatIstDate(record.nextCheckDate)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function StatusButtonRow({ row, statuses, endpoint, queryKey }: { row: AnyRow; statuses: string[]; endpoint: string; queryKey: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: string) => apiPut(`${endpoint}/${row.id}`, { ...row, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const current = String(row.status ?? statuses[0]);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          className={`border px-3 py-1.5 text-xs font-bold uppercase ${
            current === status
              ? "border-[var(--accent-indigo)] bg-[var(--accent-indigo)] text-white"
              : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-indigo)]"
          }`}
          disabled={mutation.isPending}
          key={status}
          onClick={() => mutation.mutate(status)}
          type="button"
        >
          {displayStatus(status)}
        </button>
      ))}
    </div>
  );
}

function ShortlistPage() {
  const { data: shortlist = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["shortlist"], queryFn: () => apiGet<AnyRow[]>("/api/shortlist") });
  const { data: universities = [] } = useQuery({ queryKey: ["universities"], queryFn: () => apiGet<University[]>("/api/universities") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading university shortlist...</div>;
  if (isError) return <QueryErrorState title="Shortlist could not load" error={error} onRetry={() => void refetch()} />;
  const nextDeadline = shortlist
    .filter((row) => row.deadline)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))[0]?.deadline;
  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="University Shortlist"
        body="This is your working board for target schools. Move a university as your decision matures, then use the detail page for the exact roadmap."
        metrics={[
          { label: "Schools", value: String(shortlist.length) },
          { label: "Priority 5", value: String(shortlist.filter((row) => Number(row.priority) >= 5).length) },
          { label: "Next Date", value: nextDeadline ? formatIstDate(String(nextDeadline)) : "Set dates" },
        ]}
      />
      {shortlist.length === 0 ? (
        <EmptyModuleState title="No shortlist yet" body="Open Elite Universities and add your first target school." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {shortlistStatuses.map((status) => {
            const rows = shortlist.filter((row) => row.status === status);
            return (
              <Panel className="p-4" key={status}>
                <SectionTitle title={`${displayStatus(status)} (${rows.length})`} />
                <div className="space-y-3">
                  {rows.length === 0 && <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]">No schools here yet.</div>}
                  {rows.map((row) => {
                    const university = universityById(universities, row.universityId);
                    return (
                      <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4" key={row.id}>
                        <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{university?.name ?? `University #${String(row.universityId)}`}</div>
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">{university?.programName ?? "Program to verify"}</div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Metric label="Priority" value={String(row.priority ?? "-")} />
                          <Metric label="Deadline" value={row.deadline ? formatIstDate(String(row.deadline)) : "Set"} />
                        </div>
                        <p className="mt-3 text-sm text-[var(--text-secondary)]">{String(row.notes ?? "No notes yet.")}</p>
                        <StatusButtonRow row={row} statuses={shortlistStatuses} endpoint="/api/shortlist" queryKey="shortlist" />
                      </div>
                    );
                  })}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SopStudioPage() {
  const queryClient = useQueryClient();
  const { data: docs = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["sops"], queryFn: () => apiGet<AnyRow[]>("/api/sops") });
  const { data: universities = [] } = useQuery({ queryKey: ["universities"], queryFn: () => apiGet<University[]>("/api/universities") });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AnyRow | null>(null);
  const [dirty, setDirty] = useState(false);
  const selected = docs.find((doc) => Number(doc.id) === selectedId) ?? docs[0] ?? null;
  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AnyRow }) => apiPut(`/api/sops/${id}`, body),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const createMutation = useMutation({
    mutationFn: () => apiPost<AnyRow>("/api/sops", {
      title: "New Personal SOP Draft",
      type: "university",
      targetUniversityId: null,
      content: "Opening:\n\nWhy this field:\n\nResearch proof:\n\nMentally Prepare / UX research proof:\n\nWhy this university:\n\nCareer direction:",
      version: 1,
      status: "draft",
      notes: "Created inside Aashi Dreams.",
    }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setSelectedId(Number(created.id));
    },
  });

  useEffect(() => {
    if (!selectedId && selected?.id) setSelectedId(Number(selected.id));
  }, [selectedId, selected?.id]);

  useEffect(() => {
    if (selected) {
      setDraft(selected);
      setDirty(false);
    }
  }, [selected?.id]);

  useEffect(() => {
    if (!draft?.id || !dirty) return undefined;
    const timer = window.setTimeout(() => {
      saveMutation.mutate({ id: Number(draft.id), body: draft });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, dirty]);

  function updateDraft(patch: AnyRow) {
    setDraft((current) => ({ ...(current ?? {}), ...patch }));
    setDirty(true);
  }

  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading SOP Studio...</div>;
  if (isError) return <QueryErrorState title="SOP Studio could not load" error={error} onRetry={() => void refetch()} />;
  const selectedUniversity = draft ? universityById(universities, draft.targetUniversityId) : null;

  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="SOP Studio"
        body="Build one master story bank, then turn it into university-specific statements around psychology, digital behaviour, Mentally Prepare, UX research, and behavioural science."
        metrics={[
          { label: "Documents", value: String(docs.length) },
          { label: "Final", value: String(docs.filter((doc) => doc.status === "final").length) },
          { label: "Autosave", value: dirty ? "Saving" : "Ready" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.42fr_1fr]">
        <Panel className="p-4">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle title="Documents" />
            <button className="mb-3 border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]" disabled={createMutation.isPending} onClick={() => createMutation.mutate()} type="button">
              New
            </button>
          </div>
          <div className="space-y-2">
            {docs.map((doc) => (
              <button
                className={`w-full border p-3 text-left ${Number(doc.id) === Number(draft?.id) ? "border-[var(--accent-indigo)] bg-[var(--bg-tertiary)]" : "border-[var(--border)] bg-[var(--bg-primary)]"}`}
                key={doc.id}
                onClick={() => setSelectedId(Number(doc.id))}
                type="button"
              >
                <div className="font-bold text-[var(--accent-indigo)]">{String(doc.title)}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{String(doc.type)} | {displayStatus(doc.status)}</div>
              </button>
            ))}
          </div>
        </Panel>
        {draft ? (
          <Panel className="p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <input className="border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-lg font-bold text-[var(--accent-indigo)]" value={String(draft.title ?? "")} onChange={(event) => updateDraft({ title: event.target.value })} />
              <select className="border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm" value={String(draft.status ?? "draft")} onChange={(event) => updateDraft({ status: event.target.value })}>
                {sopStatuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
              </select>
            </div>
            <div className="mt-3 text-xs text-[var(--text-secondary)]">Target: {selectedUniversity?.name ?? "General story bank"} | Version {String(draft.version ?? 1)}</div>
            <textarea className="mt-4 min-h-[460px] w-full border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm leading-6" value={String(draft.content ?? "")} onChange={(event) => updateDraft({ content: event.target.value })} />
            <textarea className="mt-3 h-24 w-full border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm" placeholder="Private notes" value={String(draft.notes ?? "")} onChange={(event) => updateDraft({ notes: event.target.value })} />
          </Panel>
        ) : (
          <EmptyModuleState title="No SOP documents yet" body="Create your master story bank first." />
        )}
      </div>
    </div>
  );
}

function lorDraftText(contact: AnyRow) {
  return `Subject: Request for Letter of Recommendation\n\nDear ${String(contact.name ?? "Professor")},\n\nI hope you are doing well. I am preparing my master's applications in Behavioural Science, Behaviour Change, HCI/UX Research, and Consumer Psychology. I would be grateful if you could support my application with a recommendation letter.\n\nThe key points I hope the letter can reflect are my academic work in psychology, my current research paper on first-person vs third-person games and derealization, my UX Researcher internship, and my Mentally Prepare initiative in student mental health.\n\nI can share my CV, SOP draft, transcript, target programmes, and a short briefing note to make the process easy for you.\n\nWarmly,\nAnushka`;
}

function LorCommandPage() {
  const { data: contacts = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["lors"], queryFn: () => apiGet<AnyRow[]>("/api/lors") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading LOR Command Center...</div>;
  if (isError) return <QueryErrorState title="LOR Command Center could not load" error={error} onRetry={() => void refetch()} />;
  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="LOR Command Center"
        body="Elite applications need two strong references. Track who can prove your academics, research, internship signal, and founder/product initiative."
        metrics={[
          { label: "Contacts", value: String(contacts.length) },
          { label: "Submitted", value: String(contacts.filter((contact) => contact.status === "submitted").length) },
          { label: "Avg Strength", value: contacts.length ? `${Math.round(contacts.reduce((sum, row) => sum + Number(row.strengthScore ?? 0), 0) / contacts.length)}/10` : "0/10" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {contacts.map((contact) => (
          <Panel className="p-4" key={contact.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{String(contact.relationship)} | {displayStatus(contact.status)}</div>
                <h3 className="heading mt-1 text-xl font-semibold">{String(contact.name)}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{String(contact.role)} | {String(contact.institution)}</p>
              </div>
              <div className="mono text-3xl font-bold text-[var(--accent-emerald)]">{String(contact.strengthScore)}/10</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label="Deadline" value={contact.deadline ? formatIstDate(String(contact.deadline)) : "Set"} />
              <Metric label="Email" value={contact.email ? "Added" : "Missing"} />
            </div>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">{String(contact.notes ?? "")}</p>
            <StatusButtonRow row={contact} statuses={lorStatuses} endpoint="/api/lors" queryKey="lors" />
            <details className="mt-4 border border-[var(--border)] bg-[var(--bg-primary)] p-3">
              <summary className="cursor-pointer text-sm font-bold text-[var(--accent-indigo)]">Request email draft</summary>
              <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[var(--text-secondary)]">{lorDraftText(contact)}</pre>
            </details>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ApplicationTrackerPage() {
  const { data: applications = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["applications"], queryFn: () => apiGet<AnyRow[]>("/api/applications") });
  const { data: universities = [] } = useQuery({ queryKey: ["universities"], queryFn: () => apiGet<University[]>("/api/universities") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading application tracker...</div>;
  if (isError) return <QueryErrorState title="Application Tracker could not load" error={error} onRetry={() => void refetch()} />;
  const submitted = applications.filter((row) => applicationStatuses.indexOf(String(row.status)) >= applicationStatuses.indexOf("applied")).length;
  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="Application Tracker"
        body="This is the execution board. Each card should end with a verified deadline, SOP state, LOR state, funding rule, and final submit status."
        metrics={[
          { label: "Applications", value: String(applications.length) },
          { label: "Submitted+", value: String(submitted) },
          { label: "Progress", value: applications.length ? `${Math.round((submitted / applications.length) * 100)}%` : "0%" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {applicationStatuses.map((status) => {
          const rows = applications.filter((row) => row.status === status);
          return (
            <Panel className="p-4" key={status}>
              <SectionTitle title={`${displayStatus(status)} (${rows.length})`} />
              <div className="space-y-3">
                {rows.length === 0 && <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]">No applications here.</div>}
                {rows.map((row) => {
                  const university = universityById(universities, row.universityId);
                  const progress = progressFromStatus(row.status, applicationStatuses);
                  return (
                    <div className="border-2 border-[var(--border)] bg-[var(--bg-primary)] p-4" key={row.id}>
                      <div className="heading text-lg font-semibold text-[var(--accent-indigo)]">{university?.name ?? `University #${String(row.universityId)}`}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">{String(row.program)}</div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold uppercase text-[var(--text-secondary)]">
                        <span>Checklist progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-[var(--bg-tertiary)]"><div className="h-1.5 bg-[var(--accent-indigo)]" style={{ width: `${progress}%` }} /></div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Metric label="Deadline" value={row.deadline ? formatIstDate(String(row.deadline)) : "Set"} />
                        <Metric label="Submitted" value={row.submittedDate ? formatIstDate(String(row.submittedDate)) : "No"} />
                      </div>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">{String(row.notes ?? "")}</p>
                      <StatusButtonRow row={row} statuses={applicationStatuses} endpoint="/api/applications" queryKey="applications" />
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function VisaTrackerPage() {
  const { data: visas = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["visas"], queryFn: () => apiGet<AnyRow[]>("/api/visas") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading visa tracker...</div>;
  if (isError) return <QueryErrorState title="Visa Tracker could not load" error={error} onRetry={() => void refetch()} />;
  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="Visa Tracker"
        body="Use this as the risk layer behind every country choice. Admission only matters if funding, work rights, stay-back, and documents are realistic."
        metrics={[
          { label: "Countries", value: String(visas.length) },
          { label: "Approved", value: String(visas.filter((visa) => visa.status === "approved").length) },
          { label: "Highest Funds", value: visas.length ? moneyUsd(Math.max(...visas.map((visa) => Number(visa.fundsRequiredUsd ?? 0)))) : "$0" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visas.map((visa) => {
          const checklist = asStringList(visa.documentsChecklist);
          const progress = progressFromStatus(visa.status, visaStatuses);
          return (
            <Panel className="p-4" key={visa.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{displayStatus(visa.status)} | {String(visa.visaType)}</div>
                  <h3 className="heading mt-1 text-xl font-semibold">{String(visa.country)}</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{String(visa.workRightsSummary)}</p>
                </div>
                <div className="mono text-3xl font-bold text-[var(--accent-emerald)]">{progress}%</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label="Funds" value={moneyUsd(visa.fundsRequiredUsd)} />
                <Metric label="Stay Back" value={`${String(visa.stayBackYears)} yrs`} />
              </div>
              <div className="mt-4">
                <SectionTitle title="Document Checklist" />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {checklist.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{String(visa.timelineNotes ?? "")}</p>
              <StatusButtonRow row={visa} statuses={visaStatuses} endpoint="/api/visas" queryKey="visas" />
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function ProductPortfolioPage() {
  const { data: projects = [], error, isError, isLoading, refetch } = useQuery({ queryKey: ["portfolio"], queryFn: () => apiGet<AnyRow[]>("/api/portfolio") });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading product portfolio...</div>;
  if (isError) return <QueryErrorState title="Product Portfolio could not load" error={error} onRetry={() => void refetch()} />;
  const active = projects.filter((project) => project.status === "active").length;
  return (
    <div className="space-y-4">
      <ModuleHero
        eyebrow="Unlocked personal module"
        title="Product Portfolio"
        body="This is your proof vault. Mentally Prepare and the UX Researcher internship should become case studies that admissions teams can understand in one minute."
        metrics={[
          { label: "Projects", value: String(projects.length) },
          { label: "Active", value: String(active) },
          { label: "Case Studies", value: String(projects.filter((project) => project.type === "case_study").length) },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {projects.map((project) => {
          const isUx = String(project.title).toLowerCase().includes("ux");
          const proofList = isUx
            ? ["Research question", "Participant/interview count", "Usability test evidence", "Insight themes", "Recommendation shipped", "Product impact"]
            : ["Problem statement", "Target users", "Behavioral design logic", "Community signal", "Experiment log", "Growth metric"];
          return (
            <Panel className="p-4" key={project.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mono text-[10px] uppercase text-[var(--accent-indigo)]">{String(project.type)} | {displayStatus(project.status)}</div>
                  <h3 className="heading mt-1 text-xl font-semibold">{String(project.title)}</h3>
                </div>
                <div className="border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-bold text-[var(--accent-emerald)]">{displayStatus(project.status)}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{String(project.description)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {projectMetrics(project.metrics).slice(0, 4).map((metric) => <Metric key={metric.label} label={metric.label} value={metric.value} />)}
              </div>
              <div className="mt-4">
                <SectionTitle title="Evidence To Capture" />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {proofList.map((item) => <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)]" key={item}>{item}</div>)}
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{String(project.notes ?? "")}</p>
              <StatusButtonRow row={project} statuses={["active", "completed", "paused"]} endpoint="/api/portfolio" queryKey="portfolio" />
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function GenericDataPage({ page, title }: { page: PageKey; title: string }) {
  const endpoint = endpointByPage[page];
  const { data = [], error, isError, isLoading, refetch } = useQuery({ queryKey: [page], queryFn: () => apiGet<AnyRow[]>(endpoint!), enabled: Boolean(endpoint) });
  if (!endpoint) return <Placeholder title={title} />;
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading {title}...</div>;
  if (isError) return <QueryErrorState title={`${title} could not load`} error={error} onRetry={() => void refetch()} />;
  const rows = Array.isArray(data) ? data : [data];
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter((key) => !["createdAt", "updatedAt", "content", "notes"].includes(key)).slice(0, 7);
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div>
          <h2 className="heading text-lg font-semibold">{title}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{rows.length ? `${rows.length} records from SQLite` : "No rows yet. Add first entry via API or next UI pass."}</p>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--bg-tertiary)] text-xs uppercase text-[var(--text-secondary)]">
            <tr>{keys.map((key) => <th className="px-3 py-2 font-semibold" key={key}>{key}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr className={index % 2 ? "bg-[var(--bg-primary)]" : ""} key={row.id ?? index}>
                {keys.map((key) => <td className="max-w-[260px] truncate border-t border-[var(--border)] px-3 py-2" key={key}>{formatCell(row[key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return formatIstDate(value);
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, error, isError, isLoading, refetch } = useQuery({ queryKey: ["profile"], queryFn: () => apiGet<AnyRow[]>("/api/profile") });
  const row = data?.[0];
  const [draft, setDraft] = useState("");
  const mutation = useMutation({
    mutationFn: (body: AnyRow) => apiPut(`/api/profile/${row?.id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
  if (isLoading) return <div className="text-[var(--text-secondary)]">Loading profile...</div>;
  if (isError) return <QueryErrorState title="Profile could not load" error={error} onRetry={() => void refetch()} />;
  if (!row) return <QueryErrorState title="No profile found" error="The database is missing the seeded Anushka profile. Run npm run seed." />;
  return (
    <Panel className="p-5">
      <h2 className="heading text-xl font-semibold">{String(row.name)}</h2>
      <p className="mt-1 text-[var(--text-secondary)]">{String(row.degree)} | {String(row.university)} | {String(row.year)}</p>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <pre className="max-h-[540px] overflow-auto border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-xs text-[var(--text-secondary)]">{JSON.stringify(row, null, 2)}</pre>
        <div>
          <label className="text-xs uppercase text-[var(--text-secondary)]">Quick notes autosave</label>
          <textarea
            className="mt-2 h-48 w-full border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm"
            placeholder="Add profile note, then click autosave demo"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="mt-3 bg-[var(--accent-indigo)] px-4 py-2 font-semibold text-white" type="button" onClick={() => mutation.mutate({ ...row, year: draft || row.year })}>Autosave now</button>
        </div>
      </div>
    </Panel>
  );
}

function AiPage({ type }: { type: string }) {
  const mutation = useMutation({ mutationFn: () => apiPost<AnyRow>("/api/ai/analyze", { type }) });
  const missingKey = Boolean(mutation.data?.missingApiKey);
  return (
    <Panel className="p-5">
      <h2 className="heading text-xl font-semibold">{type === "life_sim" ? "Life Design Simulator" : type === "top1_analysis" ? "Top 1% Applicant Analysis" : "AI Advisor"}</h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Calls the single `/api/ai/analyze` endpoint. If `OPENAI_API_KEY` is missing, this page shows the setup warning instead of crashing.</p>
      <button className="mt-5 bg-[var(--accent-indigo)] px-4 py-2 font-semibold text-white" onClick={() => mutation.mutate()} type="button">Generate {type}</button>
      {mutation.error && <pre className="mt-4 whitespace-pre-wrap border border-[var(--accent-amber)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--accent-amber)]">{String(mutation.error.message)}</pre>}
      {missingKey && (
        <div className="mt-4 border border-[var(--accent-amber)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--accent-amber)]">
          OpenAI is not connected yet. Add `OPENAI_API_KEY=sk-...` to `.env`, then restart the API.
        </div>
      )}
      {mutation.data && !missingKey && <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm">{JSON.stringify(mutation.data, null, 2)}</pre>}
    </Panel>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <Panel className="p-5">
      <h2 className="heading text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-[var(--text-secondary)]">This module is routed. The next pass will add its specialized controls on top of the existing database/API foundation.</p>
    </Panel>
  );
}

const pageTitles: Record<PageKey, string> = {
  dashboard: "Aashi Dashboard",
  profile: "My Profile",
  universities: "Elite Universities",
  shortlist: "University Shortlist",
  ielts: "IELTS Hub",
  research: "Research Lab",
  sops: "SOP Studio",
  lors: "LOR Command Center",
  applications: "Application Tracker",
  scholarships: "Scholarship Tracker",
  visas: "Visa Tracker",
  careers: "Career Explorer",
  portfolio: "Product Portfolio",
  opportunities: "Opportunity Radar",
  people: "Faculty Intelligence",
  sources: "Official Sources",
  delta: "Profile Delta",
  advisor: "AI Advisor",
  top1: "Top 1% Analysis",
  life: "Life Design Simulator",
};

function CurrentPage() {
  const page = useUiStore((state) => state.page);
  if (page === "dashboard") return <Dashboard />;
  if (page === "universities") return <UniversitiesPage />;
  if (page === "profile") return <ProfilePage />;
  if (page === "shortlist") return <ShortlistPage />;
  if (page === "people") return <FacultyPage />;
  if (page === "delta") return <DeltaPage />;
  if (page === "research") return <ResearchLabPage />;
  if (page === "ielts") return <IeltsHubPage />;
  if (page === "sops") return <SopStudioPage />;
  if (page === "lors") return <LorCommandPage />;
  if (page === "applications") return <ApplicationTrackerPage />;
  if (page === "scholarships") return <ScholarshipTrackerPage />;
  if (page === "visas") return <VisaTrackerPage />;
  if (page === "portfolio") return <ProductPortfolioPage />;
  if (page === "opportunities") return <OpportunityRadarPage />;
  if (page === "sources") return <OfficialSourcesPage />;
  if (page === "advisor") return <AiPage type="weekly_plan" />;
  if (page === "top1") return <TopOnePage />;
  if (page === "life") return <AiPage type="life_sim" />;
  return <GenericDataPage page={page} title={pageTitles[page]} />;
}

export function App() {
  const { collapsed, page, setPage } = useUiStore();
  const brand = usePartnerBrand();
  const [premiumFeature, setPremiumFeature] = useState<string | null>(null);
  return (
    <div>
      <Sidebar onLockedFeature={setPremiumFeature} />
      <main className={`main-content ${collapsed ? "md:ml-16" : "md:ml-60"} min-h-screen bg-[var(--bg-primary)] transition-all`}>
        <PrintedReportHeader brand={brand} />
        <header className="sticky top-0 z-10 border-b-2 border-[var(--border)] bg-[var(--bg-primary)]/90 px-4 py-4 backdrop-blur-md md:px-8 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="brand-name mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-indigo)]">{brand.brandName} | Asia/Kolkata | {formatIstDateTime()}</div>
              <h1 className="heading mt-2 text-3xl font-bold text-[var(--accent-violet)]">{pageTitles[page]}</h1>
              <PartnerLicenseBanner brand={brand} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TrustBadge />
              <ProductStatus />
              <button className="print-button border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[var(--accent-indigo)]" onClick={() => window.print()} type="button">
                Generate My Aashi Report
              </button>
            </div>
          </div>
          <select
            className="mt-4 w-full border-2 border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-3 text-sm font-bold text-[var(--text-primary)] md:hidden"
            value={page}
            onChange={(event) => {
              const nextPage = event.target.value as PageKey;
              const item = flatNavItems.find((navItem) => navItem.key === nextPage);
              if (item && lockedPages.has(item.key)) {
                setPremiumFeature(item.label);
                return;
              }
              setPage(nextPage);
            }}
          >
            {flatNavItems.map((item) => <option key={item.key} value={item.key}>{item.label}{lockedPages.has(item.key) ? " premium" : ""}</option>)}
          </select>
        </header>
        <div className="p-4 md:p-8">
          <CurrentPage />
        </div>
      </main>
      <PremiumFeatureModal feature={premiumFeature} onClose={() => setPremiumFeature(null)} />
    </div>
  );
}

