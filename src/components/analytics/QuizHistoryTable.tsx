import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { QuizHistoryItem } from "../../types";

interface QuizHistoryTableProps {
  history: QuizHistoryItem[];
}

export default function QuizHistoryTable({ history }: QuizHistoryTableProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No quiz history available
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((attempt) => {
              const percentage = Math.round(
                (attempt.score / attempt.total_questions) * 100
              );
              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {attempt.quizzes.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {attempt.subjects.name}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(attempt.completed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <Badge
                      className={getDifficultyColor(attempt.quizzes.difficulty)}
                    >
                      {attempt.quizzes.difficulty}
                    </Badge>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${getScoreColor(
                          percentage
                        )}`}
                      >
                        {percentage}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {attempt.score}/{attempt.total_questions}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatTime(attempt.time_taken)}
                      </p>
                      <p className="text-xs text-gray-500">Time</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
