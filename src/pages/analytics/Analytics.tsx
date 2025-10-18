import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PerformanceChart from "../../components/analytics/PerformanceChart";
import StatCard from "../../components/analytics/StatCard";
import QuizHistoryTable from "../../components/analytics/QuizHistoryTable";
import SubjectSelector from "../../components/upload/SubjectSelector";
import { useAuth } from "../../contexts/AuthContext";
import {
  getSubjectAnalytics,
  getQuizHistory,
} from "../../lib/services/progressService";
import type {
  SubjectAnalytics,
  QuizAttemptWithDetails,
  ChartDataPoint,
  QuizHistoryItem,
} from "../../types";
import {
  Loader2,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { format } from "date-fns";

export default function Analytics() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [analytics, setAnalytics] = useState<SubjectAnalytics | null>(null);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchAnalytics = useCallback(
    async (subjectId: string) => {
      if (!subjectId) return;

      try {
        setLoading(true);
        setError("");

        const [analyticsData, historyData] = await Promise.all([
          getSubjectAnalytics(user!.id, subjectId),
          getQuizHistory(user!.id, subjectId),
        ]);

        setAnalytics(analyticsData);
        setHistory(historyData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (selectedSubjectId) {
      fetchAnalytics(selectedSubjectId);
    }
  }, [selectedSubjectId, user, fetchAnalytics]);

  const getTrendIcon = (trend: string) => {
    if (trend === "improving")
      return { icon: TrendingUp, color: "text-green-600", text: "↗ Improving" };
    if (trend === "declining")
      return { icon: TrendingUp, color: "text-red-600", text: "↘ Declining" };
    return { icon: TrendingUp, color: "text-gray-600", text: "→ Stable" };
  };

  // Prepare chart data
  const chartData: ChartDataPoint[] =
    analytics?.attempts?.map((attempt: QuizAttemptWithDetails) => ({
      date: format(new Date(attempt.completed_at), "MMM dd"),
      score: Math.round((attempt.score / attempt.total_questions) * 100),
    })) || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Progress
          </h1>
          <p className="text-gray-600 mt-1">
            Track your performance and improvement over time
          </p>
        </div>

        {/* Subject Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <SubjectSelector
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={setSelectedSubjectId}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && selectedSubjectId && analytics && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Quizzes"
                value={analytics.totalAttempts}
                icon={BookOpen}
                iconColor="bg-blue-500"
              />
              <StatCard
                title="Average Score"
                value={`${analytics.averageScore}%`}
                icon={Target}
                iconColor="bg-purple-500"
                subtitle={getTrendIcon(analytics.trend).text}
              />
              <StatCard
                title="Best Score"
                value={`${analytics.bestScore}%`}
                icon={Trophy}
                iconColor="bg-green-500"
              />
              <StatCard
                title="Recent Average"
                value={
                  analytics.recentPerformance.length > 0
                    ? `${Math.round(
                        analytics.recentPerformance.reduce(
                          (a: number, b: number) => a + b,
                          0
                        ) / analytics.recentPerformance.length
                      )}%`
                    : "N/A"
                }
                icon={TrendingUp}
                iconColor="bg-orange-500"
                subtitle="Last 5 quizzes"
              />
            </div>

            {/* Performance Chart */}
            <PerformanceChart data={chartData} />

            {/* Difficulty Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Easy Quizzes"
                value={analytics.difficultyStats.easy.length}
                icon={Target}
                iconColor="bg-green-500"
                subtitle={
                  analytics.difficultyStats.easy.length > 0
                    ? `${Math.round(
                        analytics.difficultyStats.easy.reduce(
                          (sum: number, a: QuizAttemptWithDetails) =>
                            sum + (a.score / a.total_questions) * 100,
                          0
                        ) / analytics.difficultyStats.easy.length
                      )}% avg`
                    : "No attempts"
                }
              />
              <StatCard
                title="Medium Quizzes"
                value={analytics.difficultyStats.medium.length}
                icon={Target}
                iconColor="bg-yellow-500"
                subtitle={
                  analytics.difficultyStats.medium.length > 0
                    ? `${Math.round(
                        analytics.difficultyStats.medium.reduce(
                          (sum: number, a: QuizAttemptWithDetails) =>
                            sum + (a.score / a.total_questions) * 100,
                          0
                        ) / analytics.difficultyStats.medium.length
                      )}% avg`
                    : "No attempts"
                }
              />
              <StatCard
                title="Hard Quizzes"
                value={analytics.difficultyStats.hard.length}
                icon={Target}
                iconColor="bg-red-500"
                subtitle={
                  analytics.difficultyStats.hard.length > 0
                    ? `${Math.round(
                        analytics.difficultyStats.hard.reduce(
                          (sum: number, a: QuizAttemptWithDetails) =>
                            sum + (a.score / a.total_questions) * 100,
                          0
                        ) / analytics.difficultyStats.hard.length
                      )}% avg`
                    : "No attempts"
                }
              />
            </div>

            {/* Quiz History */}
            <QuizHistoryTable history={history} />
          </>
        )}

        {/* Empty State */}
        {!loading && selectedSubjectId && analytics?.totalAttempts === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No analytics yet
            </h3>
            <p className="text-gray-600">
              Take some quizzes to see your performance analytics
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
