import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BookOpen, Calendar, Target, Trash2, Play } from "lucide-react";
import type { Quiz } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  onDelete: (quizId: string) => void;
}

export default function QuizCard({ quiz, onStart, onDelete }: QuizCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{quiz.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(quiz.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>{quiz.questions.length} questions</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onStart(quiz.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Quiz
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(quiz.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
