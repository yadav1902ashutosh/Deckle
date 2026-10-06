import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  Minus,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Type,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function StoryEditor({
  content = "",
  onChange,
  onWordCountChange,
  placeholder = "Begin composing your novel chapter manuscript...",
  novelTitle = "",
  chapterNumber = 1,
  chapterTitle = "",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorFont, setEditorFont] = useState("serif"); // 'serif' | 'sans'
  const [isLiteraryIndent, setIsLiteraryIndent] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        dropcursor: {
          color: "var(--color-accent)",
          width: 2,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "tiptap ProseMirror min-h-[380px] p-5 sm:p-7 focus:outline-none leading-relaxed transition-all",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const words = editor.storage.characterCount.words();
      if (onChange) onChange(html);
      if (onWordCountChange) onWordCountChange(words);
    },
  });

  // Sync external content changes (e.g. switching chapters or resetting draft)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
      if (onWordCountChange) {
        onWordCountChange(editor.storage.characterCount.words());
      }
    }
  }, [content, editor]);

  // Sync initial word count on mount
  useEffect(() => {
    if (editor && onWordCountChange) {
      onWordCountChange(editor.storage.characterCount.words());
    }
  }, [editor]);

  // Escape key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (!editor) {
    return (
      <div className="w-full h-80 rounded-2xl bg-tag/30 border border-border-subtle/40 flex items-center justify-center text-xs text-text-muted">
        Loading Manuscript Composer...
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <div
      className={`transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-page text-text-main flex flex-col p-4 sm:p-8 overflow-y-auto"
          : "relative rounded-2xl border border-border-subtle/50 bg-card overflow-hidden shadow-xs flex flex-col"
      }`}
    >
      {/* Fullscreen Zen Mode Header */}
      {isFullscreen && (
        <div className="max-w-4xl w-full mx-auto pb-4 flex items-center justify-between border-b border-border-subtle/40 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="font-serif font-bold text-sm text-text-main truncate">
              {novelTitle || "Deckle Serial"} • Ch. {chapterNumber}: {chapterTitle || "Untitled"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-tag text-[10px] text-accent font-semibold uppercase tracking-wider">
              Zen Focus Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              Press <kbd className="px-1.5 py-0.5 rounded bg-tag text-[11px] font-mono border border-border-subtle">Esc</kbd> to return
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main cursor-pointer transition-colors"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tiptap Writer Toolbar */}
      <div
        className={`bg-tag/60 border-b border-border-subtle/40 p-2 sm:p-2.5 flex items-center justify-between gap-2 flex-wrap ${
          isFullscreen ? "max-w-4xl w-full mx-auto rounded-xl border border-border-subtle/40 mb-3" : ""
        }`}
      >
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Paragraph / Normal */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor.isActive("paragraph") && !editor.isActive("heading") && !editor.isActive("blockquote")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Normal Paragraph"
          >
            <Pilcrow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Body</span>
          </button>

          {/* Heading 2 (Scene Break Title) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Scene Break Header (H2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Scene</span>
          </button>

          {/* Heading 3 (Sub-Scene / Verse) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Section Subheading (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Sub</span>
          </button>

          <span className="w-px h-4 bg-border-subtle/50 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("bold")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("italic")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("underline")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("strike")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border-subtle/50 mx-1" />

          {/* Blockquote / Letter */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("blockquote")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Blockquote (Letters, Inscriptions, Decrees)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Scene Break / Divider Ornament */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-card/50 transition-colors cursor-pointer"
            title="Insert Scene Break (Divider)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("orderedList")
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border-subtle/50 mx-1" />

          {/* Alignment Controls */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: "left" })
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: "center" })
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Align Center (Poetry, Chapter Headers)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-card text-accent border border-border-subtle/60 shadow-2xs"
                : "text-text-muted hover:text-text-main hover:bg-card/50"
            }`}
            title="Justify (Classic Novel Layout)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ergonomics & Zen Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Typeface selector */}
          <button
            type="button"
            onClick={() => setEditorFont((f) => (f === "serif" ? "sans" : "serif"))}
            className="px-2 py-1 rounded-lg bg-card/60 hover:bg-card border border-border-subtle/50 text-[11px] font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer flex items-center gap-1"
            title="Switch Editor Typeface"
          >
            <Type className="w-3 h-3 text-accent" />
            <span>{editorFont === "serif" ? "Newsreader" : "Sans"}</span>
          </button>

          {/* Literary Indent toggle */}
          <button
            type="button"
            onClick={() => setIsLiteraryIndent((v) => !v)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              isLiteraryIndent
                ? "bg-accent/10 border-accent text-accent"
                : "bg-card/60 hover:bg-card border-border-subtle/50 text-text-muted hover:text-text-main"
            }`}
            title="Toggle Paragraph Indent (2em)"
          >
            Indent
          </button>

          <span className="w-px h-4 bg-border-subtle/50 mx-0.5" />

          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-card/50 disabled:opacity-30 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-card/50 disabled:opacity-30 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-border-subtle/50 mx-0.5" />

          {/* Fullscreen Zen Mode Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-card/50 cursor-pointer transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Zen Writing Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        className={`flex-1 transition-all ${
          isFullscreen ? "max-w-4xl w-full mx-auto" : "w-full"
        }`}
        style={{
          fontFamily:
            editorFont === "serif"
              ? "'Newsreader', Georgia, serif"
              : "'Plus Jakarta Sans', sans-serif",
          fontSize: "17.5px",
        }}
      >
        <div className={isLiteraryIndent ? "literary-indent" : ""}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Live Status Bar Footer */}
      <div
        className={`bg-tag/40 border-t border-border-subtle/30 px-4 py-2 flex items-center justify-between text-xs text-text-muted select-none ${
          isFullscreen ? "max-w-4xl w-full mx-auto rounded-xl border border-border-subtle/40 mt-3" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <span>
            Words: <strong className="text-text-main">{wordCount.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Characters: <strong className="text-text-main">{charCount.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Reading Time: <strong className="text-accent">~{readingTimeMin} min</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Sparkles className="w-3 h-3 text-accent" />
            Tiptap Pro Editor
          </span>
        </div>
      </div>
    </div>
  );
}
