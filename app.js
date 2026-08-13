const profileDefaults = {
  gpa: 76,
  research: 72,
  founder: 85,
  writing: 81,
};

let profile = { ...profileDefaults };
let selectedPathId = "behavioral-science";
let selectedAdvisorId = "behavioral";
let collegeFilter = "all";
let countryFilter = "all";
let liveUpdates = [];
let selectedUniversityName = "National University of Singapore";

const dnaModel = [
  { label: "Curiosity", base: 90, weights: { research: 0.08, writing: 0.04 } },
  { label: "Research Orientation", base: 68, weights: { research: 0.24, gpa: 0.08 } },
  { label: "Leadership", base: 63, weights: { founder: 0.18, writing: 0.04 } },
  { label: "Entrepreneurship", base: 64, weights: { founder: 0.26 } },
  { label: "Analytical Thinking", base: 61, weights: { gpa: 0.15, research: 0.09 } },
  { label: "Emotional Intelligence", base: 80, weights: { writing: 0.09, research: 0.04 } },
];

const careerFits = [
  {
    name: "Behavioral Product Manager",
    formula: ({ research, founder, writing }) => 30 + research * 0.26 + founder * 0.24 + writing * 0.15,
  },
  {
    name: "Consumer Insights Lead",
    formula: ({ research, writing, gpa }) => 29 + research * 0.31 + writing * 0.17 + gpa * 0.08,
  },
  {
    name: "Founder, Mental Health Tech",
    formula: ({ founder, research, writing }) => 28 + founder * 0.34 + research * 0.12 + writing * 0.07,
  },
  {
    name: "UX Researcher",
    formula: ({ research, writing, gpa }) => 27 + research * 0.24 + writing * 0.2 + gpa * 0.08,
  },
  {
    name: "Behavioral Scientist",
    formula: ({ research, gpa, writing }) => 26 + research * 0.3 + gpa * 0.14 + writing * 0.08,
  },
];

const actions = [
  {
    icon: "1",
    title: "Turn Mentally Prepare into measurable proof",
    detail: "Add user growth, retention, survey outcomes, and one behavior-change case study.",
  },
  {
    icon: "2",
    title: "Package the research paper",
    detail: "Create an abstract, poster, publication target list, and professor outreach draft.",
  },
  {
    icon: "3",
    title: "Build one flagship portfolio page",
    detail: "Connect psychology, behavioral science, product thinking, and mental health technology.",
  },
];

const paths = [
  {
    id: "behavioral-science",
    type: "study",
    name: "MSc Behavioural Science",
    probability: 68,
    salary: "$72k",
    cost: "$44k",
    risk: "Medium",
    visa: "Good",
    demand: "High",
    aiRisk: "Low-medium",
    projection: "Best route for research-backed product, policy, and mental health tech roles.",
    lift: "IELTS 8, stronger GPA story, one publication-ready project, research recommendation.",
  },
  {
    id: "consumer-psych",
    type: "study",
    name: "MSc Consumer Psychology",
    probability: 74,
    salary: "$65k",
    cost: "$36k",
    risk: "Low-medium",
    visa: "Moderate",
    demand: "High",
    aiRisk: "Medium",
    projection: "Strong fit for insights, brand strategy, UX research, and consumer behavior roles.",
    lift: "Portfolio with 3 consumer behavior analyses and internship evidence.",
  },
  {
    id: "pm-track",
    type: "build",
    name: "AI Product Management Track",
    probability: 71,
    salary: "$88k",
    cost: "$18k",
    risk: "Medium-high",
    visa: "Flexible",
    demand: "Very high",
    aiRisk: "Medium",
    projection: "High upside if Mentally Prepare becomes a product case study with real traction.",
    lift: "Ship a product sprint, interview 30 users, publish product teardown essays.",
  },
  {
    id: "founder",
    type: "build",
    name: "Founder Route",
    probability: 58,
    salary: "Variable",
    cost: "$12k",
    risk: "High",
    visa: "Depends",
    demand: "High",
    aiRisk: "Low",
    projection: "Highest ownership and upside, strongest if combined with accelerators and grants.",
    lift: "User growth, clinical safety advisors, grant pipeline, accelerator applications.",
  },
];

