import { eq, and, desc } from "drizzle-orm";
import OpenAI from "openai";
import { db } from "../../db/index.js";
import { cvChecks } from "../../db/schema.js";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface ATSAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywords: string[];
  formatting: {
    isClean: boolean;
    issues: string[];
  };
  sections: {
    hasContactInfo: boolean;
    hasSummary: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
  };
}

const ANALYZE_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the CV/resume
text the user provides and return ONLY a JSON object (no markdown fences, no preamble) in exactly
this format:

{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "formatting": {
    "isClean": <boolean>,
    "issues": ["issue1", "issue2", ...]
  },
  "sections": {
    "hasContactInfo": <boolean>,
    "hasSummary": <boolean>,
    "hasExperience": <boolean>,
    "hasEducation": <boolean>,
    "hasSkills": <boolean>
  }
}

Consider these ATS criteria:
1. Standard section headings (Experience, Education, Skills, etc.)
2. Clean formatting without tables, columns, or graphics
3. Relevant keywords for the industry
4. Chronological work history
5. Quantifiable achievements
6. Standard fonts and formatting
7. Contact information at the top
8. No headers/footers that ATS can't read
9. File format compatibility (text extractability)
10. Appropriate length (1-2 pages)

Provide actionable, specific recommendations.`;

async function analyzeCVForATS(cvText: string): Promise<ATSAnalysis> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    max_tokens: 1500,
    messages: [
      { role: "system", content: ANALYZE_SYSTEM_PROMPT },
      { role: "user", content: `CV Content:\n${cvText}` },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI response contained no content");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response");
  }

  return JSON.parse(jsonMatch[0]) as ATSAnalysis;
}

async function generateImprovedCVText(cvText: string, analysis: ATSAnalysis): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    max_tokens: 2500,
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer specializing in ATS optimization. Given a
candidate's existing CV and a diagnostic analysis of its weaknesses, rewrite the CV to be
maximally ATS-friendly while preserving all the candidate's real experience, dates, employers,
and achievements — do not invent new jobs, skills, or credentials.

Apply fixes for:
- Standard, ATS-parseable section headings (Experience, Education, Skills, Summary)
- Plain formatting: no tables, columns, graphics, or unusual characters
- Strong, quantified bullet points (add metrics only where the original implies them; otherwise
  strengthen the action verb rather than fabricating numbers)
- Relevant keywords woven naturally into experience descriptions, not just listed
- Clean chronological structure

Return ONLY the rewritten CV as plain text (no markdown formatting, no commentary, no JSON) —
ready to be copied directly into a document.`,
      },
      {
        role: "user",
        content: `Original CV:\n${cvText}\n\nDiagnostic findings:\nWeaknesses: ${analysis.weaknesses.join("; ")}\nMissing/weak keywords: ${analysis.keywords.join(", ")}\nFormatting issues: ${analysis.formatting.issues.join("; ")}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI response contained no content");
  }

  return content.trim();
}

export async function createCvCheck(userId: number, fileName: string, cvText: string) {
  const analysis = await analyzeCVForATS(cvText);

  const [saved] = await db
    .insert(cvChecks)
    .values({ userId, fileName, cvText, analysis })
    .returning();

  return saved;
}

export async function improveCvCheck(userId: number, cvCheckId: number) {
  const existing = await db.query.cvChecks.findFirst({
    where: and(eq(cvChecks.id, cvCheckId), eq(cvChecks.userId, userId)),
  });

  if (!existing) {
    const err = new Error("CV check not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const improvedCv = await generateImprovedCVText(existing.cvText, existing.analysis as ATSAnalysis);

  const [updated] = await db
    .update(cvChecks)
    .set({ improvedCv })
    .where(eq(cvChecks.id, cvCheckId))
    .returning();

  return updated;
}

export async function listCvChecks(userId: number) {
  return db.query.cvChecks.findMany({
    where: eq(cvChecks.userId, userId),
    orderBy: desc(cvChecks.createdAt),
  });
}