import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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

export async function analyzeCVForATS(cvText: string): Promise<ATSAnalysis> {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following CV/resume and provide a detailed ATS-friendliness report.

CV Content:
${cvText}

Provide your analysis in the following JSON format:
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error("AI response contained no content");
  }

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response");
  }

  const analysis = JSON.parse(jsonMatch[0]) as ATSAnalysis;
  return analysis;
}