const universities = [
  {
    tier: "Reach",
    rank: "#132 QS WUR 2026",
    name: "University of Bath",
    country: "United Kingdom",
    program: "MSc Applied Psychology and Economic Behaviour",
    acceptance: "18-25%",
    chance: 76,
    scholarship: 63,
    roi: 82,
    missing: "Quant proof and sharper economics link.",
    about: "Bath is a strong UK option for applied psychology, decision-making, and economic behavior with a practical research culture.",
    fit: "Good fit if you want behavioral science with measurable policy, product, and consumer behavior applications.",
  },
  {
    tier: "Target",
    rank: "#=140 QS WUR 2026",
    name: "Erasmus University Rotterdam",
    country: "Europe",
    location: "Netherlands",
    program: "MSc Behavioural Economics",
    acceptance: "25-35%",
    chance: 70,
    scholarship: 78,
    roi: 86,
    missing: "Math confidence and research fit statement.",
    about: "Erasmus is strong for economics, behavior, and European career mobility, especially if you want consumer and decision science.",
    fit: "Best when your profile shows quant confidence plus curiosity about markets and human behavior.",
  },
  {
    tier: "Reach",
    rank: "#74 QS WUR 2026",
    name: "University of Warwick",
    country: "United Kingdom",
    program: "MSc Behavioural and Economic Science",
    acceptance: "15-25%",
    chance: 64,
    scholarship: 58,
    roi: 80,
    missing: "Higher GPA framing and strong academic recommendation.",
    about: "Warwick is a respected UK research university with a rigorous behavioral and economic science environment.",
    fit: "A reach-style option if you can strengthen academic proof and show serious research potential.",
  },
  {
    tier: "Safe",
    rank: "#=517 QS WUR 2026",
    name: "University of Stirling",
    country: "United Kingdom",
    program: "MSc Behavioural Science",
    acceptance: "40-55%",
    chance: 82,
    scholarship: 69,
    roi: 78,
    missing: "More visible applied project evidence.",
    about: "Stirling is a practical UK option with a friendlier admission profile and relevant behavioral science pathways.",
    fit: "Good safety/target choice if you want a stronger probability with credible UK outcomes.",
  },
  {
    tier: "Reach",
    rank: "#56 QS WUR 2026",
    name: "London School of Economics",
    country: "United Kingdom",
    program: "MSc Behavioural Science",
    acceptance: "8-15%",
    chance: 52,
    scholarship: 44,
    roi: 88,
    missing: "Publication-ready research, stronger academic marks, and a very focused behavioral science fit.",
    about: "LSE is one of the most powerful brands for social science, policy, economics, and behavioral science.",
    fit: "Best if your application becomes highly research-led and shows a precise behavioral science mission.",
  },
  {
    tier: "Reach",
    rank: "#9 QS WUR 2026",
    name: "UCL",
    country: "United Kingdom",
    program: "MSc Cognitive and Decision Sciences",
    acceptance: "12-20%",
    chance: 57,
    scholarship: 49,
    roi: 86,
    missing: "More cognitive science evidence and stronger statistics story.",
    about: "UCL is a top London university with strong cognitive science, psychology, neuroscience, and human behavior research.",
    fit: "Strong for a psychology-to-cognition-to-product path if you can show methods and statistics readiness.",
  },
  {
    tier: "Target",
    rank: "#31 QS WUR 2026",
    name: "King's College London",
    country: "United Kingdom",
    program: "MSc Mental Health Studies",
    acceptance: "25-35%",
    chance: 73,
    scholarship: 56,
    roi: 77,
    missing: "Clinical mental health exposure and a sharper public-impact narrative.",
    about: "King's has a strong health, mental health, and London clinical ecosystem.",
    fit: "Good if Mentally Prepare becomes your central proof of public mental health interest.",
  },
  {
    tier: "Target",
    rank: "#34 QS WUR 2026",
    name: "University of Edinburgh",
    country: "United Kingdom",
    program: "MSc Psychology of Mental Health",
    acceptance: "20-30%",
    chance: 66,
    scholarship: 54,
    roi: 83,
    missing: "Better methods evidence and a stronger reason for Scotland/Edinburgh fit.",
    about: "Edinburgh combines strong global reputation with psychology, mental health, and research depth.",
    fit: "Good for mental health psychology if your SOP clearly links research, wellbeing, and future impact.",
  },
  {
    tier: "Target",
    rank: "#79 QS WUR 2026",
    name: "University of Glasgow",
    country: "United Kingdom",
    program: "MSc Psychological Science",
    acceptance: "30-40%",
    chance: 78,
    scholarship: 61,
    roi: 79,
    missing: "Clearer research question and stronger psychology methods proof.",
    about: "Glasgow offers strong psychology and behavioral science options with solid UK outcomes.",
    fit: "A strong target if your research question and methods story become sharper.",
  },
  {
    tier: "Safe",
    rank: "#278 QS WUR 2026",
    name: "University of Sussex",
    country: "United Kingdom",
    program: "MSc Foundations of Clinical Psychology and Mental Health",
    acceptance: "45-60%",
    chance: 84,
    scholarship: 67,
    roi: 76,
    missing: "More mental health volunteering evidence and practical intervention outcomes.",
    about: "Sussex is a practical UK option with psychology and mental health pathways.",
    fit: "Good if you want a safer admission route while still keeping mental health as the core direction.",
  },
  {
    tier: "Safe",
    rank: "#380 QS WUR 2026",
    name: "University of Kent",
    country: "United Kingdom",
    program: "MSc Social and Applied Psychology",
    acceptance: "50-65%",
    chance: 86,
    scholarship: 72,
    roi: 74,
    missing: "A cleaner bridge from social psychology to product and wellbeing.",
    about: "Kent is a useful safety option for applied and social psychology.",
    fit: "Good if you want to preserve the psychology path while building product and wellbeing proof.",
  },
  {
    tier: "Reach",
    rank: "#8 QS WUR 2026",
    name: "National University of Singapore",
    country: "Asia",
    location: "Singapore",
    program: "MSc Psychology / Social science research pathway",
    acceptance: "10-20%",
    chance: 43,
    scholarship: 46,
    roi: 88,
    missing: "A very strong research statement, supervisor fit, and measurable mental health tech proof.",
    about: "NUS is Asia's highest-ranked university and one of the strongest choices for Singapore outcomes.",
    fit: "Excellent if you want Asia, research credibility, and a future mental health or human behavior technology path.",
  },
  {
    tier: "Reach",
    rank: "#11 QS WUR 2026",
    name: "University of Hong Kong",
    country: "Asia",
    location: "Hong Kong",
    program: "Master of Social Sciences in Psychology",
    acceptance: "15-25%",
    chance: 54,
    scholarship: 48,
    roi: 85,
    missing: "Clear psychology foundation and stronger applied research evidence.",
    about: "HKU is a top Hong Kong university with strong global recognition and Asian career access.",
    fit: "Good if you want psychology with international exposure and strong city outcomes.",
  },
  {
    tier: "Reach",
    rank: "#12 QS WUR 2026",
    name: "Nanyang Technological University",
    country: "Asia",
    location: "Singapore",
    program: "Psychology / communication and information pathway",
    acceptance: "12-22%",
    chance: 45,
    scholarship: 44,
    roi: 87,
    missing: "More human-computer interaction proof and a sharper technology angle.",
    about: "NTU is a top Singapore university with strong technology, communication, and research ecosystems.",
    fit: "Best if you build the human-tech side of your profile through product, UX, or HCI work.",
  },
  {
    tier: "Reach",
    rank: "#14 QS WUR 2026",
    name: "Peking University",
    country: "Asia",
    location: "Beijing, China",
    program: "Psychology / social science graduate pathway",
    acceptance: "8-18%",
    chance: 34,
    scholarship: 38,
    roi: 82,
    missing: "Language/program fit, supervisor alignment, and stronger academic research proof.",
    about: "Peking University is one of China's most prestigious universities with deep social science reputation.",
    fit: "A reach option if you have strong regional fit, language/program clarity, and a serious research proposal.",
  },
  {
    tier: "Reach",
    rank: "#17 QS WUR 2026",
    name: "Tsinghua University",
    country: "Asia",
    location: "Beijing, China",
    program: "Global innovation / social science pathway",
    acceptance: "8-18%",
    chance: 35,
    scholarship: 40,
    roi: 84,
    missing: "Technical innovation story and China-specific program fit.",
    about: "Tsinghua is elite for innovation, technology, and interdisciplinary research.",
    fit: "Useful if your path becomes more AI, technology, innovation, and mental health product oriented.",
  },
  {
    tier: "Target",
    rank: "#36 QS WUR 2026",
    name: "University of Tokyo",
    country: "Asia",
    location: "Tokyo, Japan",
    program: "Psychology / interdisciplinary information studies pathway",
    acceptance: "20-35%",
    chance: 49,
    scholarship: 52,
    roi: 81,
    missing: "Professor contact, research proposal, and Japan scholarship timeline.",
    about: "The University of Tokyo is Japan's flagship university with strong research depth.",
    fit: "Good if you can build a professor-fit research proposal and plan early for Japan scholarships.",
  },
  {
    tier: "Target",
    rank: "#38 QS WUR 2026",
    name: "Seoul National University",
    country: "Asia",
    location: "Seoul, South Korea",
    program: "Psychology / social science graduate pathway",
    acceptance: "20-35%",
    chance: 47,
    scholarship: 50,
    roi: 80,
    missing: "Korea scholarship route, faculty fit, and stronger research methods signal.",
    about: "SNU is South Korea's leading university and strong for research and regional outcomes.",
    fit: "Good if you want psychology or social science research with Korea scholarship possibilities.",
  },
  {
    tier: "Target",
    rank: "QS WUR 2025 #53; 2026 verify",
    name: "KAIST",
    country: "Asia",
    location: "Daejeon, South Korea",
    program: "Graduate School of Culture Technology / HCI path",
    acceptance: "20-35%",
    chance: 51,
    scholarship: 56,
    roi: 86,
    missing: "A stronger product proof system and human-AI interaction portfolio.",
    about: "KAIST is strong for technology, design, and human-computer interaction adjacent pathways.",
    fit: "Best if Aashi Dreams or Mentally Prepare becomes a visible product case study.",
  },
  {
    tier: "Safe",
    rank: "#=63 QS WUR 2026",
    name: "City University of Hong Kong",
    country: "Asia",
    location: "Hong Kong",
    program: "Applied social science / psychology pathway",
    acceptance: "35-50%",
    chance: 68,
    scholarship: 58,
    roi: 77,
    missing: "Cleaner SOP link between psychology, consumer behavior, and mental health tech.",
    about: "CityU Hong Kong is a practical Asia option with social science and applied pathways.",
    fit: "Good target/safety option for applied psychology with Asian city outcomes.",
  },
  {
    tier: "Safe",
    rank: "#=58 QS WUR 2026",
    name: "University of Malaya",
    country: "Asia",
    location: "Kuala Lumpur, Malaysia",
    program: "Master of Psychological Medicine / counselling-adjacent path",
    acceptance: "40-60%",
    chance: 73,
    scholarship: 64,
    roi: 75,
    missing: "Program eligibility check and mental health practice exposure.",
    about: "University of Malaya is Malaysia's top university and a more affordable Asia option.",
    fit: "Good if cost control and regional mental health pathways matter.",
  },
  {
    tier: "Target",
    rank: "#53 QS WUR 2026",
    name: "University of Amsterdam",
    country: "Europe",
    location: "Netherlands",
    program: "Research Master's Psychology",
    acceptance: "20-30%",
    chance: 61,
    scholarship: 62,
    roi: 84,
    missing: "Research methods depth and a faculty-fit shortlist.",
    about: "Amsterdam is strong for psychology, research, and European social science outcomes.",
    fit: "Good if you want a rigorous research master's and can show strong methods ability.",
  },
  {
    tier: "Reach",
    rank: "#15 QS WUR 2026",
    name: "University of Pennsylvania",
    country: "United States",
    location: "Pennsylvania, USA",
    program: "Master of Behavioral and Decision Sciences",
    acceptance: "7-15%",
    chance: 44,
    scholarship: 36,
    roi: 91,
    missing: "Stronger quantitative proof, faculty-fit paragraph, and a polished applied behavior portfolio.",
    about: "Penn is one of the strongest US options for behavioral and decision sciences.",
    fit: "Excellent reach if you build a quant-backed behavioral science profile with applied proof.",
  },
  {
    tier: "Reach",
    rank: "#38 QS WUR 2026",
    name: "Columbia University",
    country: "United States",
    location: "New York, USA",
    program: "MA Quantitative Methods in the Social Sciences",
    acceptance: "15-25%",
    chance: 49,
    scholarship: 34,
    roi: 87,
    missing: "Statistics, research writing sample, and a clearer psychology-to-data argument.",
    about: "Columbia offers a powerful New York social science and data ecosystem.",
    fit: "Good if you want to turn psychology into quantitative social science and insights work.",
  },
  {
    tier: "Reach",
    rank: "#52 QS WUR 2026",
    name: "Carnegie Mellon University",
    country: "United States",
    location: "Pennsylvania, USA",
    program: "Master of Human-Computer Interaction",
    acceptance: "10-20%",
    chance: 42,
    scholarship: 32,
    roi: 93,
    missing: "A stronger product case study, UX research portfolio, and shipped interface evidence.",
    about: "CMU is elite for HCI, design, product, and technology research.",
    fit: "Best for your product/UX/mental-health-tech direction if you build a serious portfolio.",
  },
  {
    tier: "Reach",
    rank: "#55 QS WUR 2026",
    name: "New York University",
    country: "United States",
    location: "New York, USA",
    program: "MA Psychology / Consumer Psychology-adjacent path",
    acceptance: "20-30%",
    chance: 58,
    scholarship: 41,
    roi: 82,
    missing: "Clearer specialization: mental health, consumer insight, or UX research.",
    about: "NYU gives New York access and flexible psychology/consumer/product-adjacent pathways.",
    fit: "Good if your direction becomes consumer psychology, UX research, or mental health innovation.",
  },
  {
    tier: "Reach",
    rank: "#13 QS WUR 2026",
    name: "University of Chicago",
    country: "United States",
    location: "Illinois, USA",
    program: "MA Computational Social Science",
    acceptance: "10-18%",
    chance: 38,
    scholarship: 30,
    roi: 89,
    missing: "Much stronger coding, methods, and computational social science evidence.",
    about: "Chicago is academically intense and excellent for social science and computational methods.",
    fit: "A reach if you strengthen coding, statistics, and data-driven behavior research.",
  },
  {
    tier: "Reach",
    rank: "#17 QS WUR 2026",
    name: "UC Berkeley",
    country: "United States",
    location: "California, USA",
    program: "Master of Information Management and Systems",
    acceptance: "12-22%",
    chance: 40,
    scholarship: 28,
    roi: 94,
    missing: "Technical product portfolio, data skills, and a sharper human-centered technology story.",
    about: "Berkeley is a top technology and social impact ecosystem.",
    fit: "Excellent for human-centered technology if you build technical and product evidence.",
  },
  {
    tier: "Target",
    rank: "#46 QS WUR 2026",
    name: "UCLA",
    country: "United States",
    location: "California, USA",
    program: "Psychology / Social Science research pathway",
    acceptance: "20-35%",
    chance: 55,
    scholarship: 35,
    roi: 86,
    missing: "Faculty-fit shortlist and stronger research methods proof.",
    about: "UCLA has strong psychology, research, and California career advantages.",
    fit: "Good target/reach if your psychology research evidence becomes stronger.",
  },
  {
    tier: "Target",
    rank: "#45 QS WUR 2026",
    name: "University of Michigan",
    country: "United States",
    location: "Michigan, USA",
    program: "MS Survey and Data Science",
    acceptance: "25-40%",
    chance: 62,
    scholarship: 43,
    roi: 84,
    missing: "Survey design, statistics, and behavioral data project evidence.",
    about: "Michigan is strong for survey research, data, social science, and applied outcomes.",
    fit: "Good if you want consumer insights, behavioral data, or research analytics.",
  },
  {
    tier: "Target",
    rank: "#42 QS WUR 2026",
    name: "Northwestern University",
    country: "United States",
    location: "Illinois, USA",
    program: "MS Integrated Marketing Communications",
    acceptance: "25-40%",
    chance: 65,
    scholarship: 39,
    roi: 83,
    missing: "Consumer behavior portfolio and clearer marketing analytics proof.",
    about: "Northwestern is strong for marketing, communication, consumer insight, and media.",
    fit: "Good if you lean toward consumer psychology, brand strategy, and marketing analytics.",
  },
  {
    tier: "Safe",
    rank: "#=88 QS WUR 2026",
    name: "Boston University",
    country: "United States",
    location: "Massachusetts, USA",
    program: "MA Psychology / Applied social science path",
    acceptance: "35-50%",
    chance: 71,
    scholarship: 46,
    roi: 78,
    missing: "A more focused mental health tech narrative and strong recommendation letters.",
    about: "Boston University is a strong US option with broad psychology and applied social science routes.",
    fit: "Good safety/target if you want US exposure without only depending on ultra-reach schools.",
  },
];

