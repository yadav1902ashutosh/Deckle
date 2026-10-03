import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Play,
  BookmarkPlus,
  Share2,
} from "lucide-react";

export default function HeroSpotlight() {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-card border-b border-border-subtle shadow-sm transition-colors duration-200">
      {/* Ambient artistic aura backdrop */}
      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          {/* Novel Cover Canvas with Tactile Edge */}
          <div className="relative flex-shrink-0 group">
            <div className="w-64 h-88 sm:w-72 sm:h-96 rounded-lg overflow-hidden shadow-xl bg-card-white border border-border-subtle relative transform transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMCoXg0A2-Yo0mTXKJJii1soqngrcK74BYMhb3W9Hupryd0v7ZDbOxVmKOIW_jA_Ac0Z5IgN0M3AIpZ4pllzzgthPHoVsFEetKEkJn4HRDenrnEvoi3zAMYXoCt550fGyqy23yP4c2VlVHiZ0py8Whk5RLMrCpiLF5KPIzA05z4bi5Ex8XbmLzPS-DCXEAvK1Vh0_7srfY8kv73m2wdknUCMCC9pQKg6-OTfX6XpkDKEmjoF576NTn"
                alt="Heavenly Tribulation web novel cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
              <span className="absolute top-3 left-3 bg-accent text-accent-text text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Editor's Pinnacle Choice
              </span>
            </div>
            {/* Tactile spine/page shadow illusion underneath */}
            <div className="absolute -bottom-2 inset-x-4 h-4 bg-text-main/10 blur-md rounded-full pointer-events-none" />
          </div>

          {/* Novel Editorial Dossier */}
          <div className="flex-1 flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="uppercase tracking-widest text-accent font-semibold">
                  Weekly Serial Crown
                </span>
                <span>•</span>
                <span>Updated 18 minutes ago</span>
                <span>•</span>
                <span className="bg-tag px-2 py-0.5 rounded text-text-main font-medium border border-border-subtle">
                  Chapter 2,418 Live
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight font-medium">
                Heavenly Tribulation
              </h1>
              <p className="text-sm text-text-muted font-medium">
                By{" "}
                <span className="text-text-main underline decoration-border-subtle hover:text-accent cursor-pointer transition-colors">
                  Fleeting Dreams (飘渺梦)
                </span>
              </p>
            </div>

            {/* Key Metrics Cluster */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-1">
              <div className="flex items-center gap-1.5 bg-tag px-3 py-1.5 rounded-lg border border-border-subtle">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-text-main">9.8</span>
                <span className="text-xs text-text-muted">/ 10 (14.2k reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="font-semibold text-text-main">24.9M</span>
                <span className="text-xs">Words</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <Users className="w-4 h-4 text-accent" />
                <span className="font-semibold text-text-main">44.0K</span>
                <span className="text-xs">Active Readers</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="font-semibold text-accent">Rank #1</span>
                <span className="text-xs">Eastern Xianxia</span>
              </div>
            </div>

            {/* Synopses Excerpt */}
            <p className="text-sm sm:text-base text-text-muted max-w-3xl line-clamp-3 leading-relaxed">
              Born without spiritual roots into an era of dying celestial courts,
              Shen Wuyue discovered the Nine Nether Furnace buried beneath his
              ancestral graveyard. When the heavens decree your doom before your
              first breath, true immortality is forged not in obedience to the
              cosmos, but by consuming the very tribulation lightning sent to
              obliterate your soul...
            </p>

            {/* Interactive Genre Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                className="bg-tag hover:bg-border-subtle text-text-main text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-border-subtle"
              >
                #GhostCultivation
              </button>
              <button
                type="button"
                className="bg-tag hover:bg-border-subtle text-text-main text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-border-subtle"
              >
                #Reincarnation
              </button>
              <button
                type="button"
                className="bg-tag hover:bg-border-subtle text-text-main text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-border-subtle"
              >
                #AncientArtifact
              </button>
              <button
                type="button"
                className="bg-tag hover:bg-border-subtle text-text-main text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-border-subtle"
              >
                #DecisiveMC
              </button>
              <span className="text-xs text-text-muted ml-2 italic">
                Tier 4 Immortal Canon
              </span>
            </div>

            {/* CTA Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/book/heavenly-tribulation/chapter/1"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-text px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Reading Ch. 1</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-border-subtle ${
                  isBookmarked
                    ? "bg-accent/15 text-accent"
                    : "bg-tag hover:bg-border-subtle text-text-main"
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isBookmarked ? "In Library" : "Add to Library"}</span>
              </button>
              <button
                type="button"
                className="p-3 rounded-lg bg-tag text-text-muted hover:text-text-main hover:bg-border-subtle border border-border-subtle transition-colors cursor-pointer"
                title="Share Novel"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <span className="text-text-muted text-xs italic pl-1 hidden sm:inline">
                Free reading tier available up to Chapter 120
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
