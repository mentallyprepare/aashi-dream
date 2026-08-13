import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { documents } from "./schema.js";
import { nowIso } from "../lib/time.js";

const now = nowIso();

const sources = [
  {
    title: "LSE Graduate Funding Application Overview",
    type: "official_source",
    url: "https://www.lse.ac.uk/study-at-lse/Graduate/fees-and-funding/pgt-application-overview",
    status: "verified",
    notes:
      "LSE graduate funding rule: submit LSE admission application first, then use GAP to complete Graduate Financial Support Application. Unless a scholarship page says otherwise, this single form considers GSS and other eligible LSE scholarships. For 2026/27 entry, deadline was 23 Apr 2026 and applicants needed both an offer and submitted funding application by that deadline.",
  },
  {
    title: "LSE Graduate How To Apply",
    type: "official_source",
    url: "https://www.lse.ac.uk/study-at-lse/graduate/prospective-students/how-to-apply",
    status: "verified",
    notes:
      "LSE application rule: apply early; application is not considered until all supporting documents and both references are received. LSE expects applicants to complete materials without paid agents or paid professional assistance. You nominate two referees and can choose up to two programmes, with separate academic statements for each.",
  },
  {
    title: "LSE Graduate When To Apply",
    type: "official_source",
    url: "https://www.lse.ac.uk/study-at-lse/Graduate/Prospective-students/How-to-Apply/When-to-apply",
    status: "verified",
    notes:
      "LSE timing rule: applications for 2026/27 opened 8 Oct 2025. Decisions are mostly rolling, programmes close when full, and early applications have better chances for admission, funding, and visa timing. Taught master's decisions average around 8 weeks after complete application.",
  },
  {
    title: "LSE Graduate Admissions Process",
    type: "official_source",
    url: "https://www.lse.ac.uk/study-at-lse/Graduate/Applicants/The-admissions-process",
    status: "verified",
    notes:
      "LSE completeness rule: programme selectors will not consider incomplete applications. An application is complete only when required documents are submitted and both references are received. LSE advises applying at least six months before the start term and paying attention to funding deadlines.",
  },
  {
    title: "LSE Graduate Entry Requirements",
    type: "official_source",
    url: "https://www.lse.ac.uk/study-at-lse/Graduate/Prospective-students/Entry-requirements",
    status: "verified",
    notes:
      "LSE academic rule: minimum requirements include previous degree and English proficiency, but competition is intense and meeting minimum requirements does not guarantee admission. For degrees outside the UK, LSE states at least 70 percent of available marks in final year examinations is needed.",
  },
  {
    title: "UCAS Applying Overview",
    type: "official_source",
    url: "https://www.ucas.com/applying",
    status: "reference",
    notes:
      "UCAS is most relevant for UK undergraduate-style process research and general application literacy. It groups application work into before applying, applying to university, after applying, dates/deadlines, personal statement, references, fees/funding, and international student topics.",
  },
  {
    title: "UCAS Postgraduate International Students",
    type: "official_source",
    url: "https://www.ucas.com/postgraduate/international-students",
    status: "reference",
    notes:
      "UCAS postgraduate international guidance is useful for UK planning context: course choice, entry requirements, visa awareness, costs, accommodation, and immigration basics. For LSE graduate applications, LSE's own portal rules override generic UCAS guidance.",
  },
  {
    title: "UK Student Visa",
    type: "official_source",
    url: "https://www.gov.uk/student-visa",
    status: "verified",
    notes:
      "UK student visa rule: application fee and immigration health surcharge apply; arrival timing depends on course length. GOV.UK also states Graduate visa post-study duration changes: 2 years if applying on or before 31 Dec 2026, 18 months if applying on or after 1 Jan 2027, and 3 years for PhD/doctoral qualifications.",
  },
  {
    title: "British Council GREAT Scholarships India",
    type: "official_source",
    url: "https://www.britishcouncil.in/study-uk/scholarships/great-scholarships",
    status: "verified",
    notes:
      "GREAT rule: deadlines and eligibility vary by participating UK university. Track GREAT at the university level, not as one generic scholarship.",
  },
];

for (const source of sources) {
  const existing = db.select().from(documents).where(eq(documents.title, source.title)).get();
  const values = { ...source, createdAt: existing?.createdAt ?? now, updatedAt: now };
  if (existing) {
    db.update(documents).set(values).where(eq(documents.title, source.title)).run();
  } else {
    db.insert(documents).values(values).run();
  }
}

console.log("Repaired official admissions and funding source references.");