const roadmapTemplate = [
  {
    phase: "Now",
    steps: ["Confirm exact program eligibility", "Save entry requirements and fees", "Write a 6-line why-fit note"],
  },
  {
    phase: "Next 30 days",
    steps: ["Build college-specific SOP outline", "Shortlist 2 faculty/lab/course links", "Map Mentally Prepare to this program"],
  },
  {
    phase: "Next 60 days",
    steps: ["Prepare CV and research summary", "Ask for recommendation strategy", "Create scholarship evidence folder"],
  },
  {
    phase: "Before deadline",
    steps: ["Finalize SOP", "Submit application form", "Track scholarship and interview updates"],
  },
];

function getRankSource(rank) {
  if (rank.includes("verify")) {
    return "Rank needs manual verification before final use";
  }
  if (rank.includes("QS WUR 2026") || rank.includes("QS 2026")) {
    return "QS World University Rankings 2026";
  }
  if (rank.includes("band")) {
    return "Approximate ranking band, not a final rank";
  }
  return "Ranking source not set";
}

function getCollegeRequirements(uni) {
  const base = ["Transcript / mark sheets", "CV or resume", "Statement of purpose", "2 recommendation letters"];
  const byCountry = {
    "United States": ["GRE only if program asks", "Writing sample or portfolio", "Proof of funding plan"],
    "United Kingdom": ["IELTS/TOEFL if required", "Academic reference", "Personal statement"],
    Europe: ["IELTS/TOEFL if required", "Course-by-course eligibility check", "Motivation letter"],
    Asia: ["English test or waiver check", "Faculty/supervisor fit note", "Scholarship eligibility proof"],
  };
  const extra = byCountry[uni.country] || [];
  if (uni.program.toLowerCase().includes("hci") || uni.program.toLowerCase().includes("information")) {
    extra.push("UX/product portfolio");
  }
  if (uni.program.toLowerCase().includes("research") || uni.program.toLowerCase().includes("psychology")) {
    extra.push("Research summary");
  }
  return [...new Set([...base, ...extra])];
}

