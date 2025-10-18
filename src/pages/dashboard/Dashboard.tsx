import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SubjectCard from "@/components/dashboard/SubjectCard";
import CreateSubjectDialog from "../../components/dashboard/CreateSubjectDialog";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type { Subject } from "../../types";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  //   const navigate = useNavigate();

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubjects();
  }, [user, fetchSubjects]);

  const handleSubjectClick = (subjectId: string) => {
    // For now, just log. We'll add subject detail page later
    console.log("Subject clicked:", subjectId);
    // navigate(`/subject/${subjectId}`);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subject? All associated materials and quizzes will be deleted."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectId);

      if (error) throw error;

      // Refresh subjects list
      fetchSubjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your subjects...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
            <p className="text-gray-600 mt-1">
              Manage your study subjects and track your progress
            </p>
          </div>
          <CreateSubjectDialog onSubjectCreated={fetchSubjects} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {subjects.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No subjects yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first subject. Add study materials,
              generate quizzes, and track your progress!
            </p>
            <CreateSubjectDialog onSubjectCreated={fetchSubjects} />
          </div>
        )}

        {/* Subjects Grid */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={() => handleSubjectClick(subject.id)}
                onDelete={handleDeleteSubject}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {subjects.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(
                      subjects.reduce((acc, s) => acc + s.progress, 0) /
                        subjects.length
                    )}
                    %
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Tests</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {subjects.filter((s) => s.test_date).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
