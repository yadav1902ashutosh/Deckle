import React from "react";
import { Info, Check, ArrowLeft, ArrowRight, BookOpen, Sun, Moon, Palette, Bookmark, Type } from "lucide-react";

export default function ReaderToast({ toast }) {
  if (!toast || !toast.visible) return null;

  const getIcon = () => {
    switch (toast.icon) {
      case "check":
        return <Check className="w-4 h-4 text-emerald-400" />;
      case "arrow_back":
        return <ArrowLeft className="w-4 h-4 text-accent" />;
      case "arrow_forward":
        return <ArrowRight className="w-4 h-4 text-accent" />;
      case "menu_book":
      case "auto_stories":
        return <BookOpen className="w-4 h-4 text-accent" />;
      case "dark_mode":
        return <Moon className="w-4 h-4 text-amber-300" />;
      case "light_mode":
        return <Sun className="w-4 h-4 text-amber-400" />;
      case "palette":
        return <Palette className="w-4 h-4 text-accent" />;
      case "bookmark":
        return <Bookmark className="w-4 h-4 text-accent" />;
      case "text_fields":
        return <Type className="w-4 h-4 text-accent" />;
      default:
        return <Info className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="px-4 py-2 rounded-full bg-inverse-surface/90 text-inverse-on-surface shadow-lg text-xs font-medium flex items-center gap-2 backdrop-blur-md border border-white/10">
        {getIcon()}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
