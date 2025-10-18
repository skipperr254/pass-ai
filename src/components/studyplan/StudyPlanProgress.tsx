import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface StudyPlanProgressProps {
  totalDays: number;
  completedDays: number;
  remainingDays: number;
  totalHours: number;
  completedHours: number;
}

export default function StudyPlanProgress({
  totalDays,
  completedDays,
  remainingDays,
  totalHours,
  completedHours,
}: StudyPlanProgressProps) {
  const completionPercentage = Math.round((completedDays / totalDays) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Plan Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Completion</span>
            <span className="font-semibold text-gray-900">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                Completed
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">{completedDays}</p>
            <p className="text-xs text-green-700">days</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Remaining
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{remainingDays}</p>
            <p className="text-xs text-blue-700">days</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-800 font-medium">
                Study Time
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {completedHours}
            </p>
            <p className="text-xs text-purple-700">of {totalHours} hours</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800 font-medium">
                Total Days
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{totalDays}</p>
            <p className="text-xs text-orange-700">in plan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
