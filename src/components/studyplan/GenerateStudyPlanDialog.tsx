import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { generateStudyPlan } from "../../lib/services/studyPlanService";

interface GenerateStudyPlanDialogProps {
  subjectId: string;
  subjectName: string;
  currentTestDate?: string;
  currentProgress: number;
  averageScore: number;
  onPlanGenerated: () => void;
}

export default function GenerateStudyPlanDialog({
  subjectId,
  subjectName,
  currentTestDate,
  currentProgress,
  averageScore,
  onPlanGenerated,
}: GenerateStudyPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [testDate, setTestDate] = useState(currentTestDate || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleGenerate = async () => {
    setError("");

    if (!testDate) {
      setError("Please select a test date");
      return;
    }

    const selectedDate = new Date(testDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      setError("Test date must be in the future");
      return;
    }

    setLoading(true);

    try {
      // Fetch analyzed materials
      const { data: materials, error: materialsError } = await supabase
        .from("materials")
        .select("file_name, analysis")
        .eq("subject_id", subjectId)
        .eq("is_analyzed", true);

      if (materialsError) throw materialsError;

      if (!materials || materials.length === 0) {
        throw new Error(
          "No analyzed materials found. Please analyze materials first."
        );
      }

      // Generate study plan
      const plan = await generateStudyPlan(
        subjectName,
        testDate,
        materials,
        currentProgress,
        averageScore
      );

      // Delete existing study plan if any
      await supabase.from("study_plans").delete().eq("subject_id", subjectId);

      // Save new study plan
      const { error: insertError } = await supabase.from("study_plans").insert({
        user_id: user!.id,
        subject_id: subjectId,
        test_date: testDate,
        daily_tasks: plan.daily_tasks,
        total_study_time: plan.total_study_time,
      });

      if (insertError) throw insertError;

      // Update subject test date
      await supabase
        .from("subjects")
        .update({ test_date: testDate })
        .eq("id", subjectId);

      setOpen(false);
      onPlanGenerated();
    } catch (err) {
      console.error("Study plan generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate study plan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Study Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Study Plan</DialogTitle>
          <DialogDescription>
            Create a personalized study schedule for {subjectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="testDate">Test Date</Label>
            <Input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-gray-500">
              We'll create a day-by-day plan leading up to your test
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900">Plan Details</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• Current Progress: {currentProgress}%</p>
              <p>• Average Score: {averageScore}%</p>
              <p>• Personalized daily tasks</p>
              <p>• Optimized study schedule</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
