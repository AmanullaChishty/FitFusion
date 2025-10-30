import React, { useState } from "react";
import { type NextWorkoutSuggestionResponse } from "../types/ai";

interface Props {
  suggestion: NextWorkoutSuggestionResponse;
  onApply?: (suggestion: NextWorkoutSuggestionResponse) => void;
  onIgnore?: (suggestion: NextWorkoutSuggestionResponse) => void;
}

const NextWorkoutSuggestionCard: React.FC<Props> = ({ suggestion, onApply, onIgnore }) => {
  const [showCues, setShowCues] = useState(false);

  const {
    exercise_name,
    base_suggestion,
    enriched_suggestion
  } = suggestion;
  const { suggestion_type, rationale, confidence_score, coaching_cues, is_recovery } = enriched_suggestion;
  const progressColor = is_recovery ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white w-full max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{exercise_name.replace("_", " ")}</h3>
        {is_recovery && (
          <span className="text-yellow-700 font-medium text-sm">Recovery</span>
        )}
      </div>

      <p className="text-gray-700 mb-1">
        <span className="font-medium">Action:</span> {suggestion_type}
      </p>
      <p className="text-gray-600 text-sm mb-2">{rationale}</p>

      {/* Confidence bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
        <div
          className={`${progressColor} h-2 rounded-full`}
          style={{ width: `${confidence_score*100}%` }}
        />
      </div>

      {/* Coaching cues toggle */}
      {coaching_cues && coaching_cues.length > 0 && (
        <div className="mb-2">
          <button
            className="text-blue-500 text-sm underline"
            onClick={() => setShowCues(!showCues)}
          >
            {showCues ? "Hide cues" : "Show coaching cues"}
          </button>
          {showCues && (
            <ul className="mt-1 list-disc list-inside text-gray-700 text-sm">
              {coaching_cues.map((cue:any, idx:any) => (
                <li key={idx}>{cue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
          onClick={() => onApply && onApply(suggestion)}
        >
          Apply to Next Session
        </button>
        <button
          className="flex-1 border border-gray-300 hover:bg-gray-100 py-1 px-2 rounded"
          onClick={() => onIgnore && onIgnore(suggestion)}
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default NextWorkoutSuggestionCard;
