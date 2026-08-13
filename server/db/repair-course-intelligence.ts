import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import { courseIntelligence, documents, universities } from "./schema.js";
import { nowIso } from "../lib/time.js";

initDb();

const now = nowIso();
const verifiedAt = "2026-08-13T00:00:00.000Z";

type SourceLink = { label: string; url: string };

type CourseIntelligenceSeed = {
  match: (name: string) => boolean;
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
  sourceUrls: SourceLink[];
  sourceConfidence: string;
  nextCheckDate: string;
  notes: string;
};

const seeds: CourseIntelligenceSeed[] = [
  {
    match: (name) => name.includes("london school of economics"),
    programName: "MSc Behavioural Science",
    intakeTerm: "28 September 2026",
    intakeFrequency: "One main autumn intake per academic year",
    intakeCount: 66,
    intakeCountStatus: "official_2024_intake",
    applicationStatus: "2026/27 closed; rolling admission closes when full",
    applicationOpenDate: "2025-10-08",
    applicationCloseDate: null,
    priorityFundingDate: "2026-04-23",
    courseSummary:
      "World-leading behavioural science master's focused on understanding, predicting and influencing human behaviour through psychology, economics, statistics, experimental design and applied behaviour-change methods.",
    moduleHighlights: [
      "Foundations in Behavioural Science",
      "Experimental Design and Methods for Behavioural Science",
      "Quantitative Applications for Behavioural Science",
      "Dissertation",
      "Optional courses can include consumer behaviour, health, happiness, wellbeing, AI and new technology.",
    ],
    researchHighlights: [
      "Close link with the LSE Behavioural Lab.",
      "Department research spans behavioural science, behavioural public policy, behavioural economics, social psychology, wellbeing, health and technology.",
      "New 2026 AI and New Technology specialism can fit digital behaviour, AI companions, human-AI interaction and product psychology.",
    ],
    researchFitActions: [
      "Frame your gaming/derealization paper as evidence of digital-behaviour research maturity.",
      "Position Mentally Prepare as applied behavioural science for student wellbeing.",
      "Prepare one dissertation idea around AI companions, loneliness, digital wellbeing or behavioural design in mental-health technology.",
      "Shortlist LSE Behavioural Lab and PBS faculty whose work touches technology, wellbeing, behavioural economics or policy.",
    ],
    requirementHighlights: [
      "Upper second class honours 2:1 or equivalent.",
      "Applications welcomed from psychology, economics, sociology, statistics, management, law and related backgrounds.",
      "Quantitative methods awareness matters; LSE expects willingness to work with datasets and experimental/quasi-experimental methods.",
      "Application considers academic achievement, statement of academic purpose, two references and CV.",
      "English requirement is Higher.",
    ],
    sourceUrls: [
      { label: "LSE MSc Behavioural Science", url: "https://www.lse.ac.uk/study-at-lse/graduate/msc-behavioural-science" },
      { label: "LSE available programmes", url: "https://www.lse.ac.uk/study-at-lse/graduate/available-programmes" },
      { label: "LSE Behavioural Lab", url: "https://www.lse.ac.uk/PBS/research/Behavioural-Lab" },
    ],
    sourceConfidence: "official programme page + official availability page",
    nextCheckDate: "2026-10-01",
    notes: "Published 2024 signals: 448 applications, 66 intake, 7:1 ratio. Use this as high-competition proof; apply early for the next cycle.",
  },
  {
    match: (name) => name.includes("warwick"),
    programName: "MSc Behavioural and Economic Science (Science Track)",
    intakeTerm: "28 September 2026",
    intakeFrequency: "One main autumn intake per academic year",
    intakeCount: 30,
    intakeCountStatus: "official_range_25_to_30",
    applicationStatus: "2026 entry closed after extended 2 August 2026 final deadline",
    applicationOpenDate: "2025-10-01",
    applicationCloseDate: "2026-08-02",
    priorityFundingDate: "2025-12-31",
    courseSummary:
      "Quantitative behavioural economics and decision-science master's led by Psychology, with multidisciplinary input from Psychology, Economics and Warwick Business School.",
    moduleHighlights: [
      "Three core modules across Psychology, Economics and Warwick Business School.",
      "Behavioural and Economic Science summer project.",
      "Optional modules vary each year.",
      "Teaching uses lectures, seminars, workshops, practical classes and quantitative modelling.",
    ],
    researchHighlights: [
      "Strong fit for judgement and decision-making, behavioural experiments, modelling and large-scale behavioural datasets.",
      "The course explicitly trains students to design, conduct and analyse behavioural experiments.",
      "Psychology at Warwick is research-driven and links taught study to postgraduate research routes.",
    ],
    researchFitActions: [
      "Build a quantitative appendix for your research paper: design, measures, sample, analysis plan and limitations.",
      "Add R/statistics learning evidence before applying.",
      "Turn UX research internship evidence into behavioural experiment/intervention language.",
      "Use Mentally Prepare as a behavioural-intervention case rather than only a startup story.",
    ],
    requirementHighlights: [
      "2:1 undergraduate degree or equivalent in a related subject.",
      "Designed for science-based or quantitatively strong backgrounds including psychology, maths, biology, business and finance.",
      "Comfort with statistics, regression/ANOVA, R, mathematical modelling, probability and behavioural data is important.",
      "IELTS Band B: overall 7.0 with component rules.",
      "Typically one academic reference for taught courses.",
    ],
    sourceUrls: [
      { label: "Warwick course page", url: "https://warwick.ac.uk/study/postgraduate/courses/msc-behavioural-economics-science/" },
      { label: "Warwick Psychology", url: "https://warwick.ac.uk/fac/sci/psych/" },
    ],
    sourceConfidence: "official programme page",
    nextCheckDate: "2026-10-01",
    notes: "Official page states typical class size around 25-30 students. Use 30 as the tracker ceiling but display as a range.",
  },
  {
    match: (name) => name.includes("ucl") || name.includes("university college london"),
    programName: "MSc Behaviour Change",
    intakeTerm: "September 2026",
    intakeFrequency: "One main autumn intake per academic year",
    intakeCount: null,
    intakeCountStatus: "not_published",
    applicationStatus: "Visa applicants closed 27 March 2026; non-visa applicants open until 28 August 2026",
    applicationOpenDate: "2025-10-20",
    applicationCloseDate: "2026-03-27",
    priorityFundingDate: null,
    courseSummary:
      "Applied behaviour-change master's centred on systematic use of behaviour-change theory and methods to design, implement and evaluate interventions, primarily using the Behaviour Change Wheel.",
    moduleHighlights: [
      "Behaviour Change: An Interdisciplinary Approach",
      "Changing Behaviour: Intervention Development and Evaluation",
      "Theories and Models of Behaviour Change",
      "Research Methods and Evidence for Global Health",
      "Research Project",
      "Electives include health and wellbeing, transport behaviour change, digital health, judgement and decision making, and policy.",
    ],
    researchHighlights: [
      "Draws on the UCL Centre for Behaviour Change.",
      "Dissertation is an 8000-word research project applying behaviour-change frameworks to a real-world problem.",
      "Project topics have included youth mental-health interventions, app engagement, evidence-based teaching and wellbeing policy.",
      "Behavioural Insights Exchange can connect students to external-organisation projects.",
    ],
    researchFitActions: [
      "Make Mentally Prepare your strongest behaviour-change intervention case.",
      "Use UX Researcher internship as proof of qualitative/quantitative research experience.",
      "Develop one research idea on mental-health app engagement, student isolation or digital wellbeing.",
      "Prepare a portfolio page showing intervention design, evaluation logic and ethical considerations.",
    ],
    requirementHighlights: [
      "Minimum upper second-class UK bachelor's degree or equivalent in behavioural/social science such as psychology, sociology, anthropology or social geography.",
      "Relevant quantitative or qualitative research experience is required.",
      "Practical behaviour-change experience through paid or voluntary work is beneficial.",
      "English language level is UCL Level 2.",
      "Two references required.",
    ],
    sourceUrls: [
      { label: "UCL Behaviour Change MSc", url: "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/behaviour-change-msc" },
      { label: "UCL Centre for Behaviour Change", url: "https://www.ucl.ac.uk/behaviour-change/" },
    ],
    sourceConfidence: "official programme page",
    nextCheckDate: "2026-10-20",
    notes: "Cohort size/intake count is not published on the programme page. Treat admissions pressure as high because UCL advises early applications due to competition.",
  },
  {
    match: (name) => name.includes("erasmus"),
    programName: "MSc Economics and Business: Behavioural Economics specialisation",
    intakeTerm: "September",
    intakeFrequency: "One main September intake per academic year",
    intakeCount: null,
    intakeCountStatus: "not_published_selection_no",
    applicationStatus: "2026/27 non-EEA deadline passed on 1 April 2026",
    applicationOpenDate: "2025-10-01",
    applicationCloseDate: "2026-04-01",
    priorityFundingDate: null,
    courseSummary:
      "Economics-and-business MSc specialisation in Behavioural Economics focused on how context and framing influence decision-making and how behavioural insights can improve strategy, products and policy.",
    moduleHighlights: [
      "60 EC full-time one-year MSc.",
      "Economics and business specialisation with behavioural decision-making depth.",
      "Students can tailor their experience by choosing a track that fits their interests.",
      "No internship listed on official facts page.",
    ],
    researchHighlights: [
      "Programme benefits from the internationally recognised Behavioural Economics Group.",
      "Skills include analysing behavioural patterns, designing and running economic experiments and applying findings to sustainability, digital security and policy.",
      "Good bridge between consumer decision-making, business strategy and behavioural economics.",
    ],
    researchFitActions: [
      "Strengthen microeconomics, game theory, mathematics, econometrics and statistics proof.",
      "Frame your UX research internship as behavioural pattern analysis and evidence synthesis.",
      "Build a consumer psychology angle around digital products, mental-health decisions or app engagement.",
      "Keep this as a high-ROI Europe option but check non-EEA funding separately.",
    ],
    requirementHighlights: [
      "Full-time English-taught MSc, 1 year, 60 EC.",
      "Non-EEA application deadline listed as 1 April; EEA deadline listed as 1 May.",
      "Selection listed as No.",
      "Behavioural Economics fit expects curiosity about decision-making, microeconomics, game theory, maths, econometrics and statistics.",
      "Non-EEA tuition fee for 2026-2027 listed as EUR 21,000.",
    ],
    sourceUrls: [
      { label: "Erasmus Behavioural Economics", url: "https://www.eur.nl/en/master/behavioural-economics" },
      { label: "Erasmus facts and figures", url: "https://www.eur.nl/en/master/behavioural-economics/facts-figures" },
      { label: "Why this programme", url: "https://www.eur.nl/en/master/behavioural-economics/why-this-programme" },
    ],
    sourceConfidence: "official programme page + official facts page",
    nextCheckDate: "2026-10-01",
    notes: "Official page lists selection as No, but does not publish cohort size. Track as not capped unless the next-cycle page changes.",
  },
  {
    match: (name) => name.includes("carnegie mellon"),
    programName: "Master of Human-Computer Interaction",
    intakeTerm: "August to August three-semester programme",
    intakeFrequency: "One annual fall intake; no spring intake",
    intakeCount: 57,
    intakeCountStatus: "official_fall_2025_matriculation",
    applicationStatus: "2026/27 closed; next application season expected in fall",
    applicationOpenDate: null,
    applicationCloseDate: null,
    priorityFundingDate: null,
    courseSummary:
      "STEM-designated one-year professional HCI master's preparing students to plan, design, build and evaluate human-centred technologies across UX research, product, AI, design, engineering and strategy.",
    moduleHighlights: [
      "Three-semester accelerated curriculum completed August to August.",
      "7 core classes and 4 electives.",
      "User-Centered Research and Evaluation trains observational studies, interviews, usability evaluation and mixed methods.",
      "Interaction Design Fundamentals and Advanced Interaction Design.",
      "Programming Interactive Experiences or Software Structures for User Interfaces.",
      "Seven-month industry Capstone with external client.",
    ],
    researchHighlights: [
      "HCII expertise spans computer science, AI, cognitive psychology, behavioural science, design, engineering, accessibility and robotics.",
      "Advanced Study option can add research-lab opportunities, but MHCI itself is a professional master's rather than PhD pathway.",
      "Strong direct fit for UX Researcher, Product Manager, AI product and human-AI interaction routes.",
    ],
    researchFitActions: [
      "Make your UX Researcher internship the centrepiece case study.",
      "Build one HCI-ready portfolio artifact: research plan, interview guide, usability protocol, synthesis and design recommendation.",
      "Show technical readiness with Python/statistics or a no-code-to-code research ops workflow.",
      "Use Mentally Prepare as a human-centred AI/digital wellbeing product problem, not only a psychology startup.",
    ],
    requirementHighlights: [
      "One annual application process; applications are due in January for fall admission.",
      "2025-26 acceptance rate published as 23%, varying year to year.",
      "Fall 2025 matriculation listed as 57 MHCI students plus 1 continuing student.",
      "GRE optional; no minimum GRE requirement.",
      "TOEFL/IELTS required for F-1/J-1 non-native English speakers; FAQ lists IELTS minimum 8.5 with no subscore below 8.",
      "No departmental financial aid or tuition support listed.",
    ],
    sourceUrls: [
      { label: "CMU MHCI overview", url: "https://hcii.cmu.edu/academics/mhci" },
      { label: "CMU MHCI curriculum", url: "https://hcii.cmu.edu/academics/mhci/curriculum" },
      { label: "CMU MHCI FAQ", url: "https://hcii.cmu.edu/academics/mhci/faq" },
    ],
    sourceConfidence: "official programme page + official curriculum + official FAQ",
    nextCheckDate: "2026-10-01",
    notes: "CMU is the strongest USA behavioural-design/HCI-adjacent route, but IELTS and funding hurdles are unusually high.",
  },
];

