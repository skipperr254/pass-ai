import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import MaterialsList from "../../components/materials/MaterialsList";
import SubjectSelector from "../../components/upload/SubjectSelector";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { analyzeStudyMaterial } from "../../lib/services/analysisService";

export default function Materials() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  const handleAnalyzeMaterial = async (materialId: string) => {
    try {
      setError("");
      setSuccess("");
      setAnalyzing(true);
      setAnalyzingId(materialId);

      // Fetch material and subject details
      const { data: material, error: materialError } = await supabase
        .from("materials")
        .select("*, subjects(name)")
        .eq("id", materialId)
        .single();

      if (materialError) throw materialError;

      if (!material.extracted_text) {
        throw new Error("No text content found. Please re-upload the file.");
      }

      // Analyze with OpenAI
      const analysis = await analyzeStudyMaterial(
        material.extracted_text,
        material.subjects?.name || "General"
      );

      // Update material with analysis
      const { error: updateError } = await supabase
        .from("materials")
        .update({
          analysis: analysis,
          is_analyzed: true,
        })
        .eq("id", materialId);

      if (updateError) throw updateError;

      setSuccess("Material analyzed successfully!");
      setRefreshKey((prev) => prev + 1); // Trigger refresh
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to analyze material"
      );
    } finally {
      setAnalyzing(false);
      setAnalyzingId(null);
    }
  };

  const handleAnalyzeAll = async () => {
    try {
      setError("");
      setSuccess("");
      setAnalyzing(true);

      // Fetch unanalyzed materials for the selected subject
      let query = supabase
        .from("materials")
        .select("*, subjects(name)")
        .eq("user_id", user!.id)
        .eq("is_analyzed", false)
        .not("extracted_text", "is", null);

      if (selectedSubjectId) {
        query = query.eq("subject_id", selectedSubjectId);
      }

      const { data: materials, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (!materials || materials.length === 0) {
        setError("No unanalyzed materials found");
        setAnalyzing(false);
        return;
      }

      // Analyze each material
      let successCount = 0;
      for (const material of materials) {
        try {
          const analysis = await analyzeStudyMaterial(
            material.extracted_text!,
            material.subjects?.name || "General"
          );

          await supabase
            .from("materials")
            .update({
              analysis: analysis,
              is_analyzed: true,
            })
            .eq("id", material.id);

          successCount++;
        } catch (err) {
          console.error(`Failed to analyze material ${material.id}:`, err);
        }
      }

      setSuccess(
        `Successfully analyzed ${successCount} of ${materials.length} materials`
      );
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Batch analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to analyze materials"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Study Materials
            </h1>
            <p className="text-gray-600 mt-1">
              View and analyze your uploaded materials
            </p>
          </div>
          <Button
            onClick={handleAnalyzeAll}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze All
              </>
            )}
          </Button>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Subject Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <SubjectSelector
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={setSelectedSubjectId}
          />
        </div>

        {/* Materials List */}
        <MaterialsList
          key={refreshKey}
          subjectId={selectedSubjectId || undefined}
          onAnalyze={handleAnalyzeMaterial}
        />
      </div>
    </DashboardLayout>
  );
}
