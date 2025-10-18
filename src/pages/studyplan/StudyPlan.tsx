import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DailyTaskCard from "../../components/studyplan/DailyTaskCard";
import StudyPlanProgress from "../../components/studyplan/StudyPlanProgress";
import GenerateStudyPlanDialog from "../../components/studyplan/GenerateStudyPlanDialog";
import SubjectSelector from "../../components/upload/SubjectSelector";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type {
  Progress,
  StudyPlan as StudyPlanType,
  Subject,
} from "../../types";
import { getStudyPlanSummary } from "../../lib/services/studyPlanService";
import { Loader2, Calendar, AlertCircle, Trash2 } from "lucide-react";

export default function StudyPlan() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const { user } = useAuth();

  const fetchStudyPlan = async (subjectId: string) => {
    if (!subjectId) return;

    try {
      setLoading(true);
      setError("");

      // Fetch subject details
      const { data: subject, error: subjectError } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSelectedSubject(subject);

      // Fetch study plan
      const { data: plan, error: planError } = await supabase
        .from("study_plans")
        .select("*")
        .eq("subject_id", subjectId)
        .single();

      if (planError && planError.code !== "PGRST116") {
        throw planError;
      }

      if (plan) {
        setStudyPlan(plan);

        // Fetch progress data
        const { data: progressData } = await supabase
          .from("progress")
          .select("*")
          .eq("subject_id", subjectId)
          .single();

        setProgress(progressData);
      } else {
        setStudyPlan(null);
        setProgress(null);
      }
    } catch (err) {
      console.error("Error fetching study plan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load study plan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      fetchStudyPlan(selectedSubjectId);
    }
  }, [selectedSubjectId, user]);

  const handleToggleTask = async (taskIndex: number) => {
    if (!studyPlan) return;

    try {
      const updatedTasks = [...studyPlan.daily_tasks];
      updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;

      const { error } = await supabase
        .from("study_plans")
        .update({ daily_tasks: updatedTasks })
        .eq("id", studyPlan.id);

      if (error) throw error;

      setStudyPlan({ ...studyPlan, daily_tasks: updatedTasks });
    } catch (err) {
      console.error("Error updating task:", err);
      alert(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeletePlan = async () => {
    if (
      !studyPlan ||
      !confirm("Are you sure you want to delete this study plan?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("study_plans")
        .delete()
        .eq("id", studyPlan.id);

      if (error) throw error;

      setStudyPlan(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete study plan");
    }
  };

  const summary = studyPlan ? getStudyPlanSummary(studyPlan.daily_tasks) : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading study plan...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Study Plan</h1>
            <p className="text-gray-600 mt-1">
              AI-generated personalized study schedule
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
            {selectedSubjectId && selectedSubject && (
              <div className="flex items-center space-x-2">
                {studyPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeletePlan}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Plan
                  </Button>
                )}
                <GenerateStudyPlanDialog
                  subjectId={selectedSubjectId}
                  subjectName={selectedSubject.name}
                  currentTestDate={selectedSubject.test_date || undefined}
                  currentProgress={selectedSubject.progress}
                  averageScore={progress?.average_score || 0}
                  onPlanGenerated={() => fetchStudyPlan(selectedSubjectId)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Study Plan Content */}
        {selectedSubjectId && studyPlan && summary && (
          <>
            {/* Progress Summary */}
            <StudyPlanProgress
              totalDays={summary.totalDays}
              completedDays={summary.completedDays}
              remainingDays={summary.remainingDays}
              totalHours={summary.totalHours}
              completedHours={summary.completedHours}
            />

            {/* Daily Tasks */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Daily Tasks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyPlan.daily_tasks.map((task, index) => (
                  <DailyTaskCard
                    key={index}
                    task={task}
                    onToggleComplete={() => handleToggleTask(index)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {selectedSubjectId && !studyPlan && !loading && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No study plan yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate an AI-powered study plan to help you prepare for your
              test
            </p>
            {selectedSubject && (
              <GenerateStudyPlanDialog
                subjectId={selectedSubjectId}
                subjectName={selectedSubject.name}
                currentTestDate={selectedSubject.test_date || undefined}
                currentProgress={selectedSubject.progress}
                averageScore={progress?.average_score || 0}
                onPlanGenerated={() => fetchStudyPlan(selectedSubjectId)}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
