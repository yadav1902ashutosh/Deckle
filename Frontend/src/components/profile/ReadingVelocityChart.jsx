import React, { useState, useEffect } from "react";
import { TrendingUp, Sparkles, Award } from "lucide-react";
import userService from "../../services/userService/userService";

export default function ReadingVelocityChart({ days: propDays = null }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [chartDays, setChartDays] = useState(propDays || []);
  const [loading, setLoading] = useState(!propDays);

  useEffect(() => {
    if (propDays) {
      setChartDays(propDays);
      return;
    }

    let isMounted = true;
    async function loadVelocity() {
      try {
        const raw = await userService.getReadingVelocity();
        if (isMounted && Array.isArray(raw) && raw.length > 0) {
          const maxWords = Math.max(...raw.map((r) => Number(r.words) || 0), 1000);
          const mapped = raw.map((r) => {
            const words = Number(r.words) || 0;
            const mins = Number(r.minutes) || 0;
            const shortDay = r.date
              ? new Date(r.date).toLocaleDateString("en-US", { weekday: "short" })
              : r.day_label || "Day";
            const percentHeight = Math.max(12, Math.round((words / maxWords) * 100));
            return {
              day: shortDay,
              words,
              mins,
              label: words >= 1000 ? `${(words / 1000).toFixed(0)}k` : `${words}`,
              heightPercent: percentHeight,
              isPeak: words === maxWords && words > 0,
            };
          });
          setChartDays(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch reading velocity:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadVelocity();
    return () => {
      isMounted = false;
    };
  }, [propDays]);

  const days = chartDays.length > 0 ? chartDays : [
    { day: "Mon", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Tue", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Wed", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Thu", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Fri", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Sat", words: 0, label: "0", mins: 0, heightPercent: 15 },
    { day: "Sun", words: 0, label: "0", mins: 0, heightPercent: 15 },
  ];

  const totalWords = days.reduce((acc, d) => acc + (d.words || 0), 0);
  const totalMins = days.reduce((acc, d) => acc + (d.mins || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);

  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="font-serif text-base sm:text-lg font-semibold text-text-main">
            Reading Velocity
          </h3>
        </div>
        <span className="text-xs text-text-muted font-medium bg-tag px-2.5 py-0.5 rounded-full border border-border-subtle/40">
          Last 7 Days
        </span>
      </div>

      {/* Summary highlight */}
      <div className="flex items-center justify-between p-3 bg-tag/60 border border-border-subtle/40 rounded-xl text-xs">
        <div>
          <span className="text-text-muted">Weekly Output: </span>
          <span className="font-bold text-accent font-serif text-sm">
            {(totalWords / 1000).toLocaleString()}k Words
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="font-medium">{totalHours}h Flow Time</span>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="relative pt-6 pb-1">
        {/* Tooltip on hover */}
        {hoveredDay && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-card border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg shadow-md flex items-center gap-2 animate-fadeIn pointer-events-none">
            <span className="font-bold text-accent">{hoveredDay.day}:</span>
            <span>{hoveredDay.words.toLocaleString()} words</span>
            <span className="text-text-muted">• {hoveredDay.mins} mins</span>
            {hoveredDay.isPeak && (
              <span className="bg-accent text-white px-1.5 py-0.2 rounded-full text-[9px]">
                Peak
              </span>
            )}
          </div>
        )}

        <div className="h-28 w-full flex items-end justify-between gap-1.5 sm:gap-2 px-1">
          {days.map((item) => {
            const isHovered = hoveredDay?.day === item.day;
            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                {/* Word badge */}
                <span
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered || item.isPeak
                      ? "text-accent font-bold"
                      : "text-text-muted"
                  }`}
                >
                  {item.label}
                </span>

                {/* Vertical bar */}
                <div className="w-full h-24 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${item.height || ""} ${
                      item.isPeak
                        ? "bg-accent shadow-xs"
                        : isHovered
                        ? "bg-accent/80"
                        : "bg-accent/25 group-hover:bg-accent/50"
                    }`}
                    style={item.heightPercent ? { height: `${item.heightPercent}%` } : undefined}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered || item.isPeak
                      ? "text-accent font-bold"
                      : "text-text-muted"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight */}
      <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/30 text-[11px] text-text-muted">
        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
        <span>You read 18% more this week compared to last week. Peak session on Saturday.</span>
      </div>
    </section>
  );
}
