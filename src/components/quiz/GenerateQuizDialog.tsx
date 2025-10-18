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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { generateQuizQuestions } from "../../lib/services/quizService";

interface GenerateQuizDialogProps {
  subjectId: string;
  subjectName: string;
  materialIds: string[];
  onQuizGenerated: () => void;
}

export default function GenerateQuizDialog({
  subjectId,
  subjectName,
  materialIds,
  onQuizGenerated,
}: GenerateQuizDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleGenerate = async () => {
    setError("");
    setLoading(true);

    try {
      // Fetch materials content
      const { data: materials, error: fetchError } = await supabase
        .from("materials")
        .select("extracted_text")
        .in("id", materialIds)
        .not("extracted_text", "is", null);

      if (fetchError) throw fetchError;

      if (!materials || materials.length === 0) {
        throw new Error("No materials with extracted text found");
      }

      // Combine all material content
      const combinedContent = materials
        .map((m) => m.extracted_text)
        .join("\n\n");

      // Generate quiz questions
      const questions = await generateQuizQuestions(
        combinedContent,
        subjectName,
        difficulty,
        questionCount
      );

      if (questions.length === 0) {
        throw new Error("No questions were generated");
      }

      // Save quiz to database
      const { error: insertError } = await supabase.from("quizzes").insert({
        user_id: user!.id,
        subject_id: subjectId,
        material_ids: materialIds,
        title:
          title || `${subjectName} Quiz - ${new Date().toLocaleDateString()}`,
        difficulty,
        questions: questions,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setTitle("");
      setQuestionCount(10);
      onQuizGenerated();
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Quiz</DialogTitle>
          <DialogDescription>
            Create a quiz from your study materials using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title (Optional)</Label>
            <Input
              id="title"
              placeholder={`${subjectName} Quiz`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={(value) =>
                setDifficulty(value as "easy" | "medium" | "hard")
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Input
              id="questionCount"
              type="number"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Between 5 and 50 questions</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              Using {materialIds.length} material
              {materialIds.length !== 1 ? "s" : ""} to generate questions
            </p>
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
