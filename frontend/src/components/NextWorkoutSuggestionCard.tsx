import React, { useState } from "react";
import { type NextWorkoutSuggestionResponse } from "../types/ai";

interface Props {
  suggestion: NextWorkoutSuggestionResponse;
  onApply?: (suggestion: NextWorkoutSuggestionResponse) => void;
  onIgnore?: (suggestion: NextWorkoutSuggestionResponse) => void;
}

const NextWorkoutSuggestionCard: React.FC<Props> = ({
  suggestion,
  onApply,
  onIgnore,
}) => {
  const [showCues, setShowCues] = useState(false);

  const { exercise_name, enriched_suggestion } = suggestion;
  const {
    suggestion_type,
    rationale,
    confidence_score,
    coaching_cues,
    is_recovery,
  } = enriched_suggestion;

  const progressColor = is_recovery ? "bg-amber-400" : "bg-emerald-500";

  const displayName = exercise_name.replace(/_/g, " ");

  return (
    <div className="flex h-full w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {displayName}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">
            Next session suggestion
          </p>
        </div>
        {is_recovery && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
            Recovery
          </span>
        )}
      </div>

      {/* Action + rationale */}
      <p className="mb-1 text-xs text-slate-700">
        <span className="font-semibold text-slate-900">Action:</span>{" "}
        <span className="capitalize">{suggestion_type}</span>
      </p>
      <p className="mb-3 text-xs text-slate-500 line-clamp-3">{rationale}</p>

      {/* Confidence bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Confidence</span>
          <span>{Math.round(confidence_score * 100)}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`${progressColor} h-1.5 rounded-full transition-all`}
            style={{ width: `${confidence_score * 100}%` }}
          />
        </div>
      </div>

      {/* Coaching cues toggle */}
      {coaching_cues && coaching_cues.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-600"
            onClick={() => setShowCues((prev) => !prev)}
          >
            {showCues ? "Hide coaching cues" : "Show coaching cues"}
          </button>
          {showCues && (
            <ul className="mt-1 list-disc list-inside space-y-1 text-[11px] text-slate-600">
              {coaching_cues.map((cue: any, idx: any) => (
                <li key={idx}>{cue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="mt-auto flex gap-2 pt-1">
        <button
          type="button"
          className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-medium text-white shadow-sm transition hover:bg-emerald-500"
          onClick={() => onApply && onApply(suggestion)}
        >
          Apply to next session
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={() => onIgnore && onIgnore(suggestion)}
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default NextWorkoutSuggestionCard;
