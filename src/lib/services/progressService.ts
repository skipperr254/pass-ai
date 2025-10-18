import { supabase } from "../supabase";

export async function updateSubjectProgress(
  userId: string,
  subjectId: string
): Promise<void> {
  try {
    // Get subject materials
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select("id, is_analyzed")
      .eq("user_id", userId)
      .eq("subject_id", subjectId);

    if (materialsError) throw materialsError;

    // Get quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions")
      .eq("user_id", userId)
      .eq("subject_id", subjectId);

    if (attemptsError) throw attemptsError;

    // Calculate metrics
    const totalMaterials = materials?.length || 0;
    const analyzedMaterials =
      materials?.filter((m) => m.is_analyzed).length || 0;
    const totalAttempts = attempts?.length || 0;

    let averageScore = 0;
    if (totalAttempts > 0) {
      const totalScore = attempts.reduce((sum, attempt) => {
        return sum + (attempt.score / attempt.total_questions) * 100;
      }, 0);
      averageScore = totalScore / totalAttempts;
    }

    // Calculate progress (weighted)
    let progress = 0;
    if (totalMaterials > 0) {
      const materialsProgress = (analyzedMaterials / totalMaterials) * 50; // 50% weight
      const quizProgress =
        totalAttempts > 0 ? Math.min((totalAttempts / 5) * 50, 50) : 0; // 50% weight, max 5 attempts
      progress = Math.round(materialsProgress + quizProgress);
    }

    // Update progress table
    const { data: existingProgress } = await supabase
      .from("progress")
      .select("id")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .single();

    if (existingProgress) {
      await supabase
        .from("progress")
        .update({
          materials_uploaded: totalMaterials,
          quizzes_taken: totalAttempts,
          average_score: averageScore,
          last_activity: new Date().toISOString(),
        })
        .eq("id", existingProgress.id);
    } else {
      await supabase.from("progress").insert({
        user_id: userId,
        subject_id: subjectId,
        materials_uploaded: totalMaterials,
        quizzes_taken: totalAttempts,
        average_score: averageScore,
      });
    }

    // Update subject progress and pass chance
    const passChance = calculatePassChance(
      progress,
      averageScore,
      totalAttempts
    );

    await supabase
      .from("subjects")
      .update({
        progress,
        pass_chance: passChance,
      })
      .eq("id", subjectId);
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
}

function calculatePassChance(
  progress: number,
  averageScore: number,
  totalAttempts: number
): number {
  // Bayesian-inspired calculation
  let passChance = 0;

  // Base pass chance on progress
  passChance += progress * 0.4; // 40% weight

  // Add score component
  if (totalAttempts > 0) {
    passChance += averageScore * 0.5; // 50% weight
  }

  // Bonus for consistency (multiple attempts)
  if (totalAttempts >= 3) {
    passChance += 10; // 10% bonus
  }

  // Cap at 100%
  return Math.min(Math.round(passChance), 100);
}

export async function getSubjectAnalytics(userId: string, subjectId: string) {
  try {
    // Get quiz attempts with details
    const { data: attempts, error } = await supabase
      .from("quiz_attempts")
      .select("*, quizzes(title, difficulty)")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("completed_at", { ascending: true });

    if (error) throw error;

    // Calculate trends
    const scores = attempts.map((a) => (a.score / a.total_questions) * 100);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const trend = calculateTrend(scores);
    const recentPerformance = scores.slice(-5); // Last 5 attempts

    // Best and worst performance
    const bestScore = Math.max(...scores, 0);
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Difficulty breakdown
    const difficultyStats = {
      easy: attempts.filter((a) => a.quizzes?.difficulty === "easy"),
      medium: attempts.filter((a) => a.quizzes?.difficulty === "medium"),
      hard: attempts.filter((a) => a.quizzes?.difficulty === "hard"),
    };

    return {
      totalAttempts: attempts.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      worstScore: Math.round(worstScore),
      trend,
      recentPerformance,
      attempts,
      difficultyStats,
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    throw error;
  }
}

function calculateTrend(
  scores: number[]
): "improving" | "declining" | "stable" {
  if (scores.length < 3) return "stable";

  const recentScores = scores.slice(-5);
  const olderScores = scores.slice(0, -5);

  if (olderScores.length === 0) return "stable";

  const recentAvg =
    recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

  const difference = recentAvg - olderAvg;

  if (difference > 5) return "improving";
  if (difference < -5) return "declining";
  return "stable";
}

export async function getQuizHistory(userId: string, subjectId?: string) {
  try {
    let query = supabase
      .from("quiz_attempts")
      .select("*, quizzes(title, difficulty), subjects(name)")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error getting quiz history:", error);
    throw error;
  }
}