function getCollegeSourceLinks(uni) {
  const query = encodeURIComponent(`${uni.name} ${uni.program} admissions`);
  const scholarshipQuery = encodeURIComponent(`${uni.name} international postgraduate scholarships`);
  return [
    { label: "Program page", url: `https://www.google.com/search?q=${query}` },
    { label: "Scholarships", url: `https://www.google.com/search?q=${scholarshipQuery}` },
    { label: "QS profile", url: `https://www.google.com/search?q=${encodeURIComponent(`${uni.name} QS World University Rankings 2026`)}` },
  ];
}

function getCollegeActionPlan(uni) {
  const plans = {
    Reach: [
      "Build one standout proof asset before applying.",
      "Ask one professor/mentor to review your fit story.",
      "Apply only if the SOP is specific to this program, not generic.",
    ],
    Target: [
      "Use this as a serious shortlist option.",
      "Make your SOP evidence-led and program-specific.",
      "Prepare scholarship material alongside the main application.",
    ],
    Safe: [
      "Keep this as a probability stabilizer.",
      "Still write a strong SOP; safe does not mean automatic.",
      "Compare total cost and visa/outcome value carefully.",
    ],
  };
  return plans[uni.tier] || plans.Target;
}

const scholarships = [
  { name: "Erasmus Mundus", match: 88, why: "Strong international fit if the narrative becomes research-led." },
  { name: "Chevening", match: 72, why: "Leadership and future impact are strong; work experience needs depth." },
  { name: "DAAD", match: 55, why: "Possible if Germany programs and academic proof become stronger." },
  { name: "University Merit Awards", match: 81, why: "Best near-term route through GPA, SOP, and recommendation quality." },
];

