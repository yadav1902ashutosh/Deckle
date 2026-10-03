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
  Compass,
  ChevronRight,
  ChevronDown,
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
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Server feedback
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  // Theme State
  const [activeTheme, setActiveTheme] = useState("parchment");
  const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);
  const mobileThemeRef = React.useRef(null);

  const currentThemeObj = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("deckle_theme") || "parchment";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (mobileThemeRef.current && !mobileThemeRef.current.contains(event.target)) {
        setIsMobileThemeOpen(false);
      }
    }
    if (isMobileThemeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileThemeOpen]);

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    localStorage.setItem("deckle_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }

  function switchTab(toLogin) {
    setIsLoginTab(toLogin);
    setServerError("");
    setServerSuccess("");
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

  return (
    <main className="w-full min-h-screen bg-page text-text-main transition-colors duration-200 flex flex-col justify-center items-center py-10 sm:py-14 md:py-20 px-4 sm:px-6 relative selection:bg-accent/20">
      {/* Subtle decorative ambient glow */}
      <div className="absolute top-1/4 -left-12 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      {/* Unified Compact Card with Generous Breathing Room on Screen */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-[700px] my-auto bg-card rounded-2xl shadow-xl border border-border-subtle/50 overflow-hidden flex flex-col md:flex-row items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Literary Ambiance (Equal 50% width on Desktop, Hidden Mobile) */}
        {/* ========================================================================= */}
        <div className="hidden md:flex md:w-1/2 bg-tag/70 p-5 lg:p-6 flex-col justify-between relative overflow-hidden border-r border-border-subtle/50">
          {/* Subtle concentric line watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <svg
              className="text-accent stroke-current"
              fill="none"
              height="280"
              viewBox="0 0 200 200"
              width="280"
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

          {/* Brand Mark */}
          <div className="relative z-10 space-y-1.5">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-accent-text shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-text-main group-hover:text-accent transition-colors block leading-tight">
                  Deckle
                </span>
                <span className="text-[9.5px] uppercase tracking-widest text-accent font-semibold block">
                  Web Novel Reader
                </span>
              </div>
            </Link>
            <p className="text-[11.5px] text-text-muted leading-relaxed">
              Your peaceful sanctum for serialized fiction and uninterrupted focus.
            </p>
          </div>

          {/* Curated Editorial Quote */}
          <div className="relative z-10 my-3 py-3 px-3.5 bg-card-white/70 backdrop-blur-sm rounded-xl border border-border-subtle/40 shadow-2xs space-y-2">
            <Quote className="w-3.5 h-3.5 text-accent opacity-60" />
            <p className="font-serif text-xs text-text-main italic leading-relaxed">
              “Reading is to the mind what exercise is to the body. Resume right where you paused.”
            </p>
            <div className="flex items-center justify-between text-[10.5px] text-text-muted pt-1.5 border-t border-border-subtle/40">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Session Sync
              </span>
              <span className="font-semibold text-accent uppercase tracking-wider text-[9.5px]">
                Vol. III • Ch. 248
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="relative z-10 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-card/70 p-2 rounded-lg border border-border-subtle/40">
              <span className="text-[9.5px] text-text-muted uppercase tracking-wider block">
                Library Base
              </span>
              <span className="font-serif text-sm font-bold text-accent">
                14,200+
              </span>
              <span className="text-[9.5px] text-text-muted block">
                Novels
              </span>
            </div>
            <div className="bg-card/70 p-2 rounded-lg border border-border-subtle/40">
              <span className="text-[9.5px] text-text-muted uppercase tracking-wider block">
                Cloud Sync
              </span>
              <span className="font-serif text-sm font-bold text-accent">
                0.4s
              </span>
              <span className="text-[9.5px] text-text-muted block">
                Instant Sync
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Form Hub (Equal 50% width on Desktop, Full Mobile)*/}
        {/* ========================================================================= */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-card-white">
          
          {/* Header Bar: Mobile Back & Logo + Tactile Theme Switcher */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-border-subtle/30">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                {/* Mobile Back Arrow */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="md:hidden p-1 rounded-md text-text-muted hover:text-text-main hover:bg-card transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {/* Mobile Brand */}
                <div className="flex items-center gap-1.5 md:hidden min-w-0">
                  <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-accent-text flex-shrink-0">
                    <BookOpen className="w-3 h-3" />
                  </div>
                  <span className="font-serif font-bold text-sm text-text-main truncate">
                    Deckle
                  </span>
                </div>
                {/* Desktop Context Label */}
                <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider text-text-muted truncate">
                  {isLoginTab ? "Sign In to Deckle" : "Create Account"}
                </span>
              </div>

              {/* Tactile Theme Selector: Collapsed single circle + arrow on small screens, expanded on sm+ */}
              <div className="relative flex-shrink-0" ref={mobileThemeRef}>
                {/* 1. Collapsed Mobile Trigger (< sm) */}
                <button
                  type="button"
                  onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
                  className="sm:hidden flex items-center gap-1.5 px-2 py-1 rounded-full bg-tag/70 hover:bg-tag border border-border-subtle/60 shadow-2xs transition-colors cursor-pointer"
                  aria-label="Change theme"
                  aria-expanded={isMobileThemeOpen}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-accent ring-offset-1 ring-offset-card scale-105 shadow-xs flex-shrink-0 transition-all duration-150"
                    style={{
                      backgroundColor: currentThemeObj.canvas,
                      border: `1px solid ${currentThemeObj.border}`,
                    }}
                  />
                  <ChevronDown
                    className={`w-3 h-3 text-text-muted transition-transform duration-200 ${
                      isMobileThemeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Mobile Dropdown Popover */}
                {isMobileThemeOpen && (
                  <div className="sm:hidden absolute right-0 top-full mt-1.5 z-50 p-2 bg-card rounded-xl border border-border-subtle shadow-lg flex flex-col gap-1 min-w-[150px]">
                    <div className="text-[10px] font-semibold text-text-muted px-1.5 py-0.5 uppercase tracking-wider">
                      Themes
                    </div>
                    {THEMES.map((t) => {
                      const isActive = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            handleThemeChange(t.id);
                            setIsMobileThemeOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            isActive
                              ? "bg-accent/15 text-accent font-semibold"
                              : "text-text-main hover:bg-tag/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex-shrink-0 transition-all duration-150 ${
                                isActive
                                  ? "ring-2 ring-accent ring-offset-1 ring-offset-card scale-110 shadow-xs"
                                  : "opacity-75 hover:opacity-100"
                              }`}
                              style={{
                                backgroundColor: t.canvas,
                                border: `1px solid ${t.border}`,
                              }}
                            />
                            <span className="text-[11px] truncate">
                              {t.name.split(" (")[0]}
                            </span>
                          </div>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Expanded Row for Larger Screens (sm:flex) */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tag/60 border border-border-subtle/60 shadow-2xs">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <div className="h-2.5 w-px bg-border-subtle/60 ml-0.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {THEMES.map((t) => {
                      const isActive = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id)}
                          title={t.name}
                          className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-150 ${
                            isActive
                              ? "ring-2 ring-accent ring-offset-1 ring-offset-card-white scale-105 shadow-xs"
                              : "hover:scale-105 opacity-75 hover:opacity-100"
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
            </div>


            {/* Segmented Tab Switcher */}
            <div className="w-full bg-tag p-1 rounded-lg flex items-center mb-4 border border-border-subtle/50">
              <button
                type="button"
                onClick={() => switchTab(true)}
                className={`flex-1 py-1.5 text-center rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
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
                onClick={() => switchTab(false)}
                className={`flex-1 py-1.5 text-center rounded-md text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isLoginTab
                    ? "bg-card-white text-accent shadow-xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>

            {/* Alerts */}
            {serverError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}
            {serverSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{serverSuccess}</span>
              </div>
            )}

            {/* Form Panels */}
            {isLoginTab ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-text-main tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Enter credentials to access your shelf and reading marks.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-main flex items-center justify-between">
                    <span>Email or Username</span>
                    <span className="text-text-muted text-[10px]">Required</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="reader@deckle.com or username"
                      {...loginField("identity", {
                        required: "Please enter your username or email",
                      })}
                      className="w-full pl-8 pr-3 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {loginErrors.identity && (
                    <span className="text-[10px] text-red-500">
                      {loginErrors.identity.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-text-main">
                      Password
                    </label>
                    <span className="text-[10px] text-accent hover:underline cursor-pointer">
                      Forgot?
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      {...loginField("password", {
                        required: "Please enter your password",
                      })}
                      className="w-full pl-8 pr-8 py-2 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-text-muted hover:text-text-main p-1 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <span className="text-[10px] text-red-500">
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
                    <span className="text-[11px] text-text-muted">
                      Remember device for 30 days
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full mt-1.5 py-2.5 bg-accent text-accent-text font-semibold rounded-lg text-xs shadow-xs hover:bg-accent-hover active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 group"
                >
                  <span>
                    {loginSubmitting ? "Verifying..." : "Sign In to Deckle"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-2.5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-text-main tracking-tight">
                    Begin your chronicle
                  </h2>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Curate personal shelves and track reading progress.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-main">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Elena Vance"
                      {...signupField("fullName")}
                      className="w-full px-2.5 py-1.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-main">
                      Username *
                    </label>
                    <input
                      type="text"
                      placeholder="wanderer"
                      {...signupField("username", {
                        required: "Username required",
                        minLength: {
                          value: 3,
                          message: "Min 3 chars",
                        },
                      })}
                      className="w-full px-2.5 py-1.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {signupErrors.username && (
                      <span className="text-[10px] text-red-500 block">
                        {signupErrors.username.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-main">
                    Email Address *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <input
                      type="email"
                      placeholder="reader@deckle.com"
                      {...signupField("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Invalid email",
                        },
                      })}
                      className="w-full pl-8 pr-3 py-1.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {signupErrors.email && (
                    <span className="text-[10px] text-red-500 block">
                      {signupErrors.email.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-main">
                      Password *
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Min 6 chars"
                        {...signupField("password", {
                          required: "Password required",
                          minLength: {
                            value: 6,
                            message: "Min 6 chars",
                          },
                        })}
                        className="w-full pl-7 pr-6 py-1.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-1.5 text-text-muted hover:text-text-main p-0.5 cursor-pointer"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <span className="text-[10px] text-red-500 block">
                        {signupErrors.password.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-main">
                      Confirm *
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                      <input
                        type={showSignupConfirmPassword ? "text" : "password"}
                        placeholder="Repeat"
                        {...signupField("confirmPassword", {
                          required: "Confirm required",
                          validate: (val) =>
                            val === registeredPassword ||
                            "Passwords do not match",
                        })}
                        className="w-full pl-7 pr-6 py-1.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        className="absolute right-1.5 text-text-muted hover:text-text-main p-0.5 cursor-pointer"
                        aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && (
                      <span className="text-[10px] text-red-500 block">
                        {signupErrors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-start gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...signupField("terms", {
                        required: "You must accept the terms",
                      })}
                      className="w-3.5 h-3.5 mt-0.5 rounded bg-input accent-accent cursor-pointer"
                    />
                    <span className="text-[10px] text-text-muted leading-tight">
                      I accept Deckle's Terms and Privacy Charter.
                    </span>
                  </label>
                  {signupErrors.terms && (
                    <span className="text-[10px] text-red-500 block">
                      {signupErrors.terms.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={signupSubmitting}
                  className="w-full mt-1 py-2.5 bg-accent text-accent-text font-semibold rounded-lg text-xs shadow-xs hover:bg-accent-hover active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 group"
                >
                  <span>
                    {signupSubmitting
                      ? "Creating Account..."
                      : "Begin Your Reading Journey"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}
          </div>

          {/* Guest Reader Mode Footer */}
          <div className="mt-4 pt-3 border-t border-border-subtle/50 text-center">
            <Link
              to="/"
              className="w-full py-2 px-3 rounded-lg bg-tag/60 hover:bg-tag border border-border-subtle/40 text-text-muted hover:text-text-main transition-all text-xs flex items-center justify-center gap-1.5 group"
            >
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] truncate">
                Continue reading as Guest (stored locally)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
