import { Groq } from "groq-sdk";
import type { QuizQuestion } from "../../types";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateQuizQuestions(
  content: string,
  subject: string,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number
): Promise<QuizQuestion[]> {
  try {
    const difficultyInstructions = {
      easy: "Focus on basic concepts, definitions, and simple recall questions.",
      medium: "Include application questions and moderate analysis.",
      hard: "Focus on critical thinking, analysis, synthesis, and complex problem-solving.",
    };

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are an expert educational AI that creates high-quality quiz questions. Generate questions that test understanding, not just memorization. ${difficultyInstructions[difficulty]}`,
        },
        {
          role: "user",
          content: `Generate ${questionCount} ${difficulty} multiple-choice questions based on this ${subject} material. 

Material:
${content.substring(0, 10000)}

            Return a JSON object with this exact structure:
            {
            "questions": [
                {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "Explanation of why this is correct",
                "type": "multiple_choice"
                }
            ]
            }

            Requirements:
            - Each question must have exactly 4 options
            - Only one correct answer
            - Provide clear explanations
            - Make distractors (wrong answers) plausible
            - Vary question types (recall, application, analysis)`,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{"questions": []}'
    );

    // Add unique IDs to questions
    const questions: QuizQuestion[] = result.questions.map(
      (q: QuizQuestion, index: number) => ({
        id: `q${Date.now()}_${index}`,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        type: "multiple_choice",
      })
    );

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function generateMixedQuiz(
  content: string,
  subject: string,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number
): Promise<QuizQuestion[]> {
  try {
    const mcCount = Math.ceil(questionCount * 0.7); // 70% multiple choice
    const tfCount = questionCount - mcCount; // 30% true/false

    const response = await groq.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educational AI that creates diverse quiz questions.`,
        },
        {
          role: "user",
          content: `Generate ${mcCount} multiple-choice and ${tfCount} true/false questions (${difficulty} difficulty) for ${subject}.

Material:
${content.substring(0, 10000)}

Return JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["True", "False"] OR ["A", "B", "C", "D"],
      "correct_answer": "True" OR "A",
      "explanation": "Why this is correct",
      "type": "true_false" OR "multiple_choice"
    }
  ]
}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{"questions": []}'
    );

    const questions: QuizQuestion[] = result.questions.map(
      (q: QuizQuestion, index: number) => ({
        id: `q${Date.now()}_${index}`,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        type: q.type || "multiple_choice",
      })
    );

    return questions;
  } catch (error) {
    console.error("Error generating mixed quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}
