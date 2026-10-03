import React, { useState } from "react";
import { X, Check, Camera, User, Sparkles } from "lucide-react";

export default function EditProfileModal({
  isOpen,
  onClose,
  initialUser,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: initialUser?.name || "Julian Thorne",
    handle: initialUser?.handle || "daoreader",
    role: initialUser?.role || "Senior Scholar",
    bio: initialUser?.bio || "Seeker of forgotten scriptures, celestial dao archives, and late-night serialized chapters.",
    avatar: initialUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  });

  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle/40">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold text-text-main">
              Edit Scholar Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Avatar Selector */}
          <div>
            <label className="block font-semibold text-text-muted uppercase tracking-wider mb-2">
              Reader Avatar
            </label>
            <div className="flex items-center gap-4">
              <img
                src={formData.avatar}
                alt="Selected avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-accent border border-border-subtle shadow-xs"
              />
              <div className="flex items-center gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: preset })}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      formData.avatar === preset
                        ? "border-accent ring-2 ring-accent/30 scale-105"
                        : "border-border-subtle/50 hover:border-accent"
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-text-main mb-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent focus:bg-card transition-colors"
              required
            />
          </div>

          {/* Handle */}
          <div>
            <label className="block font-semibold text-text-main mb-1">Scholar Handle</label>
            <div className="flex items-center bg-tag/60 border border-border-subtle/50 rounded-xl overflow-hidden focus-within:border-accent focus-within:bg-card transition-colors">
              <span className="pl-3.5 text-text-muted font-mono">@</span>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="w-full px-2 py-2.5 bg-transparent text-text-main font-mono focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Role / Honorific */}
          <div>
            <label className="block font-semibold text-text-main mb-1">Reader Honorific</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent focus:bg-card transition-colors cursor-pointer"
            >
              <option value="Novice Reader">Novice Reader (Tier 1)</option>
              <option value="Archival Scribe">Archival Scribe (Tier 4)</option>
              <option value="Senior Scholar">Senior Scholar (Tier 7)</option>
              <option value="Grand Bibliophile">Grand Bibliophile (Tier 9)</option>
              <option value="Immortal Dao Scribe">Immortal Dao Scribe (Tier 10)</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block font-semibold text-text-main mb-1">Reader Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-normal focus:outline-none focus:border-accent focus:bg-card transition-colors leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-tag hover:bg-card border border-border-subtle/50 text-text-muted hover:text-text-main font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