const story = [
  { title: "Psychology", detail: "The base lens: human behavior, emotion, and decision making." },
  { title: "Research Paper", detail: "Proof that curiosity can become structured academic work." },
  { title: "Mentally Prepare", detail: "A real-world mental health initiative with community value." },
  { title: "Behavioral Science", detail: "The bridge from psychology to measurable behavior change." },
  { title: "Product Management", detail: "Turning behavioral insight into tools people can use." },
  { title: "Mental Health Tech", detail: "The long-term mission: ethical, useful systems for wellbeing." },
];

const opportunities = [
  { tag: "Research", title: "Submit paper abstract to a student research conference", fit: 91 },
  { tag: "Product", title: "Run 20 user interviews for Mentally Prepare", fit: 89 },
  { tag: "Scholarship", title: "Build one master scholarship evidence folder", fit: 84 },
  { tag: "Founder", title: "Shortlist mental health incubators and student grants", fit: 82 },
];

const fallbackLiveUpdates = [
  {
    title: "Japan MEXT scholarship watchlist",
    type: "Scholarship",
    match: 78,
    deadline: "Varies by embassy cycle",
    source: "Embassy / MEXT pages",
    role: "Prepare research plan and professor-fit list",
    who: "Japanese embassy, university international office",
  },
  {
    title: "Singapore graduate scholarship scan",
    type: "Scholarship",
    match: 72,
    deadline: "Program-specific",
    source: "NUS / NTU scholarship pages",
    role: "Map your mental health tech project to research impact",
    who: "Graduate admissions and faculty supervisor",
  },
  {
    title: "Behavioral science conference abstract",
    type: "Research",
    match: 86,
    deadline: "Next open call",
    source: "Conference/news scan",
    role: "Turn research paper into a 250-word abstract",
    who: "Faculty mentor or research supervisor",
  },
];

const skills = [
  { year: "2026", items: ["AI Product Management", "Behavioral Design", "Digital Wellbeing Research"] },
  { year: "2028", items: ["Human AI Interaction", "AI Ethics Research", "Consumer AI Strategy"] },
  { year: "2030", items: ["Cognitive Interface Design", "Behavioral Data Products", "Trust and Safety Psychology"] },
];

const advisors = [
  {
    id: "behavioral",
    name: "Behavioral Scientist",
    initial: "B",
    opener: "Your strongest edge is applied behavior: show how psychology became an intervention, not just an interest.",
  },
  {
    id: "admissions",
    name: "Admissions Officer",
    initial: "A",
    opener: "Your SOP should make one argument: you are already practicing the work your master's will formalize.",
  },
  {
    id: "scholarship",
    name: "Scholarship Advisor",
    initial: "S",
    opener: "Scholarship strength will come from leadership, impact evidence, and a very specific return-to-impact plan.",
  },
  {
    id: "founder",
    name: "Startup Founder",
    initial: "F",
    opener: "Treat Mentally Prepare as your proof engine: user pain, traction, insight, iteration, and outcomes.",
  },
];

const clampScore = (value) => Math.max(0, Math.min(99, Math.round(value)));

function getDnaScores() {
  return dnaModel.map((item) => {
    const weighted = Object.entries(item.weights).reduce((score, [key, weight]) => score + profile[key] * weight, item.base);
    return { label: item.label, score: clampScore(weighted) };
  });
}

function getCareerRankings() {
  return careerFits
    .map((career) => ({ name: career.name, score: clampScore(career.formula(profile)) }))
    .sort((a, b) => b.score - a.score);
}

function getReadiness() {
  return clampScore(profile.gpa * 0.18 + profile.research * 0.3 + profile.founder * 0.28 + profile.writing * 0.24);
}

function getConfidence() {
  const readiness = getReadiness();
  const spread = Math.abs(profile.research - profile.founder);
  return clampScore(readiness - spread * 0.08 + 3);
}

