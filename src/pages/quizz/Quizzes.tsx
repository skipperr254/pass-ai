import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import QuizCard from "../../components/quiz/QuizCard";
import GenerateQuizDialog from "../../components/quiz/GenerateQuizDialog";
import SubjectSelector from "../../components/upload/SubjectSelector";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type { Quiz, Subject } from "../../types";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (selectedSubjectId) {
        query = query.eq("subject_id", selectedSubjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId, user]);

  const fetchMaterialIds = useCallback(
    async (subjectId: string) => {
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("id")
          .eq("user_id", user!.id)
          .eq("subject_id", subjectId)
          .eq("is_analyzed", true);

        if (error) throw error;
        setMaterialIds(data?.map((m) => m.id) || []);
      } catch (err) {
        console.error("Error fetching material IDs:", err);
        setMaterialIds([]);
      }
    },
    [user]
  );

  const fetchSubject = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) throw error;
      setSelectedSubject(data);
    } catch (err) {
      console.error("Error fetching subject:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    if (selectedSubjectId) {
      fetchMaterialIds(selectedSubjectId);
      fetchSubject(selectedSubjectId);
    }
  }, [user, selectedSubjectId, fetchMaterialIds, fetchQuizzes]);

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;
      fetchQuizzes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-1">
              Generate and take quizzes from your study materials
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Subject Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <SubjectSelector
                selectedSubjectId={selectedSubjectId}
                onSubjectChange={setSelectedSubjectId}
              />
            </div>
            {selectedSubjectId && materialIds.length > 0 && selectedSubject && (
              <GenerateQuizDialog
                subjectId={selectedSubjectId}
                subjectName={selectedSubject.name}
                materialIds={materialIds}
                onQuizGenerated={fetchQuizzes}
              />
            )}
          </div>
          {selectedSubjectId && materialIds.length === 0 && (
            <p className="text-sm text-yellow-600 mt-2">
              No analyzed materials found. Please upload and analyze materials
              first.
            </p>
          )}
        </div>

        {/* Empty State */}
        {quizzes.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No quizzes yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select a subject and generate your first quiz from analyzed
              materials
            </p>
          </div>
        )}

        {/* Quizzes Grid */}
        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={handleStartQuiz}
                onDelete={handleDeleteQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
