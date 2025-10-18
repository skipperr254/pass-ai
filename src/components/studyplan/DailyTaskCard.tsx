import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import type { DailyTask } from "../../types";
import { format, isToday, isPast } from "date-fns";

interface DailyTaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
}

export default function DailyTaskCard({
  task,
  onToggleComplete,
}: DailyTaskCardProps) {
  const taskDate = new Date(task.date);
  const isTaskToday = isToday(taskDate);
  const isTaskPast = isPast(taskDate) && !isToday(taskDate);
  //   const isTaskFuture = isFuture(taskDate);

  const getCardStyle = () => {
    if (task.completed) {
      return "border-green-200 bg-green-50";
    }
    if (isTaskToday) {
      return "border-blue-300 bg-blue-50 shadow-md";
    }
    if (isTaskPast) {
      return "border-red-200 bg-red-50";
    }
    return "border-gray-200";
  };

  const getDateBadge = () => {
    if (isTaskToday) {
      return <Badge className="bg-blue-600">Today</Badge>;
    }
    if (isTaskPast && !task.completed) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (task.completed) {
      return <Badge className="bg-green-600">Completed</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <Card className={`${getCardStyle()} transition-all`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={onToggleComplete}
              className="mt-1"
            />
            <div>
              <CardTitle className="text-base">
                {format(taskDate, "EEEE, MMMM d")}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {task.duration} minutes
                </span>
              </div>
            </div>
          </div>
          {getDateBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {task.tasks.map((taskItem, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 p-2 rounded ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.completed ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <span className="text-blue-600 font-medium flex-shrink-0">•</span>
            )}
            <span className="text-sm">{taskItem}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
