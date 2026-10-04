import React, { useState, useEffect } from "react";
import readingHistoryService from "../../services/readingHistoryService/readingHistoryService";

export default function ReadingGoalWidget() {
  const [goal, setGoal] = useState({
    words_read: 1200000,
    goal_words: 1500000,
    percentage: 80,
    headline: "1.2M Words Read",
    rank_bracket: "Top 3% of serialized fiction readers this week",
  });

  useEffect(() => {
    let isMounted = true;
    readingHistoryService
      .getWeeklyReadingGoal()
      .then((data) => {
        if (isMounted && data) {
          setGoal(data);
        }
      })
      .catch(() => {
        // Silently preserve state if guest / offline
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-accent text-accent-text rounded-xl p-5 shadow-sm relative overflow-hidden transition-colors">
      <div className="relative z-10 space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-accent-text/80 font-bold">
          Weekly Marathon
        </span>
        <h4 className="font-serif text-lg font-semibold text-accent-text">
          {goal.headline || `${(goal.words_read / 1000000).toFixed(1)}M Words Read`}
        </h4>
        <p className="text-xs text-accent-text/90 leading-relaxed">
          {goal.rank_bracket || "You are making steady progress through the serial canon."}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-2 mt-3">
          <div
            className="bg-accent-text h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, goal.percentage))}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] pt-0.5 text-accent-text/80 font-medium">
          <span>{goal.percentage}% Goal Reached</span>
          <span>{(goal.goal_words / 1000000).toFixed(1)}M Goal</span>
        </div>
      </div>
    </div>
  );
}