const allUniversities = db.select().from(universities).all();

for (const seed of seeds) {
  const university = allUniversities.find((row) => seed.match(row.name.toLowerCase()));
  if (!university) {
    console.warn(`Could not match university for ${seed.programName}`);
    continue;
  }

  const existing = db
    .select()
    .from(courseIntelligence)
    .where(eq(courseIntelligence.universityId, university.id))
    .get();

  const values = {
    universityId: university.id,
    programName: seed.programName,
    intakeTerm: seed.intakeTerm,
    intakeFrequency: seed.intakeFrequency,
    intakeCount: seed.intakeCount,
    intakeCountStatus: seed.intakeCountStatus,
    applicationStatus: seed.applicationStatus,
    applicationOpenDate: seed.applicationOpenDate,
    applicationCloseDate: seed.applicationCloseDate,
    priorityFundingDate: seed.priorityFundingDate,
    courseSummary: seed.courseSummary,
    moduleHighlights: seed.moduleHighlights,
    researchHighlights: seed.researchHighlights,
    researchFitActions: seed.researchFitActions,
    requirementHighlights: seed.requirementHighlights,
    sourceUrls: seed.sourceUrls,
    sourceConfidence: seed.sourceConfidence,
    lastVerifiedAt: verifiedAt,
    nextCheckDate: seed.nextCheckDate,
    notes: seed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    db.update(courseIntelligence).set(values).where(eq(courseIntelligence.id, existing.id)).run();
  } else {
    db.insert(courseIntelligence).values(values).run();
  }

  for (const source of seed.sourceUrls) {
    const sourceTitle = `${university.name} - ${source.label}`;
    const existingSource = db.select().from(documents).where(eq(documents.title, sourceTitle)).get();
    const sourceValues = {
      title: sourceTitle,
      type: "official_source",
      url: source.url,
      status: "verified",
      notes: `${seed.programName}: ${seed.sourceConfidence}. ${seed.notes}`,
      createdAt: existingSource?.createdAt ?? now,
      updatedAt: now,
    };
    if (existingSource) {
      db.update(documents).set(sourceValues).where(eq(documents.id, existingSource.id)).run();
    } else {
      db.insert(documents).values(sourceValues).run();
    }
  }
}

console.log("Repaired course, intake and research intelligence for behavioural-science targets.");
