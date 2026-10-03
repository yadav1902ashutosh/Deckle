import React from "react";
import { Flame, Clock, BookOpen } from "lucide-react";

export default function ReadingMetricsRow({
  streakDays = 48,
  engagementHours = 184.2,
  wordsConsumed = "42.8M",
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-card/60 border border-border-subtle/50 rounded-2xl p-4 transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-tag flex items-center justify-center text-accent shadow-2xs">
          <Flame className="w-5 h-5 fill-accent" />
        </div>
        <div>
          <div className="font-serif text-xl sm:text-2xl text-text-main font-semibold leading-tight">
            {streakDays} Days
          </div>
          <div className="text-xs text-text-muted">Consecutive Reading Streak</div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-tag flex items-center justify-center text-accent shadow-2xs">
          <Clock className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="font-serif text-xl sm:text-2xl text-text-main font-semibold leading-tight">
            {engagementHours} Hours
          </div>
          <div className="text-xs text-text-muted">Total Reader Engagement</div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-tag flex items-center justify-center text-accent shadow-2xs">
          <BookOpen className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="font-serif text-xl sm:text-2xl text-text-main font-semibold leading-tight">
            {wordsConsumed} Words
          </div>
          <div className="text-xs text-text-muted">Serialized Text Consumed</div>
        </div>
      </div>
    </div>
  );
}
