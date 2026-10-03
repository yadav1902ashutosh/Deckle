import React from "react";

export default function ReadingGoalWidget() {
  return (
    <div className="bg-accent text-accent-text rounded-xl p-5 shadow-sm relative overflow-hidden transition-colors">
      <div className="relative z-10 space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-accent-text/80 font-bold">
          Weekly Marathon
        </span>
        <h4 className="font-serif text-lg font-semibold text-accent-text">
          1.2M Words Read
        </h4>
        <p className="text-xs text-accent-text/90 leading-relaxed">
          You are among the top 3% of serialized fiction readers this week.
          Unlock exclusive typographer fonts in Deckle Studio.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-2 mt-3">
          <div className="bg-accent-text h-2 rounded-full w-4/5" />
        </div>

        <div className="flex justify-between text-[11px] pt-0.5 text-accent-text/80 font-medium">
          <span>80% Goal Reached</span>
          <span>1.5M Goal</span>
        </div>
      </div>
    </div>
  );
}
