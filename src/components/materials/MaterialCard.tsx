import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  FileText,
  Image,
  File as FileIcon,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";
import type { Material } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface MaterialCardProps {
  material: Material;
  onAnalyze?: (materialId: string) => void;
  onDelete: (materialId: string) => void;
}

export default function MaterialCard({
  material,
  onAnalyze,
  onDelete,
}: MaterialCardProps) {
  const getIcon = () => {
    if (material.file_type === "image") {
      return <Image className="w-5 h-5 text-purple-600" />;
    }
    if (material.file_type === "pdf") {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <FileIcon className="w-5 h-5 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {material.file_name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(material.file_size)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(material.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant={material.is_analyzed ? "default" : "secondary"}
            className="ml-2"
          >
            {material.is_analyzed ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <Clock className="w-3 h-3 mr-1" />
            )}
            {material.is_analyzed ? "Analyzed" : "Not Analyzed"}
          </Badge>
        </div>
      </CardHeader>

      {material.is_analyzed && material.analysis && (
        <CardContent className="space-y-4">
          {/* Key Concepts */}
          {material.analysis.key_concepts &&
            material.analysis.key_concepts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {material.analysis.key_concepts
                    .slice(0, 5)
                    .map((concept, index) => (
                      <Badge key={index} variant="outline">
                        {concept}
                      </Badge>
                    ))}
                  {material.analysis.key_concepts.length > 5 && (
                    <Badge variant="outline">
                      +{material.analysis.key_concepts.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {/* Main Ideas */}
          {material.analysis.main_ideas && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Main Ideas
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {material.analysis.main_ideas}
              </p>
            </div>
          )}

          {/* Difficulty and Study Time */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">Difficulty:</span>
              <Badge
                variant={
                  material.analysis.difficulty_level === "beginner"
                    ? "default"
                    : material.analysis.difficulty_level === "intermediate"
                    ? "secondary"
                    : "destructive"
                }
              >
                {material.analysis.difficulty_level}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>~{material.analysis.estimated_study_time} min</span>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          {!material.is_analyzed && onAnalyze && material.extracted_text && (
            <Button
              size="sm"
              onClick={() => onAnalyze(material.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Analyze
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(material.file_url, "_blank")}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(material.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
