import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import type { QuizQuestion as QuizQuestionType } from "../../types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  showResult?: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
}: QuizQuestionProps) {
  const isCorrect = selectedAnswer === question.correct_answer;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          {showResult && (
            <span
              className={`text-sm font-semibold ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{question.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup value={selectedAnswer} onValueChange={onAnswerSelect}>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === question.correct_answer;

              let optionClass =
                "border-2 rounded-lg p-4 cursor-pointer transition-colors";

              if (showResult) {
                if (isCorrectOption) {
                  optionClass += " border-green-500 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  optionClass += " border-red-500 bg-red-50";
                } else {
                  optionClass += " border-gray-200";
                }
              } else {
                optionClass += isSelected
                  ? " border-blue-500 bg-blue-50"
                  : " border-gray-200 hover:border-gray-300";
              }

              return (
                <div key={index} className={optionClass}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      disabled={showResult}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                    {showResult && isCorrectOption && (
                      <span className="text-green-600 font-semibold">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {showResult && question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Explanation:
            </p>
            <p className="text-sm text-blue-800">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
