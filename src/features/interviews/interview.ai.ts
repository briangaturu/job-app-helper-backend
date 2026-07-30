import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

export async function generateInterviewQuestions(jobText: string, count = 6): Promise<string[]> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `Given a job description, return ONLY a JSON array (no markdown fences, no preamble)
of ${count} likely interview questions a candidate for this role should prepare for. Mix behavioral
and role-specific technical questions. Example shape: ["question 1", "question 2", ...]`,
      },
      { role: "user", content: jobText },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI response contained no content");
  }

  return extractJson<string[]>(content);
}

export async function scoreInterviewAnswer(question: string, userAnswer: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are an interview coach. Given a question and a candidate's practice answer, give
concise, constructive feedback (3-5 sentences): what worked, what to sharpen, and one concrete
suggestion for a stronger answer (e.g. using the STAR method if it's a behavioral question).
Be direct and specific, not generic encouragement. Return plain text, no JSON, no markdown.`,
      },
      { role: "user", content: `Question: ${question}\n\nAnswer: ${userAnswer}` },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI response contained no content");
  }

  return content.trim();
}