function renderInputs() {
  document.querySelectorAll("[data-input]").forEach((input) => {
    input.value = profile[input.dataset.input];
  });
  document.querySelectorAll("[data-value]").forEach((node) => {
    node.textContent = profile[node.dataset.value];
  });
}

function renderTwin() {
  document.getElementById("readinessScore").textContent = getReadiness();
  document.getElementById("confidenceScore").textContent = `${getConfidence()}%`;

  document.getElementById("dnaList").innerHTML = getDnaScores()
    .map(
      (item) => `
        <div class="dna-row">
          <strong>${item.label}</strong>
          <div class="bar-track"><div class="bar-fill" style="width: ${item.score}%"></div></div>
          <span>${item.score}%</span>
        </div>
      `,
    )
    .join("");

  document.getElementById("careerRankings").innerHTML = getCareerRankings()
    .map(
      (item, index) => `
        <li class="rank-item">
          <span>${index + 1}</span>
          <div>
            <strong>${item.name}</strong>
            <div class="meta">${item.score}% fit based on today's profile</div>
          </div>
        </li>
      `,
    )
    .join("");

  document.getElementById("actionList").innerHTML = actions
    .map(
      (action) => `
        <div class="action-card">
          <i>${action.icon}</i>
          <div>
            <strong>${action.title}</strong>
            <div class="meta">${action.detail}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderPaths(filter = "all") {
  const shownPaths = filter === "all" ? paths : paths.filter((path) => path.type === filter);
  if (!shownPaths.some((path) => path.id === selectedPathId)) {
    selectedPathId = shownPaths[0]?.id || paths[0].id;
  }

  document.getElementById("pathTable").innerHTML = shownPaths
    .map(
      (path) => `
        <button class="path-row ${path.id === selectedPathId ? "is-selected" : ""}" type="button" data-path="${path.id}">
          <div>
            <strong>${path.name}</strong>
            <div class="meta">${path.projection}</div>
          </div>
          <div><span class="metric-label">Chance</span><span class="metric-value">${path.probability}%</span></div>
          <div><span class="metric-label">Salary</span><span class="metric-value">${path.salary}</span></div>
          <div><span class="metric-label">Cost</span><span class="metric-value">${path.cost}</span></div>
          <div><span class="metric-label">Risk</span><span class="metric-value">${path.risk}</span></div>
        </button>
      `,
    )
    .join("");

  renderSelectedPath();
}

function renderSelectedPath() {
  const path = paths.find((item) => item.id === selectedPathId) || paths[0];
  document.getElementById("selectedPath").innerHTML = `
    <p class="eyebrow">Selected path</p>
    <h3>${path.name}</h3>
    <strong class="big-number">${path.probability}%</strong>
    <p>${path.projection}</p>
    <div class="detail-grid">
      <div class="detail-tile"><span class="metric-label">Future demand</span><strong>${path.demand}</strong></div>
      <div class="detail-tile"><span class="metric-label">AI disruption</span><strong>${path.aiRisk}</strong></div>
      <div class="detail-tile"><span class="metric-label">Migration</span><strong>${path.visa}</strong></div>
      <div class="detail-tile"><span class="metric-label">To improve</span><strong>${path.lift}</strong></div>
    </div>
  `;
}

function renderUniversities() {
  const visibleUniversities =
    universities.filter((uni) => {
      const matchesTier = collegeFilter === "all" || uni.tier === collegeFilter;
      const matchesCountry = countryFilter === "all" || uni.country === countryFilter;
      return matchesTier && matchesCountry;
    });

  document.getElementById("universityList").innerHTML = visibleUniversities
    .map(
      (uni) => `
        <button class="university-card is-${uni.tier.toLowerCase()} ${uni.name === selectedUniversityName ? "is-selected" : ""}" type="button" data-university="${uni.name}">
          <header>
            <div>
              <div class="college-tags">
                <span>${uni.tier}</span>
                <span>${uni.location || uni.country}</span>
              </div>
              <strong>${uni.name}</strong>
              <div class="meta">${uni.program}</div>
            </div>
            <span class="score-badge">${uni.chance}%</span>
          </header>
          <div class="mini-metrics">
            <span>Rank ${uni.rank}</span>
            <span>Acceptance ${uni.acceptance}</span>
            <span>Admission Fit Index ${uni.chance}%</span>
            <span>Scholarship ${uni.scholarship}%</span>
            <span>Capital Return Efficiency ${uni.roi}%</span>
          </div>
          <p>${uni.missing}</p>
        </button>
      `,
    )
    .join("");

  const selectedStillVisible = visibleUniversities.some((uni) => uni.name === selectedUniversityName);
  if (!selectedStillVisible && visibleUniversities.length) {
    selectedUniversityName = visibleUniversities[0].name;
  }

  renderCollegeDetail();

  document.getElementById("scholarshipList").innerHTML = scholarships
    .map(
      (scholarship) => `
        <article class="scholarship-card">
          <header>
            <div>
              <strong>${scholarship.name}</strong>
              <div class="meta">${scholarship.why}</div>
            </div>
            <span class="score-badge">${scholarship.match}%</span>
          </header>
          <div class="bar-track"><div class="bar-fill" style="width: ${scholarship.match}%"></div></div>
        </article>
      `,
    )
    .join("");
}

function renderCollegeDetail() {
  const uni = universities.find((item) => item.name === selectedUniversityName) || universities[0];
  const requirements = getCollegeRequirements(uni);
  const sources = getCollegeSourceLinks(uni);
  const actionPlan = getCollegeActionPlan(uni);
  document.getElementById("collegeDetail").innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">${uni.tier} college</p>
        <h3>${uni.name}</h3>
        <div class="meta">${uni.location || uni.country} · ${uni.program}</div>
      </div>
      <div class="detail-actions">
        <span class="score-badge">${uni.chance}%</span>
        <button class="icon-button drawer-close-button" type="button" data-close-college-roadmap aria-label="Close college roadmap">
          <i data-lucide="x"></i>
        </button>
      </div>
    </div>
    <button class="roadmap-back-button" type="button" data-scroll-colleges>
      Back to college list
    </button>

    <div class="college-summary">
      <p>${uni.about}</p>
      <p><strong>Why it fits you:</strong> ${uni.fit}</p>
    </div>

    <div class="detail-grid college-detail-grid">
      <div class="detail-tile"><span class="metric-label">Rank</span><strong>${uni.rank}</strong></div>
      <div class="detail-tile"><span class="metric-label">Acceptance</span><strong>${uni.acceptance}</strong></div>
      <div class="detail-tile"><span class="metric-label">Scholarship</span><strong>${uni.scholarship}%</strong></div>
      <div class="detail-tile"><span class="metric-label">Capital Return Efficiency</span><strong>${uni.roi}%</strong></div>
    </div>

    <div class="roadmap">
      <h4>Application Roadmap</h4>
      ${roadmapTemplate
        .map(
          (phase) => `
            <article class="roadmap-step">
              <strong>${phase.phase}</strong>
              <ul>${phase.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
            </article>
          `,
        )
        .join("")}
    </div>

    <div class="roadmap">
      <h4>Documents To Prepare</h4>
      <div class="roadmap-checklist">
        ${requirements.map((item) => `<label><input type="checkbox" /> <span>${item}</span></label>`).join("")}
      </div>
    </div>

    <div class="roadmap">
      <h4>Priority Action Plan</h4>
      ${actionPlan
        .map(
          (item, index) => `
            <article class="roadmap-step action-step">
              <strong>${index + 1}. ${item}</strong>
            </article>
          `,
        )
        .join("")}
    </div>

    <div class="college-contact">
      <h4>What To Fix First</h4>
      <p>${uni.missing}</p>
      <p class="rank-source-note"><strong>Rank source:</strong> ${getRankSource(uni.rank)}. Admission Fit Index is calibrated via the proprietary Admissions Probability Index using 2025/2026 historical registries and official programme signals.</p>
      <div class="mini-metrics">
        <span>Who Admissions office</span>
        <span>Who Scholarship office</span>
        <span>Who Faculty or program coordinator</span>
      </div>
    </div>

    <div class="roadmap">
      <h4>Source Links To Verify</h4>
      <div class="source-link-grid">
        ${sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}
      </div>
    </div>
  `;
}

function renderNarrative() {
  document.getElementById("storyTimeline").innerHTML = story
    .map(
      (step, index) => `
        <article class="timeline-step">
          <span>${index + 1}</span>
          <strong>${step.title}</strong>
          <p>${step.detail}</p>
        </article>
      `,
    )
    .join("");

  document.getElementById("sopText").textContent =
    "My academic path began with psychology, but my deeper question has always been how ideas become behavior change. Through research, Mentally Prepare, and applied product thinking, I have started building evidence that mental health support can be more personal, measurable, and accessible. A master's in behavioral science is the next step because it gives structure to the work I am already trying to build.";
}

function renderRadar() {
  const radarScore = clampScore((profile.research + profile.founder + profile.writing) / 3 + 6);
  document.getElementById("opportunityScore").textContent = `${radarScore}%`;

  document.getElementById("opportunityList").innerHTML = opportunities
    .map(
      (item) => `
        <article class="opportunity-card">
          <i>${item.fit}</i>
          <div>
            <strong>${item.title}</strong>
            <div class="meta">${item.tag} match</div>
          </div>
        </article>
      `,
    )
    .join("");

  document.getElementById("skillsGrid").innerHTML = skills
    .map(
      (year) => `
        <article class="skill-year">
          <strong>${year.year}</strong>
          <ul>${year.items.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");

  renderLiveUpdates();
}

function renderLiveUpdates() {
  const updates = liveUpdates.length ? liveUpdates : fallbackLiveUpdates;
  const meta = document.getElementById("liveUpdateMeta");
  if (meta) {
    meta.textContent = liveUpdates.length
      ? `Last checked ${new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
      : "Sample matches until the first automated scan";
  }

  document.getElementById("liveUpdateList").innerHTML = updates
    .map(
      (update) => `
        <article class="live-update-card">
          <header>
            <div>
              <span>${update.type}</span>
              <strong>${update.title}</strong>
            </div>
            <b>${update.match}%</b>
          </header>
          <div class="mini-metrics">
            <span>Deadline ${update.deadline}</span>
            <span>Source ${update.source}</span>
            <span>Your role ${update.role}</span>
            <span>Who ${update.who}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadLiveUpdates() {
  try {
    const response = await fetch("./data/live-updates.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    liveUpdates = Array.isArray(data.updates) ? data.updates : [];
    renderLiveUpdates();
  } catch {
    renderLiveUpdates();
  }
}

function renderAdvisors() {
  document.getElementById("advisorList").innerHTML = advisors
    .map(
      (advisor) => `
        <button class="advisor-card ${advisor.id === selectedAdvisorId ? "is-selected" : ""}" type="button" data-advisor="${advisor.id}">
          <span>${advisor.initial}</span>
          <div>
            <strong>${advisor.name}</strong>
            <div class="meta">${advisor.opener}</div>
          </div>
        </button>
      `,
    )
    .join("");
  renderAdvisorChat();
}

function renderAdvisorChat(extraMessage = "") {
  const advisor = advisors.find((item) => item.id === selectedAdvisorId) || advisors[0];
  document.getElementById("advisorName").textContent = advisor.name;
  const response = extraMessage
    ? `For "${extraMessage}", I would turn it into one concrete proof point this week. The best next action is something visible: a paragraph, dataset, interview note, metric, or application draft.`
    : advisor.opener;

  document.getElementById("chatWindow").innerHTML = `
    <div class="chat-message">
      <small>${advisor.name}</small>
      <p>${response}</p>
    </div>
  `;
}

function renderAll() {
  renderInputs();
  renderTwin();
  renderPaths(document.querySelector(".path-filter button.is-active")?.dataset.filter || "all");
  renderUniversities();
  renderNarrative();
  renderRadar();
  renderAdvisors();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openCollegeRoadmap() {
  document.body.classList.add("college-roadmap-open");
  document.getElementById("collegeDetail").classList.add("is-open");
  document.getElementById("collegeDrawerBackdrop").classList.add("is-open");
  document.getElementById("collegeDetail").scrollTop = 0;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeCollegeRoadmap() {
  document.body.classList.remove("college-roadmap-open");
  document.getElementById("collegeDetail").classList.remove("is-open");
  document.getElementById("collegeDrawerBackdrop").classList.remove("is-open");
}

document.getElementById("mainNav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;

  document.querySelectorAll(".nav-button").forEach((node) => node.classList.remove("is-active"));
  button.classList.add("is-active");

  document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-active"));
  const view = document.getElementById(`view-${button.dataset.view}`);
  view.classList.add("is-active");
  document.getElementById("viewTitle").textContent = view.dataset.title;
});

document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-input]");
  if (!input) return;
  profile[input.dataset.input] = Number(input.value);
  renderInputs();
  renderTwin();
  renderRadar();
});

document.getElementById("resetInputs").addEventListener("click", () => {
  profile = { ...profileDefaults };
  renderTwin();
  renderRadar();
  renderInputs();
});

document.querySelector(".path-filter").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  document.querySelectorAll(".path-filter button").forEach((node) => node.classList.remove("is-active"));
  button.classList.add("is-active");
  renderPaths(button.dataset.filter);
});

document.querySelector(".college-filter").addEventListener("click", (event) => {
  const button = event.target.closest("[data-college-filter]");
  if (!button) return;
  document.querySelectorAll(".college-filter button").forEach((node) => node.classList.remove("is-active"));
  button.classList.add("is-active");
  collegeFilter = button.dataset.collegeFilter;
  renderUniversities();
});

document.querySelector(".college-country-filter").addEventListener("click", (event) => {
  const button = event.target.closest("[data-country-filter]");
  if (!button) return;
  document.querySelectorAll(".college-country-filter button").forEach((node) => node.classList.remove("is-active"));
  button.classList.add("is-active");
  countryFilter = button.dataset.countryFilter;
  renderUniversities();
});

document.getElementById("pathTable").addEventListener("click", (event) => {
  const row = event.target.closest("[data-path]");
  if (!row) return;
  selectedPathId = row.dataset.path;
  renderPaths(document.querySelector(".path-filter button.is-active").dataset.filter);
});

document.getElementById("universityList").addEventListener("click", (event) => {
  const card = event.target.closest("[data-university]");
  if (!card) return;
  selectedUniversityName = card.dataset.university;
  renderUniversities();
  openCollegeRoadmap();
});

document.getElementById("collegeDetail").addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-college-roadmap]");
  if (closeButton) {
    closeCollegeRoadmap();
    return;
  }

  const button = event.target.closest("[data-scroll-colleges]");
  if (!button) return;
  closeCollegeRoadmap();
  document.getElementById("universityList").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("collegeDrawerBackdrop").addEventListener("click", closeCollegeRoadmap);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCollegeRoadmap();
  }
});

document.getElementById("copySop").addEventListener("click", async () => {
  const text = document.getElementById("sopText").textContent;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("copySop").classList.add("is-copied");
  } catch {
    document.getElementById("copySop").title = "Copy unavailable in this browser";
  }
});

document.getElementById("advisorList").addEventListener("click", (event) => {
  const card = event.target.closest("[data-advisor]");
  if (!card) return;
  selectedAdvisorId = card.dataset.advisor;
  renderAdvisors();
});

document.getElementById("chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const value = input.value.trim();
  if (!value) return;
  const existing = document.getElementById("chatWindow").innerHTML;
  renderAdvisorChat(value);
  document.getElementById("chatWindow").innerHTML =
    `${existing}<div class="chat-message is-user"><p>${value}</p></div>` +
    document.getElementById("chatWindow").innerHTML;
  input.value = "";
});

function initDemoHardening() {
  document.querySelectorAll(".design-mood-card").forEach((node) => {
    node.style.display = "none";
  });

  document.querySelectorAll("*").forEach((node) => {
    if (node.textContent?.trim() === "PERSONAL BETA" || node.textContent?.trim() === "Personal Beta") {
      node.innerHTML = 'Enterprise Edition v2.4 <span style="color:#22c55e">●</span> AI Core Active';
      node.classList.add("badge");
    }
  });

  const partnerId = new URLSearchParams(window.location.search).get("partner");
  const partners = {
    zenith: { name: "Zenith Study Abroad", color: "#1e3a8a" },
    karnal: { name: "Karnal IELTS Centre", color: "#047857" },
  };
  const partner = partnerId ? partners[partnerId] : null;
  if (partner) {
    document.documentElement.style.setProperty("--primary", partner.color);
    document.documentElement.style.setProperty("--accent-indigo", partner.color);
    document.documentElement.style.setProperty("--accent-violet", partner.color);
    const brand = document.querySelector(".brand-name");
    if (brand) brand.textContent = `${partner.name} Intelligence Engine`;
  }

  document.querySelectorAll('input[type="range"][id]').forEach((slider) => {
    const saved = localStorage.getItem(`slider_${slider.id}`);
    if (saved !== null) slider.value = saved;
    slider.addEventListener("input", () => localStorage.setItem(`slider_${slider.id}`, slider.value));
  });
}

initDemoHardening();
renderAll();
loadLiveUpdates();
