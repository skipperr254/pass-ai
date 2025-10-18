import { Groq } from "groq-sdk";
import type { DailyTask, MaterialAnalysis } from "../../types";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateStudyPlan(
  subjectName: string,
  testDate: string,
  materials: Array<{ file_name: string; analysis: MaterialAnalysis }>,
  currentProgress: number,
  averageScore: number
): Promise<{ daily_tasks: DailyTask[]; total_study_time: number }> {
  try {
    const daysUntilTest = Math.ceil(
      (new Date(testDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysUntilTest <= 0) {
      throw new Error("Test date must be in the future");
    }

    // Prepare materials summary
    const materialsSummary = materials
      .map((m, i) => {
        const concepts =
          m.analysis?.key_concepts?.slice(0, 3).join(", ") || "No concepts";
        return `${i + 1}. ${m.file_name}: ${concepts}`;
      })
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are an expert educational planner that creates personalized study schedules. Consider the student's current progress, time available, and learning objectives.`,
        },
        {
          role: "user",
          content: `Create a ${daysUntilTest}-day study plan for ${subjectName}.

            Test Date: ${testDate}
            Current Progress: ${currentProgress}%
            Average Quiz Score: ${averageScore}%
            Days Until Test: ${daysUntilTest}

            Materials to cover:
            ${materialsSummary}

            Return JSON with this structure:
            {
              "daily_tasks": [
                {
                  "date": "YYYY-MM-DD",
                  "tasks": ["Task 1", "Task 2", "Task 3"],
                  "duration": 60,
                  "completed": false
                }
              ]
            }

            Requirements:
            - Create tasks for each day until test date
            - Distribute topics evenly
            - Include review days before the test
            - Recommend 30-90 minutes per day
            - Start with easier topics, progress to harder ones
            - Include practice quiz recommendations
            - Add final review day before test`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{"daily_tasks": []}'
    );

    // Calculate total study time
    const totalStudyTime = result.daily_tasks.reduce(
      (sum: number, task: DailyTask) => sum + task.duration,
      0
    );

    return {
      daily_tasks: result.daily_tasks,
      total_study_time: totalStudyTime,
    };
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
}

export function getStudyPlanSummary(dailyTasks: DailyTask[]): {
  totalDays: number;
  completedDays: number;
  remainingDays: number;
  totalHours: number;
  completedHours: number;
} {
  const totalDays = dailyTasks.length;
  const completedDays = dailyTasks.filter((t) => t.completed).length;
  const remainingDays = totalDays - completedDays;

  const totalMinutes = dailyTasks.reduce((sum, task) => sum + task.duration, 0);
  const completedMinutes = dailyTasks
    .filter((t) => t.completed)
    .reduce((sum, task) => sum + task.duration, 0);

  return {
    totalDays,
    completedDays,
    remainingDays,
    totalHours: Math.round(totalMinutes / 60),
    completedHours: Math.round(completedMinutes / 60),
  };
}
