import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export interface GenerationOutput {
  resumeBullets: string[];
  coverLetter: string;
  keySkills: string[];
  matchScore: number; // 0-100
}

const SYSTEM_PROMPT = `You are a job application assistant. Given a job description, return ONLY a JSON object
(no markdown fences, no preamble) with this exact shape:

{
  "resumeBullets": string[],   // 4-6 ATS-friendly resume bullets, action-verb led, quantified where plausible
  "coverLetter": string,       // a concise 3-paragraph tailored cover letter, no placeholders like [Company Name] left unfilled if inferable, otherwise use sensible generic phrasing
  "keySkills": string[],       // 6-10 skills/keywords from the posting the candidate should emphasize
  "matchScore": number         // 0-100 estimate of how well a strong generalist candidate's resume could be tailored to match this posting's stated requirements
}`;

export async function generateApplicationAssets(jobText: string): Promise<GenerationOutput> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    max_tokens: 1500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: jobText },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI response contained no content");
  }

  const cleaned = content.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as GenerationOutput;
  } catch {
    const err = new Error("Failed to parse AI-generated output") as Error & { status?: number };
    err.status = 502;
    throw err;
  }
}