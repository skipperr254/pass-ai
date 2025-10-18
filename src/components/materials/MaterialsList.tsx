import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type { Material } from "../../types";
import MaterialCard from "@/components/materials/MaterialCard";
import { Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface MaterialsListProps {
  subjectId?: string;
  onAnalyze?: (materialId: string) => void;
}

export default function MaterialsList({
  subjectId,
  onAnalyze,
}: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("materials")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (subjectId) {
        query = query.eq("subject_id", subjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, [subjectId, user]);

  useEffect(() => {
    fetchMaterials();
  }, [user, subjectId, fetchMaterials]);

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;
      fetchMaterials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete material");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No materials yet
        </h3>
        <p className="text-gray-600">Upload study materials to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onAnalyze={onAnalyze}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
