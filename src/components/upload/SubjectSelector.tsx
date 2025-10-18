import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject } from "@/types";
import { Loader2 } from "lucide-react";

interface SubjectSelectorProps {
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
}

export default function SubjectSelector({
  selectedSubjectId,
  onSubjectChange,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("user_id", user!.id)
          .order("name");

        if (error) throw error;
        setSubjects(data || []);

        // Auto-select first subject if none selected
        if (data && data.length > 0 && !selectedSubjectId) {
          onSubjectChange(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user, onSubjectChange, selectedSubjectId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading subjects...</span>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No subjects found. Please create a subject first from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Select Subject</Label>
      <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Files will be uploaded to this subject
      </p>
    </div>
  );
}
