import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import QuizQuestion from "../../components/quiz/QuizQuestion";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type {
  Quiz,
  QuizAnswer,
  QuizQuestion as QuizQustionType,
} from "../../types";
import { Loader2, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { updateSubjectProgress } from "../../lib/services/progressService";

export default function TakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        if (error) throw error;
        setQuiz(data);

        // Initialize answers array
        const initialAnswers: QuizAnswer[] = data.questions.map(
          (q: QuizQustionType) => ({
            question_id: q.id,
            selected_answer: "",
            is_correct: false,
          })
        );
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        alert("Failed to load quiz");
        navigate("/quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  const handleAnswerSelect = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].selected_answer = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      !confirm(
        "Are you sure you want to submit? You cannot change answers after submission."
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      // Calculate score
      const gradedAnswers = answers.map((answer) => {
        const question = quiz!.questions.find(
          (q) => q.id === answer.question_id
        );
        return {
          ...answer,
          is_correct: answer.selected_answer === question?.correct_answer,
        };
      });

      const score = gradedAnswers.filter((a) => a.is_correct).length;
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      // Save attempt to database
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user!.id,
        quiz_id: quiz!.id,
        subject_id: quiz!.subject_id,
        score,
        total_questions: quiz!.questions.length,
        answers: gradedAnswers,
        time_taken: timeTaken,
      });

      if (error) throw error;

      // Update subject progress (NEW)
      await updateSubjectProgress(user!.id, quiz!.subject_id);

      setAnswers(gradedAnswers);
      setShowResults(true);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    const resetAnswers: QuizAnswer[] = quiz!.questions.map((q) => ({
      question_id: q.id,
      selected_answer: "",
      is_correct: false,
    }));
    setAnswers(resetAnswers);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-gray-600">Quiz not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = answers.filter((a) => a.selected_answer !== "").length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  if (showResults) {
    const score = answers.filter((a) => a.is_correct).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Results Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">
                      {percentage}%
                    </p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {percentage >= 80
                    ? "Excellent Work! 🎉"
                    : percentage >= 60
                    ? "Good Job! 👍"
                    : "Keep Practicing! 💪"}
                </h3>
                <p className="text-gray-600">
                  You got {score} out of {quiz.questions.length} questions
                  correct
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-3">
                <Button variant="outline" onClick={() => navigate("/quizzes")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
                <Button
                  onClick={handleRetake}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Review Answers
            </h3>
            {quiz.questions.map((question, index) => (
              <QuizQuestion
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={quiz.questions.length}
                selectedAnswer={answers[index].selected_answer}
                onAnswerSelect={() => {}}
                showResult={true}
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600 mt-1">
            Answer all questions and submit when ready
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Progress: {answeredCount} of {quiz.questions.length} answered
                </span>
                <span className="font-medium text-gray-900">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} />
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          selectedAnswer={answers[currentQuestionIndex].selected_answer}
          onAnswerSelect={handleAnswerSelect}
        />

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-blue-600 text-white"
                        : answers[index].selected_answer
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    answeredCount !== quiz.questions.length || submitting
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warning if not all answered */}
        {answeredCount !== quiz.questions.length && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              You have {quiz.questions.length - answeredCount} unanswered
              question(s). Please answer all questions before submitting.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
