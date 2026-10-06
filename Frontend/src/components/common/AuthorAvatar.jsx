import React, { useState } from "react";
import { Link } from "react-router-dom";

// Deterministic color palette for authors without custom uploaded avatars
const AVATAR_PALETTES = [
  "from-violet-500 to-indigo-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-sky-500 to-blue-600 text-white",
  "from-fuchsia-500 to-purple-600 text-white",
  "from-teal-500 to-cyan-600 text-white",
];

function getPalette(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getInitials(name = "") {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const SIZE_MAP = {
  xs: "w-4 h-4 text-[9px]",
  sm: "w-5 h-5 text-[10px]",
  md: "w-7 h-7 text-xs",
  lg: "w-9 h-9 text-sm",
  xl: "w-12 h-12 text-base",
};

export default function AuthorAvatar({
  name = "Author",
  avatar = null,
  handle = null,
  size = "xs",
  className = "",
  clickable = false,
  showName = false,
  nameClassName = "",
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  // Check if avatar is valid (not null, not undefined, not default placeholder)
  const isValidAvatar =
    Boolean(avatar) &&
    !avatar.includes("via.placeholder.com") &&
    !imgError;

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.xs;
  const palette = getPalette(name);
  const initials = getInitials(name);
  const cleanHandle = handle ? handle.replace(/^@/, "") : "";

  const avatarElement = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none shadow-2xs border border-border-subtle/60 ring-1 ring-border-subtle/20 ${sizeClasses} ${className}`}
      title={name ? `${name}${handle ? ` (@${cleanHandle})` : ""}` : "Author"}
    >
      {isValidAvatar ? (
        <img
          src={avatar}
          alt={name || "Author"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <span
          className={`w-full h-full flex items-center justify-center font-bold tracking-tight bg-gradient-to-br ${palette}`}
        >
          {initials}
        </span>
      )}
    </div>
  );

  const content = (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {avatarElement}
      {showName && (
        <span className={`truncate font-medium ${nameClassName}`}>
          {name}
        </span>
      )}
    </span>
  );

  if (clickable && cleanHandle) {
    return (
      <Link
        to={`/author/@${cleanHandle}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
        className="inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
