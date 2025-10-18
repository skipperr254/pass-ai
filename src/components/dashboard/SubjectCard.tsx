import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import type { Subject } from "../../types";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function SubjectCard({
  subject,
  onClick,
  onDelete,
}: SubjectCardProps) {
  const progressColor =
    subject.progress >= 75
      ? "text-green-600"
      : subject.progress >= 50
        ? "text-blue-600"
        : subject.progress >= 25
          ? "text-yellow-600"
          : "text-gray-400";

  const getPassChanceColor = (chance?: number) => {
    if (!chance) return "text-gray-400";
    if (chance >= 75) return "text-green-600";
    if (chance >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer relative group">
      <div onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                {subject.description && (
                  <CardDescription className="text-sm mt-1 line-clamp-1">
                    {subject.description}
                  </CardDescription>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(subject.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Circle */}
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - subject.progress / 100)
                    }`}
                  className={progressColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${progressColor}`}>
                    {subject.progress}%
                  </p>
                  <p className="text-xs text-gray-500">Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {subject.test_date && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Test Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDistanceToNow(new Date(subject.test_date), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )}

            {subject.pass_chance !== null &&
              subject.pass_chance !== undefined && (
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Pass Chance</p>
                    <p
                      className={`font-medium ${getPassChanceColor(
                        subject.pass_chance
                      )}`}
                    >
                      {subject.pass_chance}%
                    </p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
