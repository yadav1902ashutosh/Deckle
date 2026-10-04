import React, { useState } from "react";
import { X, Check, Camera, User, Sparkles, Upload, ShieldCheck } from "lucide-react";
import ImageFramingModal from "../common/ImageFramingModal";

export default function EditProfileModal({
  isOpen,
  onClose,
  initialUser,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: initialUser?.name || "Arthur Vance",
    handle: initialUser?.handle || "arthur_vance",
    bio: initialUser?.bio || "Writer of epic fantasy sagas and immersive serial fiction.",
    avatar: initialUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  });

  const [isFramingOpen, setIsFramingOpen] = useState(false);
  const [framingSrc, setFramingSrc] = useState(null);

  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  ];

  if (!isOpen) return null;

  const handlePickFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFramingSrc(event.target.result);
          setIsFramingOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleFramingConfirm = (croppedUrl) => {
    setFormData((prev) => ({ ...prev, avatar: croppedUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="relative w-full max-w-lg bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-subtle/40">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-lg font-semibold text-text-main">
                Edit Persona Profile
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
                Profile Avatar
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative group shrink-0 w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent border border-border-subtle shadow-xs">
                  <img
                    src={formData.avatar}
                    alt="Selected avatar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handlePickFile}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload & Frame"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePickFile}
                      className="px-3 py-1.5 bg-accent text-accent-text rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload &amp; Frame</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-text-muted pr-1">Presets:</span>
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: preset })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
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
              <label className="block font-semibold text-text-main mb-1">Author Handle</label>
              <div className="flex items-center bg-tag/60 border border-border-subtle/50 rounded-xl overflow-hidden focus-within:border-accent focus-within:bg-card transition-colors">
                <span className="pl-3.5 text-text-muted font-mono">@</span>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      handle: e.target.value.replace(/^@/, "").toLowerCase(),
                    })
                  }
                  className="w-full px-2 py-2.5 bg-transparent text-text-main font-mono text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* System-Defined Account Role (Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-text-main text-xs">Account Role</label>
                <span className="text-[10px] uppercase font-bold text-text-muted bg-tag px-2 py-0.5 rounded border border-border-subtle/50">
                  System Defined
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-tag/40 border border-border-subtle/50 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold text-text-main">
                    {initialUser?.role || "Avid Reader"}
                  </span>
                </div>
                <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded font-semibold uppercase">
                  {initialUser?.tier || "Reader"}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Roles are system-managed. You are automatically upgraded to Serial Author when you publish a work in Author Studio.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold text-text-main mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent focus:bg-card transition-colors resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-border-subtle/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Framing Modal */}
      <ImageFramingModal
        isOpen={isFramingOpen}
        onClose={() => setIsFramingOpen(false)}
        onConfirm={handleFramingConfirm}
        imageSrc={framingSrc}
        type="avatar"
      />
    </>
  );
}
