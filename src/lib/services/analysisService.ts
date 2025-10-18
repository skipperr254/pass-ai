import { Groq } from "groq-sdk";
import type { MaterialAnalysis } from "../../types";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function analyzeStudyMaterial(
  content: string,
  subject: string
): Promise<MaterialAnalysis> {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are an expert educational AI that analyzes study materials and extracts key concepts, main ideas, and important points. Provide structured, actionable insights for students studying ${subject}.`,
        },
        {
          role: "user",
          content: `Analyze this study material and provide a JSON response with the following structure:
                    {
                      "key_concepts": ["concept1", "concept2", ...],
                      "main_ideas": "A concise summary of the main ideas covered",
                      "important_points": ["point1", "point2", ...],
                      "difficulty_level": "beginner|intermediate|advanced",
                      "estimated_study_time": 30
                    }

                    Study Material:
                    ${content.substring(0, 12000)}`, // Limit to avoid token limits
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      key_concepts: result.key_concepts || [],
      main_ideas: result.main_ideas || "",
      important_points: result.important_points || [],
      difficulty_level: result.difficulty_level || "intermediate",
      estimated_study_time: result.estimated_study_time || 30,
    };
  } catch (error) {
    console.error("Error analyzing material:", error);
    throw new Error("Failed to analyze study material");
  }
}

export async function batchAnalyzeMaterials(
  materials: Array<{ id: string; content: string; subjectName: string }>
): Promise<Array<{ id: string; analysis: MaterialAnalysis }>> {
  const results = [];

  for (const material of materials) {
    try {
      const analysis = await analyzeStudyMaterial(
        material.content,
        material.subjectName
      );
      results.push({ id: material.id, analysis });
    } catch (error) {
      console.error(`Failed to analyze material ${material.id}:`, error);
      // Continue with other materials even if one fails
    }
  }

  return results;
}
