import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { documents } from "./schema.js";
import { nowIso } from "../lib/time.js";

const now = nowIso();

const opportunities = [
  {
    title: "Europe Risk - UK Graduate Visa Duration",
    type: "opportunity_source",
    url: "https://www.gov.uk/graduate-visa",
    status: "europe_risk",
    notes:
      "UK risk rule: GOV.UK states Graduate visa lasts 2 years if applying on or before 31 Dec 2026, but 18 months if applying on or after 1 Jan 2027. This reduces the UK ROI window for master's graduates unless sponsorship conversion is realistic.",
  },
  {
    title: "Europe Risk - Netherlands Orientation Year",
    type: "opportunity_source",
    url: "https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year",
    status: "europe_risk",
    notes:
      "Netherlands risk rule: IND orientation year can support job search after graduation, but the real risk is converting to a skilled job/start-up route. Favour programmes with strong employer links, data/UX/product skills and English-friendly labour market outcomes.",
  },
  {
    title: "Europe Risk - Germany Blocked Account",
    type: "opportunity_source",
    url: "https://www.auswaertiges-amt.de/en/sperrkonto-388600",
    status: "europe_risk",
    notes:
      "Germany risk rule: proof of funds/blocked account is mandatory for many students, and the exact amount must be verified with the German mission or Consular Services Portal. Low tuition does not mean low cash requirement.",
  },
  {
    title: "Europe Risk - Ireland Third Level Graduate Programme",
    type: "opportunity_source",
    url: "https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/",
    status: "europe_risk",
    notes:
      "Ireland risk rule: official Third Level Graduate Programme allows eligible non-EEA graduates to remain after study, with 12 months for level 8 and up to 24 months for level 9/10. College selection should include Dublin/Cork employer access and conversion to work permit.",
  },
  {
    title: "USA - Stanford Graduate Student Funding",
    type: "opportunity_source",
    url: "https://financialaid.stanford.edu/grad/aid/index.html",
    status: "usa_funding",
    notes:
      "USA funding rule: Stanford says graduate students should start with their degree programme for fellowships, scholarships, grants, research assistantships and teaching/course assistantships. Track funding at department/programme level, not only central university level.",
  },
  {
    title: "USA Risk - F-1 Optional Practical Training",
    type: "opportunity_source",
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students",
    status: "usa_risk",
    notes:
      "USA risk rule: USCIS defines OPT as temporary employment directly related to the F-1 student's major area of study. For Anushka, the exact programme name and CIP/STEM status matter because generic psychology/product interest may not be enough for work authorization strategy.",
  },
  {
    title: "USA Risk - STEM OPT Extension",
    type: "opportunity_source",
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt",
    status: "usa_risk",
    notes:
      "USA risk rule: USCIS says certain F-1 students with STEM degrees may apply for a 24-month extension of post-completion OPT. This makes STEM-designated HCI, analytics, information science, data science or quantitative programmes much stronger than non-STEM psychology master's routes.",
  },
  {
    title: "USA Risk - F/M Student Visa Process",
    type: "opportunity_source",
    url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    status: "usa_risk",
    notes:
      "USA risk rule: State Department says students first need acceptance by a SEVP-approved school, SEVIS registration, I-901 fee, Form I-20 and visa interview. Funding proof and credible study plan are critical.",
  },
  {
    title: "USA Risk - Expanded Visa Screening",
    type: "opportunity_source",
    url: "https://travel.state.gov/content/travel/en/News/visas-news/announcement-of-expanded-screening-and-vetting-for-h-1b-and-dependent-h-4-visa-applicants.html",
    status: "usa_risk",
    notes:
      "USA risk rule: State Department says visa screening and vetting includes online presence review of F, M and J nonimmigrant applicants. Clean, consistent public profile and application story matter.",
  },
  {
    title: "USA Funding - EducationUSA Graduate Aid",
    type: "opportunity_source",
    url: "https://educationusa.state.gov/your-5-steps-us-study/finance-your-studies/graduate",
    status: "usa_funding",
    notes:
      "USA funding rule: EducationUSA says major university assistance types include fellowships, teaching assistantships, research assistantships and administrative assistantships. For master's applicants, assistantships are not guaranteed and must be verified by programme.",
  },
  {
    title: "USA Funding - EducationUSA Financial Planning",
    type: "opportunity_source",
    url: "https://educationusa.state.gov/your-5-steps-us-study/finance-your-studies",
    status: "usa_funding",
    notes:
      "USA funding rule: EducationUSA says financial planning should start as early as possible and financial aid competition is high. Applications for financial aid often go together with admission applications.",
  },
  {
    title: "USA - Stanford VPGE Graduate Funding",
    type: "opportunity_source",
    url: "https://vpge.stanford.edu/fellowships-funding/graduate-student-funding",
    status: "usa_funding",
    notes:
      "Use Stanford VPGE as the central graduate funding map. Relevant if aiming at research/HCI/product psychology routes where assistantships, fellowships and programme support matter.",
  },
  {
    title: "USA - UC Berkeley Graduate Fellowships",
    type: "opportunity_source",
    url: "https://grad.berkeley.edu/financial/fellowships/",
    status: "usa_funding",
    notes:
      "UC Berkeley graduate funding is fellowship-heavy and department-driven. For international master's routes, verify if the specific school/programme offers fellowships, assistantships or only limited aid.",
  },
  {
    title: "USA - UC Berkeley International Graduate Students",
    type: "opportunity_source",
    url: "https://engineering.berkeley.edu/students/gradstudentservices/international-graduate-students/",
    status: "usa_rule",
    notes:
      "Use as a USA transition/visa/funding support reference for international graduate students. Relevant if Berkeley HCI/information route stays in shortlist.",
  },
  {
    title: "USA - Harvard Griffin GSAS Financial Aid",
    type: "opportunity_source",
    url: "https://gsas.harvard.edu/financial-support",
    status: "usa_funding",
    notes:
      "Harvard graduate funding differs by school and degree. Research degrees and PhD routes are more likely to have structured funding than many terminal master's routes. Verify the exact school and programme.",
  },
  {
    title: "USA - Carnegie Mellon Graduate Financial Aid",
    type: "opportunity_source",
    url: "https://www.cmu.edu/sfs/financial-aid/graduate/index.html",
    status: "usa_funding",
    notes:
      "CMU master's funding can be limited and programme-specific. For MHCI/product/HCI routes, verify departmental scholarships, assistantships, employer sponsorship and total ROI carefully.",
  },
  {
    title: "Asia - NTU Graduate College Scholarships",
    type: "opportunity_source",
    url: "https://www.ntu.edu.sg/graduate-college/admissions/scholarships",
    status: "asia_funding",
    notes:
      "NTU lists graduate scholarships including Nanyang President's Graduate Scholarship and NTU Research Scholarship. Stronger fit for research degrees than ordinary coursework routes.",
  },
  {
    title: "Asia - NTU School of Social Sciences Graduate Research",
    type: "opportunity_source",
    url: "https://www.ntu.edu.sg/sss/graduate-education/graduate-research",
    status: "asia_rule",
    notes:
      "NTU Social Sciences offers research degrees in Psychology, Public Policy, Economics and Sociology. Good Asia route if you position psychology + digital behaviour + research strongly.",
  },
  {
    title: "Asia - HKU Postgraduate Scholarships",
    type: "opportunity_source",
    url: "https://gradsch.hku.hk/prospective_students/fees_scholarships_and_financial_support/postgraduate_scholarships",
    status: "asia_funding",
    notes:
      "HKU postgraduate scholarships are strongest for research postgraduate degrees. Taught master's funding is often more limited; verify programme-specific awards.",
  },
  {
    title: "Asia - CUHK Postgraduate Scholarships for International Students",
    type: "opportunity_source",
    url: "https://www.cuhk.edu.hk/english/admissions/postgraduate-scholarship-for-international-students.html",
    status: "asia_funding",
    notes:
      "CUHK scholarship search should distinguish university-level, departmental and external awards. Add target department pages separately when a programme is shortlisted.",
  },
  {
    title: "Asia - CUHK Sociology MA Admission Scholarships",
    type: "opportunity_source",
    url: "https://www.soc.cuhk.edu.hk/postgraduate/ma-programme/awards-and-scholarships/",
    status: "asia_funding",
    notes:
      "Example of departmental Hong Kong funding. Up to eight awards are listed, including spots for international universities. Useful as a model for searching department-level scholarships.",
  },
  {
    title: "Asia - NUS Graduate Scholarships",
    type: "opportunity_source",
    url: "https://nus.edu.sg/registrar/prospective-students/graduate/graduate-scholarships",
    status: "asia_funding",
    notes:
      "NUS funding is often tied to research degrees, graduate assistantships or specific schools. Verify exact social science/psychology route and whether award applies to international students.",
  },
  {
    title: "Asia - Peking University Yenching Academy",
    type: "opportunity_source",
    url: "https://yenchingacademy.pku.edu.cn/",
    status: "asia_funding",
    notes:
      "Fully funded interdisciplinary China route. Not psychology-specific, but can fit if your story becomes digital wellbeing, youth mental health, society and behaviour in Asia.",
  },
  {
    title: "Asia - Schwarzman Scholars",
    type: "opportunity_source",
    url: "https://www.schwarzmanscholars.org/",
    status: "asia_funding",
    notes:
      "Leadership-heavy China scholarship at Tsinghua. Good only if Mentally Prepare develops strong leadership, impact and global/public-interest framing.",
  },
  {
    title: "Europe - Aalto IDBM Programme",
    type: "opportunity_source",
    url: "https://www.aalto.fi/en/programmes/masters-programme-in-international-design-business-management",
    status: "europe_programme",
    notes:
      "Aalto IDBM is a product/design/business bridge. Strong fit for psychology + product + consumer behaviour if you build a portfolio around Mentally Prepare, UX research and behavioural design.",
  },
  {
    title: "Europe - Aalto Scholarships",
    type: "opportunity_source",
    url: "https://www.aalto.fi/en/admission-services/scholarships-and-tuition-fees",
    status: "europe_funding",
    notes:
      "Aalto scholarship rules change by intake and fee status. Track tuition-waiver style awards and exact application timing alongside the IDBM application.",
  },
  {
    title: "Europe - KU Leuven Psychology Theory and Research",
    type: "opportunity_source",
    url: "https://ppw.kuleuven.be/en/student-portal/programmes/master-of-psychology-theory-and-research/application-and-admission",
    status: "europe_programme",
    notes:
      "KU Leuven states the programme welcomes students aiming for research careers in psychological, social or behavioural sciences. Strong fit if your research paper and methods profile are polished.",
  },
  {
    title: "Europe - KU Leuven Master Mind Scholarships",
    type: "opportunity_source",
    url: "https://www.kuleuven.be/english/admissions/scholarships/mastermind",
    status: "europe_funding",
    notes:
      "Flanders Master Mind Scholarships are highly competitive and require strong academic record and official language/test documentation. Track early because nomination/application rules can be strict.",
  },
  {
    title: "Europe - University of Vienna Psychology Master",
    type: "opportunity_source",
    url: "https://studieren.univie.ac.at/en/degree-programmes/master-programmes/psychology-master/",
    status: "europe_programme",
    notes:
      "Vienna psychology master's includes statistics, research methods, work/organisational psychology, social/economic psychology, cognitive psychology and health psychology. High academic fit, but check language and admissions constraints.",
  },
  {
    title: "Europe - Ghent University Scholarships",
    type: "opportunity_source",
    url: "https://www.ugent.be/prospect/en/administration/application/scholarships",
    status: "europe_funding",
    notes:
      "Ghent funding should be checked as a university-level scholarship page plus faculty/programme-level sources. Useful Belgium high-ROI option if programme fit works.",
  },
  {
    title: "LSE MSc Behavioural Science Programme",
    type: "opportunity_source",
    url: "https://www.lse.ac.uk/study-at-lse/graduate/msc-behavioural-science",
    status: "college_funding",
    notes:
      "Deep target. LSE states funding applications need an offer plus Graduate Financial Support application before the funding deadline. Also mentions LSE Behavioural Lab links, useful for research-fit positioning.",
  },
  {
    title: "King's College London Postgraduate Funding",
    type: "opportunity_source",
    url: "https://www.kcl.ac.uk/study/postgraduate-taught/fees-and-funding",
    status: "college_funding",
    notes:
      "Use King's funding database after shortlisting KCL programmes. This is not one scholarship; it is a database source to search by level, subject, and student status.",
  },
  {
    title: "University of Edinburgh Postgraduate Scholarships",
    type: "opportunity_source",
    url: "https://www.ed.ac.uk/studying/postgraduate/fees-finance/funding-your-studies/scholarships",
    status: "college_funding",
    notes:
      "Edinburgh says you often need to apply to the programme before scholarship applications, so track admission and scholarship deadlines together.",
  },
  {
    title: "University of Amsterdam Psychology Merit Scholarship",
    type: "opportunity_source",
    url: "https://www.uva.nl/en/about-the-uva/organisation/faculties/faculty-of-social-and-behavioural-sciences/education/psychology/amsterdam-merit-scholarship-ams.html",
    status: "college_funding",
    notes:
      "High relevance for Research Master's Psychology. UvA notes very limited awards: one Master's track student and one Research Master's Psychology student per year.",
  },
  {
    title: "Tilburg Economic Psychology Admission",
    type: "opportunity_source",
    url: "https://www.tilburguniversity.edu/education/masters-programs/economic-psychology/application",
    status: "college_rule",
    notes:
      "Important Europe rule. Tilburg warns that if a scholarship requires conditional admission, it can take at least six weeks to receive the admission letter. Apply early enough for scholarship timing.",
  },
  {
    title: "Tilburg Master's Scholarships",
    type: "opportunity_source",
    url: "https://www.tilburguniversity.edu/education/masters-programs/tuition-fees-scholarships",
    status: "college_funding",
    notes:
      "Use for Netherlands high-ROI route. Check programme-specific scholarships and tuition waivers; do not assume every scholarship applies to Economic Psychology.",
  },
  {
    title: "Erasmus University Rotterdam Scholarships",
    type: "opportunity_source",
    url: "https://www.eur.nl/en/education/practical-matters/scholarships-grants",
    status: "college_funding",
    notes:
      "Erasmus says scholarship searching demands dedication. Use as the master database for EUR and then add programme-specific awards separately.",
  },
  {
    title: "Lund University Scholarships",
    type: "opportunity_source",
    url: "https://www.lunduniversity.lu.se/study/admission-degree-studies/scholarships-and-awards",
    status: "college_funding",
    notes:
      "Track Lund Global Scholarship and Swedish Institute routes. Lund can be high ROI if programme fit and country scholarship eligibility align.",
  },
  {
    title: "Lund MSc Psychology Programme",
    type: "opportunity_source",
    url: "https://www.lunduniversity.lu.se/lubas/i-uoh-lu-SAMPS/18445",
    status: "college_rule",
    notes:
      "Psychology master's source. Lund programme page points to Swedish Institute scholarships and home-country scholarship agreements.",
  },
  {
    title: "DAAD Scholarship Database",
    type: "opportunity_source",
    url: "https://www.daad.de/en/studying-in-germany/scholarships/",
    status: "scholarship_database",
    notes:
      "Germany scholarship source. Search by country, level, and subject. Strong if you can explain why Germany and build statistics/research profile.",
  },
  {
    title: "Erasmus Mundus Joint Masters Catalogue",
    type: "opportunity_source",
    url: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
    status: "scholarship_database",
    notes:
      "Do not track Erasmus Mundus as one application. Identify specific EMJM programmes related to digital society, psychology, HCI, public policy, behavioural science, or consumer research.",
  },
  {
    title: "Microsoft University Internships",
    type: "opportunity_source",
    url: "https://careers.microsoft.com/v2/global/en/universityinternship",
    status: "internship_source",
    notes:
      "Microsoft says internships can include Product Management, Product Design, UX Research, Data & Applied Science, Microsoft Research and more. Best target categories: UX Research, PM, Product Design research, Data/Applied Science with human behaviour angle.",
  },
  {
    title: "Microsoft PhD/Research Internships",
    type: "opportunity_source",
    url: "https://careers.microsoft.com/v2/global/en/phdinternship",
    status: "internship_source",
    notes:
      "Longer-term source if you later pursue research master's/PhD path. Useful now as a signal of what research labs value: methods, publications, computational skills, and HCI/AI-human behaviour fit.",
  },
  {
    title: "Kantar Careers",
    type: "opportunity_source",
    url: "https://www.kantar.com/careers",
    status: "internship_source",
    notes:
      "Consumer insights and market research path. Relevant internship types: research executive intern, consumer insights, brand strategy, survey research, qualitative research, social analytics.",
  },
  {
    title: "Kantar Research and Project Management",
    type: "opportunity_source",
    url: "https://upg-cd-ne.kantar.com/north-america/Careers/Experienced-hires/Research-and-project-management",
    status: "internship_source",
    notes:
      "Kantar describes research/analysis roles that help clients understand consumers better, including consumer and shopper behaviour. Use this to shape a consumer insights internship search.",
  },
  {
    title: "Behavioural Insights Team",
    type: "opportunity_source",
    url: "https://www.bi.team/",
    status: "internship_source",
    notes:
      "Behavioural science consulting benchmark. Track jobs, internships, newsletters, and project reports. Build experience in experiment design, policy/product behaviour change, and evaluation.",
  },
  {
    title: "ICF Customer Insights and Behavioral Science Internship Example",
    type: "opportunity_source",
    url: "https://careers.tufts.edu/jobs/icf-2026-summer-intern-customer-insights-and-behavioral-science-remote/",
    status: "internship_example",
    notes:
      "Example role showing the exact overlap you need: qualitative, quantitative, behavioural science research, consumer behaviour, and communication. Use as a template for keywords.",
  },
];

for (const opportunity of opportunities) {
  const existing = db.select().from(documents).where(eq(documents.title, opportunity.title)).get();
  const values = { ...opportunity, createdAt: existing?.createdAt ?? now, updatedAt: now };
  if (existing) {
    db.update(documents).set(values).where(eq(documents.title, opportunity.title)).run();
  } else {
    db.insert(documents).values(values).run();
  }
}

console.log("Repaired deeper college, scholarship, and internship opportunity sources.");
