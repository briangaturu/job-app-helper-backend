import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const err = new Error("Failed to parse AI-generated output") as Error & { status?: number };
    err.status = 502;
    throw err;
  }
}

export async function generateInterviewQuestions(jobText: string): Promise<string[]> {
  const prompt = `Given a job description, return ONLY a JSON array (no markdown fences, no preamble)
of 6 likely interview questions a candidate for this role should prepare for. Mix behavioral
and role-specific technical questions. Example shape: ["question 1", "question 2", ...]

Job Description:
${jobText}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error("AI response contained no content");
  }

  return extractJson<string[]>(content);
}

export async function scoreInterviewAnswer(question: string, answer: string): Promise<string> {
  const prompt = `You are an interview coach. Given a question and a candidate's practice answer, give
concise, constructive feedback (3-5 sentences): what worked, what to sharpen, and one concrete
suggestion for a stronger answer (e.g. using the STAR method if it's a behavioral question).
Be direct and specific, not generic encouragement. Return plain text, no JSON, no markdown.

Question: ${question}

Answer: ${answer}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error("AI response contained no content");
  }

  return content.trim();
}