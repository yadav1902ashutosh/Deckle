import React from "react";
import { User, Edit3, Settings, Download, Calendar, ShieldCheck } from "lucide-react";

export default function ProfileHeader({
  user = {
    name: "Julian Thorne",
    handle: "daoreader",
    email: "j.thorne@archive.read",
    role: "Senior Scholar",
    tier: "Tier 7",
    memberSince: "October 2023",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  },
  onEditProfile = () => {},
  onManageAccount = () => {},
  onExportArchive = () => {},
}) {
  return (
    <section className="relative bg-card border border-border-subtle/50 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden transition-colors">
      {/* Contained ambient aura */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* User Info & Avatar */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm ring-4 ring-card border border-border-subtle/40"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.handle || "reader")}`;
                }}
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold ring-4 ring-card border border-border-subtle/40">
                {user.name?.charAt(0)?.toUpperCase() || "R"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              {user.tier}
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-main truncate">
                {user.name}
              </h1>
              <span className="bg-tag border border-border-subtle/40 text-text-muted text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {user.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted flex items-center gap-2 mt-1">
              <span className="font-mono text-accent">@{user.handle}</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>{user.email}</span>
            </p>

            <div className="flex items-center gap-1.5 mt-2 text-text-muted text-xs">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>Bibliophile member since {user.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onManageAccount}
            className="flex items-center gap-1.5 px-3 py-2 bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-accent" />
            <span>Manage Account</span>
          </button>

          <button
            onClick={onExportArchive}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>
      </div>
    </section>
  );
}
