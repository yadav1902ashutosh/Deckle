import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const LIVE_UPDATES = [
  {
    id: "asura",
    timeAgo: "5m ago",
    chapterNum: "Ch. 5891",
    title: "Asura Martial God",
    chapterTitle: "The Awakening of Nine-Coloured Divine Lightning",
    slug: "asura-martial-god",
  },
  {
    id: "heavenly",
    timeAgo: "12m ago",
    chapterNum: "Ch. 2418",
    title: "Heavenly Tribulation",
    chapterTitle: "Breaking the Bloodbound Seal of Patriarch Wu",
    slug: "heavenly-tribulation",
  },
  {
    id: "shadow",
    timeAgo: "28m ago",
    chapterNum: "Ch. 1104",
    title: "Shadow Slave Chronicle",
    chapterTitle: "Whispers Beneath the Crimson Obelisk",
    slug: "shadow-slave-chronicle",
  },
  {
    id: "cornflower",
    timeAgo: "45m ago",
    chapterNum: "Ch. 784",
    title: "Cornflower Witch",
    chapterTitle: "The Glass Bell Sings at Blackthorn Cross",
    slug: "cornflower-witch",
  },
];

export default function LiveSerialPulse() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border-subtle space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent fill-accent" />
          <h3 className="font-serif text-base font-semibold text-text-main">
            Live Serial Pulse
          </h3>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
      </div>

      <div className="space-y-2 divide-y divide-border-subtle/50">
        {LIVE_UPDATES.map((item) => (
          <div
            key={item.id}
            className="pt-2 first:pt-0 p-1.5 rounded hover:bg-tag transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold text-accent">{item.timeAgo}</span>
              <span className="text-text-main font-medium">{item.chapterNum}</span>
            </div>
            <Link
              to={`/book/${item.slug}`}
              className="text-xs font-semibold text-text-main hover:text-accent truncate block mt-0.5"
            >
              {item.title}
            </Link>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              Title: {item.chapterTitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
