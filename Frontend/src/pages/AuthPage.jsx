import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { login } from "../store/authSlice";
import authService from "../services/authService/authService";
import {
  BookOpen,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Quote,
  Cloud,
  Compass,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

// Deckle 5-theme design system palettes
const THEMES = [
  { id: "parchment", name: "Parchment (Warm Paper)", canvas: "#fdf9f0", accent: "#7d4a21", border: "#d6c3b7" },
  { id: "crisp-paper", name: "Crisp Paper (Daylight Clean)", canvas: "#ffffff", accent: "#2563eb", border: "#cbd5e1" },
  { id: "soft-sage", name: "Soft Sage (Eye Care Green)", canvas: "#ebf1ea", accent: "#2e7d32", border: "#b8c8b7" },
  { id: "nocturne", name: "Nocturne (Slate Twilight)", canvas: "#191e24", accent: "#60a5fa", border: "#374353" },
  { id: "midnight", name: "Midnight (OLED Night)", canvas: "#0b0c0e", accent: "#f59e0b", border: "#282c34" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Tab State: true = Sign In, false = Create Account
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState(["Fantasy"]);

  // Server feedback
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  // Theme State
  const [activeTheme, setActiveTheme] = useState("parchment");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("deckle_theme") || "parchment";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    localStorage.setItem("deckle_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }

  // ----------------------------------------------------
  // REACT-HOOK-FORM SETUP
  // ----------------------------------------------------
  const {
    register: loginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
    reset: resetLoginForm,
  } = useForm();

  const {
    register: signupField,
    handleSubmit: handleSignupSubmit,
    watch,
    formState: { errors: signupErrors, isSubmitting: signupSubmitting },
    reset: resetSignupForm,
  } = useForm();

  const registeredPassword = watch("password");

  // Submit: Login
  async function onLogin(data) {
    setServerError("");
    setServerSuccess("");

    try {
      const userData = await authService.login(data.identity, data.password);
      dispatch(login({ userData }));

      setServerSuccess("Welcome back! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setServerError(
        err.message || "Login failed. Please check your credentials.",
      );
    }
  }

  // Submit: Register
  async function onRegister(data) {
    setServerError("");
    setServerSuccess("");

    try {
      await authService.register({
        full_name: data.fullName?.trim() || undefined,
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
      });

      setServerSuccess("Account created successfully! Switching to Sign In...");
      setTimeout(() => {
        setIsLoginTab(true);
        resetLoginForm({ identity: data.email });
        resetSignupForm();
        setServerSuccess("");
      }, 1400);
    } catch (err) {
      setServerError(err.message || "Registration failed.");
    }
  }

  function toggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  const genreList = ["Fantasy", "Xianxia", "Sci-Fi", "Romance", "Mystery"];

  return (
    <main className="w-full min-h-screen bg-page text-text-main transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. MOBILE SCREEN LAYOUT (Visible ONLY on mobile: `< md`)                  */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full pb-10">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 w-full z-40 bg-page/85 backdrop-blur-md border-b border-border-subtle/50 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-card transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-accent-text">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif font-bold text-base text-text-main">
                Deckle
              </span>
            </div>
          </div>
          {/* Tactile Theme Changer (Mobile Header) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tag/80 border border-border-subtle/60 shadow-2xs">
            {THEMES.map((t) => {
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  title={t.name}
                  className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "ring-2 ring-accent ring-offset-1 ring-offset-card scale-110 shadow-xs"
                      : "hover:scale-110 opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: t.canvas,
                    border: `1px solid ${t.border}`,
                  }}
                />
              );
            })}
          </div>
        </header>

        {/* Mobile Content Container */}
        <div className="px-5 pt-5 flex flex-col gap-5 max-w-[360px] mx-auto w-full">
          {/* Top Brand Hero */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-tag flex items-center justify-center mb-3 shadow-sm border border-border-subtle/50">
              <BookOpen className="w-7 h-7 text-accent" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-text-main">
                Deckle
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-accent font-bold px-2 py-0.5 rounded-full bg-tag">
                Reader
              </span>
            </div>
            <p className="text-[11px] text-text-muted uppercase tracking-widest mt-1">
              Web Novel Reader
            </p>
          </div>

          {/* Mode Pill Switcher */}
          <div className="bg-tag p-1 rounded-full flex relative select-none border border-border-subtle/50">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setServerError("");
                setServerSuccess("");
              }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 text-center ${
                isLoginTab
                  ? "bg-accent text-accent-text shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setServerError("");
                setServerSuccess("");
              }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 text-center ${
                !isLoginTab
                  ? "bg-accent text-accent-text shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Mobile Server Alerts */}
          {serverError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          {serverSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverSuccess}</span>
            </div>
          )}

          {/* Mobile Form Panels */}
          {isLoginTab ? (
            /* Mobile Sign In */
            <form
              onSubmit={handleLoginSubmit(onLogin)}
              className="flex flex-col gap-4"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-text-main">
                  Welcome back
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Enter your credentials to access your shelf and bookmarks.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-text-main flex justify-between">
                  <span>Email or Username</span>
                  <span className="text-[10px] text-accent font-medium">
                    Required
                  </span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="alex_writer or reader@deckle.com"
                    {...loginField("identity", {
                      required: "Please enter your username or email",
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {loginErrors.identity && (
                  <span className="text-[11px] text-red-500">
                    {loginErrors.identity.message}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-main">
                    Password
                  </label>
                  <span className="text-[11px] text-accent hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...loginField("password", {
                      required: "Please enter your password",
                    })}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-main p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {loginErrors.password && (
                  <span className="text-[11px] text-red-500">
                    {loginErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full h-12 rounded-xl bg-accent text-accent-text font-semibold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {loginSubmitting ? "Verifying..." : "Sign In to Deckle"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Mobile Register */
            <form
              onSubmit={handleSignupSubmit(onRegister)}
              className="flex flex-col gap-3.5"
            >
              <div>
                <h2 className="font-serif text-2xl font-bold text-text-main">
                  Begin your chronicle
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Create a personal archive to curate shelves and track
                  chapters.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-text-main">
                  Reader Handle / Username *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. wanderer_ink"
                    {...signupField("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {signupErrors.username && (
                  <span className="text-[11px] text-red-500">
                    {signupErrors.username.message}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-text-main">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="email"
                    placeholder="reader@deckle.com"
                    {...signupField("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {signupErrors.email && (
                  <span className="text-[11px] text-red-500">
                    {signupErrors.email.message}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-text-main">
                  Passphrase (min. 6 characters) *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    {...signupField("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {signupErrors.password && (
                  <span className="text-[11px] text-red-500">
                    {signupErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={signupSubmitting}
                className="w-full h-12 rounded-xl bg-accent text-accent-text font-semibold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {signupSubmitting
                    ? "Creating Account..."
                    : "Create Free Sanctum"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Friction-Free Guest Option */}
          <Link
            to="/"
            className="w-full h-12 rounded-xl bg-card border border-border-subtle/40 flex items-center justify-between px-4 text-text-main shadow-sm active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Compass className="w-5 h-5 text-accent" />
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-semibold truncate">
                  Continue as Guest
                </span>
                <span className="text-[10px] text-text-muted truncate">
                  Reading progress stored on this device
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </Link>

          {/* Footnote */}
          <div className="flex flex-col items-center text-center gap-1 text-[11px] text-text-muted pb-4">
            <p className="text-[10px] text-text-muted/80">
              Reader-first typography engine built for deep focus
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP SCREEN LAYOUT (Visible on Tablets & Desktops: `hidden md:flex`) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full min-h-screen flex-col justify-center items-center py-6 sm:py-8 px-4 relative">
        <div className="relative w-full max-w-[740px] flex flex-col items-center">
          {/* Subtle decorative ambient glow */}
          <div className="absolute -top-16 -left-12 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Unified Desktop Card */}
          <div className="relative w-full bg-card rounded-2xl shadow-xl border border-border-subtle/50 overflow-hidden flex flex-row">
            {/* LEFT PANEL: Literary Ambiance */}
            <div className="w-5/12 bg-tag p-4 sm:p-5 md:p-6 flex flex-col justify-between relative overflow-hidden border-r border-border-subtle/50">
              {/* Delicate line art */}
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                <svg
                  className="text-accent stroke-current"
                  fill="none"
                  height="340"
                  viewBox="0 0 200 200"
                  width="340"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    strokeDasharray="2 4"
                    strokeWidth="0.5"
                  />
                  <circle cx="100" cy="100" r="70" strokeWidth="0.75" />
                  <path
                    d="M40 100 C 70 70, 130 70, 160 100"
                    strokeWidth="0.75"
                  />
                  <path
                    d="M40 100 C 70 130, 130 130, 160 100"
                    strokeWidth="0.75"
                  />
                  <line strokeWidth="0.5" x1="100" x2="100" y1="20" y2="180" />
                </svg>
              </div>

              {/* Brand Topmark */}
              <div className="relative z-10 space-y-1.5">
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-text shadow-sm">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold tracking-tight text-text-main group-hover:text-accent transition-colors block leading-none">
                      Deckle
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-accent font-semibold mt-0.5 block">
                      Web Novel Reader
                    </span>
                  </div>
                </Link>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Your peaceful sanctum for serialized fiction and uninterrupted focus.
                </p>
              </div>

              {/* Curated Editorial Quote Section */}
              <div className="relative z-10 my-3.5 bg-card-white/80 backdrop-blur-md p-3.5 rounded-xl border border-border-subtle/50 shadow-2xs space-y-1.5">
                <Quote className="w-4.5 h-4.5 text-accent opacity-60" />
                <p className="font-serif text-[13px] text-text-main italic leading-relaxed">
                  “Reading is to the mind what exercise is to the body. Resume
                  reading right where you paused.”
                </p>
                <div className="flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-border-subtle/40">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Sync Active
                  </span>
                  <span className="font-semibold text-accent uppercase tracking-wider text-[9px]">
                    Vol. III • Ch. 248
                  </span>
                </div>
              </div>

              {/* Reading Metrics */}
              <div className="relative z-10 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-card/70 p-2 rounded-lg border border-border-subtle/40">
                  <span className="text-[9px] text-text-muted uppercase tracking-wider block">
                    Library Base
                  </span>
                  <span className="font-serif text-base font-bold text-accent">
                    14,200+
                  </span>
                  <span className="text-[9px] text-text-muted block">
                    Novels
                  </span>
                </div>
                <div className="bg-card/70 p-2 rounded-lg border border-border-subtle/40">
                  <span className="text-[9px] text-text-muted uppercase tracking-wider block">
                    Cloud Sync
                  </span>
                  <span className="font-serif text-base font-bold text-accent">
                    0.4s
                  </span>
                  <span className="text-[9px] text-text-muted block">
                    Instant
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Interactive Authentication Hub */}
            <div className="w-7/12 p-4 sm:p-5 md:p-6 flex flex-col justify-center bg-card-white">
              {/* Card Header: Context Label & Beautified Tactile Theme Switcher */}
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-border-subtle/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {isLoginTab ? "Sign In to Deckle" : "Create Your Account"}
                </span>

                {/* Tactile Theme Selector Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tag/60 hover:bg-tag/90 border border-border-subtle/60 transition-all shadow-2xs">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[11px] font-semibold tracking-wide">Theme</span>
                  </div>
                  <div className="h-3 w-px bg-border-subtle/60" />
                  <div className="flex items-center gap-1.5">
                    {THEMES.map((t) => {
                      const isActive = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id)}
                          title={t.name}
                          className={`w-4.5 h-4.5 rounded-full cursor-pointer transition-all duration-150 ${
                            isActive
                              ? "ring-2 ring-accent ring-offset-2 ring-offset-card-white scale-110 shadow-xs"
                              : "hover:scale-115 opacity-80 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor: t.canvas,
                            border: `1px solid ${t.border}`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="w-full bg-tag p-1 rounded-lg flex items-center mb-4 border border-border-subtle/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setServerError("");
                    setServerSuccess("");
                  }}
                  className={`flex-1 py-2 text-center rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLoginTab
                      ? "bg-card-white text-accent shadow-xs"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(false);
                    setServerError("");
                    setServerSuccess("");
                  }}
                  className={`flex-1 py-2 text-center rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isLoginTab
                      ? "bg-card-white text-accent shadow-xs"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Account
                </button>
              </div>

              {/* Feedback Alerts */}
              {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}
              {serverSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverSuccess}</span>
                </div>
              )}

              {/* Desktop Sign In Form */}
              {isLoginTab ? (
                <form
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="space-y-3.5"
                >
                  <div>
                    <h2 className="font-serif text-xl font-bold text-text-main tracking-tight">
                      Welcome back
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Enter your credentials to access your personal shelf and bookmarks.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                      <span>Email or Username</span>
                      <span className="text-text-muted font-normal text-[10px]">
                        Required
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="alex_writer or reader@deckle.com"
                        {...loginField("identity", {
                          required: "Please enter your username or email",
                        })}
                        className="w-full pl-9 pr-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    {loginErrors.identity && (
                      <span className="text-[11px] text-red-500">
                        {loginErrors.identity.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-text-main">
                        Password
                      </label>
                      <span className="text-[11px] text-accent hover:underline cursor-pointer">
                        Forgot Password?
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        {...loginField("password", {
                          required: "Please enter your password",
                        })}
                        className="w-full pl-9 pr-9 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-text-muted hover:text-text-main p-1 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <span className="text-[11px] text-red-500">
                        {loginErrors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        defaultChecked
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded bg-input accent-accent cursor-pointer"
                      />
                      <span className="text-xs text-text-muted">
                        Remember my device for 30 days
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full mt-1 py-2.5 bg-accent text-accent-text font-semibold rounded-lg text-xs shadow-xs hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                  >
                    <span>
                      {loginSubmitting ? "Verifying..." : "Continue Reading"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              ) : (
                /* Desktop Create Account Form */
                <form
                  onSubmit={handleSignupSubmit(onRegister)}
                  className="space-y-3.5"
                >
                  <div>
                    <h2 className="font-serif text-xl font-bold text-text-main tracking-tight">
                      Begin your chapter
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure your reading profile to personalize font scales and bookmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-main">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Elena Vance"
                        {...signupField("fullName")}
                        className="w-full px-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-main">
                        Username *
                      </label>
                      <input
                        type="text"
                        placeholder="vance_reads"
                        {...signupField("username", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters",
                          },
                        })}
                        className="w-full px-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      {signupErrors.username && (
                        <span className="text-[11px] text-red-500">
                          {signupErrors.username.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-main">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                      <input
                        type="email"
                        placeholder="elena@example.com"
                        {...signupField("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full pl-9 pr-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    {signupErrors.email && (
                      <span className="text-[11px] text-red-500">
                        {signupErrors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-main">
                        Password *
                      </label>
                      <input
                        type="password"
                        placeholder="At least 6 chars"
                        {...signupField("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Minimum 6 characters",
                          },
                        })}
                        className="w-full px-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      {signupErrors.password && (
                        <span className="text-[11px] text-red-500">
                          {signupErrors.password.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-main">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        placeholder="Repeat password"
                        {...signupField("confirmPassword", {
                          required: "Please confirm password",
                          validate: (val) =>
                            val === registeredPassword ||
                            "Passwords do not match",
                        })}
                        className="w-full px-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      {signupErrors.confirmPassword && (
                        <span className="text-[11px] text-red-500">
                          {signupErrors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reading Affinities Genre Tags (From Stitch) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                      <span>Select Reading Affinities</span>
                      <span className="text-[11px] text-text-muted">
                        Optional
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {genreList.map((genre) => {
                        const active = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              active
                                ? "bg-accent/15 text-accent"
                                : "bg-tag text-text-muted hover:text-text-main"
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...signupField("terms", {
                          required: "You must accept the terms",
                        })}
                        className="w-3.5 h-3.5 mt-0.5 rounded bg-input accent-accent cursor-pointer"
                      />
                      <span className="text-[11px] text-text-muted leading-snug">
                        I accept Deckle's Terms of Service and acknowledge the
                        Privacy Charter.
                      </span>
                    </label>
                    {signupErrors.terms && (
                      <span className="text-[11px] text-red-500 block">
                        {signupErrors.terms.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={signupSubmitting}
                    className="w-full mt-1 py-2.5 bg-accent text-accent-text font-semibold rounded-lg text-xs shadow-xs hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                  >
                    <span>
                      {signupSubmitting
                        ? "Creating Account..."
                        : "Begin Your Reading Journey"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}

              {/* Guest Reader Mode */}
              <div className="mt-4 pt-3 border-t border-border-subtle/50 text-center">
                <Link
                  to="/"
                  className="w-full py-2 px-3 rounded-lg bg-tag/70 hover:bg-tag border border-border-subtle/40 text-text-muted hover:text-text-main transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-accent" />
                  <span>
                    Continue reading as Guest (reading history saved locally) →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Micro Privacy Footnote */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-text-muted text-[11px]">
            <span>🔒 256-bit encrypted telemetry</span>
            <span>•</span>
            <span>No tracker analytics or intrusive pop-ups</span>
            <span>•</span>
            <span>Reader-first typography engine</span>
          </div>
        </div>
      </div>
    </main>
  );
}
