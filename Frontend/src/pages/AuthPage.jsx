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

  // Password Visibility
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
  // REACT-HOOK-FORM HOOKS: SEPARATED TO PREVENT COLLISION
  // ----------------------------------------------------
  // 1. Mobile Forms
  const {
    register: loginFieldMobile,
    handleSubmit: handleLoginSubmitMobile,
    formState: { errors: loginErrorsMobile, isSubmitting: loginSubmittingMobile },
    reset: resetLoginFormMobile,
  } = useForm();

  const {
    register: signupFieldMobile,
    handleSubmit: handleSignupSubmitMobile,
    watch: watchSignupMobile,
    formState: { errors: signupErrorsMobile, isSubmitting: signupSubmittingMobile },
    reset: resetSignupFormMobile,
  } = useForm();

  const registeredPasswordMobile = watchSignupMobile("password");

  // 2. Desktop Forms
  const {
    register: loginFieldDesktop,
    handleSubmit: handleLoginSubmitDesktop,
    formState: { errors: loginErrorsDesktop, isSubmitting: loginSubmittingDesktop },
    reset: resetLoginFormDesktop,
  } = useForm();

  const {
    register: signupFieldDesktop,
    handleSubmit: handleSignupSubmitDesktop,
    watch: watchSignupDesktop,
    formState: { errors: signupErrorsDesktop, isSubmitting: signupSubmittingDesktop },
    reset: resetSignupFormDesktop,
  } = useForm();

  const registeredPasswordDesktop = watchSignupDesktop("password");

  // Submit: Login (shared API logic)
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

  // Submit: Register (shared API logic)
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
        resetLoginFormMobile({ identity: data.email });
        resetLoginFormDesktop({ identity: data.email });
        resetSignupFormMobile();
        resetSignupFormDesktop();
        setServerSuccess("");
      }, 1400);
    } catch (err) {
      setServerError(err.message || "Registration failed.");
    }
  }

  return (
    <main className="w-full min-h-screen bg-page text-text-main transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE SCREEN LAYOUT (Requested full mobile design: `block md:hidden`) */}
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

          {/* Tactile Theme Changer with Collapsed Glow Trigger & Popover */}
          <div className="relative" ref={mobileThemeRef}>
            <button
              type="button"
              onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tag/80 hover:bg-tag border border-border-subtle/60 shadow-2xs transition-colors cursor-pointer"
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
                className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                  isMobileThemeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mobile Dropdown Popover */}
            {isMobileThemeOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 p-2 bg-card rounded-xl border border-border-subtle shadow-lg flex flex-col gap-1 min-w-[150px]">
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
          </div>
        </header>

        {/* Mobile Content Container */}
        <div className="px-4 pt-6 flex flex-col gap-6 max-w-md mx-auto w-full">
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
              onClick={() => switchTab(true)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 text-center cursor-pointer ${
                isLoginTab
                  ? "bg-accent text-accent-text shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab(false)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 text-center cursor-pointer ${
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
              onSubmit={handleLoginSubmitMobile(onLogin)}
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
                    {...loginFieldMobile("identity", {
                      required: "Please enter your username or email",
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {loginErrorsMobile.identity && (
                  <span className="text-[11px] text-red-500">
                    {loginErrorsMobile.identity.message}
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
                    {...loginFieldMobile("password", {
                      required: "Please enter your password",
                    })}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-main p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {loginErrorsMobile.password && (
                  <span className="text-[11px] text-red-500">
                    {loginErrorsMobile.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loginSubmittingMobile}
                className="w-full h-12 rounded-xl bg-accent text-accent-text font-semibold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {loginSubmittingMobile ? "Verifying..." : "Sign In to Deckle"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Mobile Register */
            <form
              onSubmit={handleSignupSubmitMobile(onRegister)}
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
                    {...signupFieldMobile("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {signupErrorsMobile.username && (
                  <span className="text-[11px] text-red-500">
                    {signupErrorsMobile.username.message}
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
                    {...signupFieldMobile("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {signupErrorsMobile.email && (
                  <span className="text-[11px] text-red-500">
                    {signupErrorsMobile.email.message}
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
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...signupFieldMobile("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-main p-1 cursor-pointer"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {signupErrorsMobile.password && (
                  <span className="text-[11px] text-red-500">
                    {signupErrorsMobile.password.message}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-text-main">
                  Confirm Passphrase *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type={showSignupConfirmPassword ? "text" : "password"}
                    placeholder="Repeat passphrase"
                    {...signupFieldMobile("confirmPassword", {
                      required: "Please confirm password",
                      validate: (val) =>
                        val === registeredPasswordMobile ||
                        "Passwords do not match",
                    })}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-input text-text-main border border-border-subtle/60 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-main p-1 cursor-pointer"
                    aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {signupErrorsMobile.confirmPassword && (
                  <span className="text-[11px] text-red-500">
                    {signupErrorsMobile.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={signupSubmittingMobile}
                className="w-full h-12 rounded-xl bg-accent text-accent-text font-semibold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>
                  {signupSubmittingMobile
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

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP SCREEN LAYOUT (Responsive scaling complying with reference)     */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full min-h-screen flex-col justify-center items-center py-6 md:py-8 lg:py-12 px-4 sm:px-6 md:px-8 relative selection:bg-accent/20">
        <div className="relative w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl flex flex-col items-center">
          
          {/* Subtle decorative ambient glow (contained) */}
          <div className="absolute -top-16 -left-12 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Main Unified Authentication Card with 5/12 and 7/12 Proportions */}
          <div className="relative w-full bg-card rounded-xl lg:rounded-2xl shadow-xl border border-border-subtle/50 overflow-hidden flex flex-row items-stretch">
            
            {/* LEFT PANEL: Literary Ambiance & Atmospheric Banner (5/12) */}
            <div className="w-5/12 bg-tag/80 p-5 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-between relative overflow-hidden border-r border-border-subtle/50">
              
              {/* Delicate line art watermark */}
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                <svg
                  className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] text-accent stroke-current"
                  fill="none"
                  viewBox="0 0 200 200"
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
              <div className="relative z-10 space-y-1.5 md:space-y-2">
                <Link to="/" className="inline-flex items-center gap-2.5 md:gap-3 group">
                  <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-accent flex items-center justify-center text-accent-text shadow-sm">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <span className="font-serif text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-text-main group-hover:text-accent transition-colors block leading-none">
                      Deckle
                    </span>
                    <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-accent font-semibold mt-1 block">
                      Web Novel Reader
                    </span>
                  </div>
                </Link>
                <p className="text-xs md:text-sm text-text-muted mt-1.5 md:mt-2 leading-relaxed">
                  Your peaceful sanctum for serialized fiction and uninterrupted focus.
                </p>
              </div>

              {/* Curated Editorial Quote Section */}
              <div className="relative z-10 my-4 md:my-6 lg:my-8 bg-card-white/80 backdrop-blur-md p-4 md:p-5 lg:p-6 rounded-xl border border-border-subtle/50 shadow-sm space-y-2.5 md:space-y-3">
                <Quote className="w-5 h-5 lg:w-7 lg:h-7 text-accent opacity-60" />
                <p className="font-serif text-sm md:text-base lg:text-lg text-text-main italic leading-relaxed">
                  “Reading is to the mind what exercise is to the body. Resume reading right where you paused.”
                </p>
                <div className="flex items-center justify-between text-xs md:text-sm text-text-muted pt-2.5 lg:pt-3 border-t border-border-subtle/40">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Session Sync Active
                  </span>
                  <span className="font-semibold text-accent uppercase tracking-wider text-[10px] md:text-xs">
                    Vol. III • Ch. 248
                  </span>
                </div>
              </div>

              {/* Reading Metrics Highlights */}
              <div className="relative z-10 grid grid-cols-2 gap-2.5 md:gap-3 text-xs md:text-sm">
                <div className="bg-card/70 p-2.5 md:p-3 lg:p-3.5 rounded-lg border border-border-subtle/40">
                  <span className="text-[10px] md:text-[11px] text-text-muted uppercase tracking-wider block">
                    Library Base
                  </span>
                  <span className="font-serif text-base md:text-lg lg:text-xl font-bold text-accent">
                    14,200+
                  </span>
                  <span className="text-[10px] md:text-[11px] text-text-muted block">
                    Translated Web Novels
                  </span>
                </div>
                <div className="bg-card/70 p-2.5 md:p-3 lg:p-3.5 rounded-lg border border-border-subtle/40">
                  <span className="text-[10px] md:text-[11px] text-text-muted uppercase tracking-wider block">
                    Cloud Footprint
                  </span>
                  <span className="font-serif text-base md:text-lg lg:text-xl font-bold text-accent">
                    0.4s
                  </span>
                  <span className="text-[10px] md:text-[11px] text-text-muted block">
                    Instant Cross-Device Sync
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Interactive Authentication Hub (7/12) */}
            <div className="w-7/12 p-5 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-center bg-card-white">
              
              {/* Header Bar: Context Label + Tactile Theme Switcher */}
              <div className="flex items-center justify-between gap-2 mb-4 md:mb-5 pb-2.5 md:pb-3 border-b border-border-subtle/30">
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-text-muted truncate">
                  {isLoginTab ? "Sign In to Deckle" : "Create Account"}
                </span>

                {/* Tactile Theme Selector Pill */}
                <div className="flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-tag/60 hover:bg-tag/90 border border-border-subtle/60 transition-all shadow-2xs">
                  <div className="flex items-center gap-1 md:gap-1.5 text-text-muted">
                    <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />
                    <span className="text-[11px] md:text-xs font-semibold tracking-wide">Theme</span>
                  </div>
                  <div className="h-2.5 md:h-3 w-px bg-border-subtle/60 ml-0.5" />
                  <div className="flex items-center gap-1 md:gap-1.5">
                    {THEMES.map((t) => {
                      const isActive = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id)}
                          title={t.name}
                          className={`w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 rounded-full cursor-pointer transition-all duration-150 ${
                            isActive
                              ? "ring-2 ring-accent ring-offset-2 ring-offset-card-white scale-110 shadow-xs"
                              : "hover:scale-115 opacity-75 hover:opacity-100"
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
              <div className="w-full bg-tag p-1 rounded-xl flex items-center mb-4 md:mb-6 border border-border-subtle/50">
                <button
                  type="button"
                  onClick={() => switchTab(true)}
                  className={`flex-1 py-2 md:py-2.5 text-center rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLoginTab
                      ? "bg-card-white text-accent shadow-xs"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab(false)}
                  className={`flex-1 py-2 md:py-2.5 text-center rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isLoginTab
                      ? "bg-card-white text-accent shadow-xs"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Create Account
                </button>
              </div>

              {/* Feedback Alerts */}
              {serverError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs md:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}
              {serverSuccess && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs md:text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverSuccess}</span>
                </div>
              )}

              {/* Desktop Form Panels */}
              {isLoginTab ? (
                /* DESKTOP SIGN IN FORM */
                <form onSubmit={handleLoginSubmitDesktop(onLogin)} className="space-y-3.5 md:space-y-4">
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-text-main tracking-tight">
                      Welcome back
                    </h2>
                    <p className="text-xs md:text-sm text-text-muted mt-1">
                      Enter your credentials to access your personal shelf and bookmarks.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-semibold text-text-main flex items-center justify-between">
                      <span>Email or Username</span>
                      <span className="text-text-muted font-normal text-[11px] md:text-xs">Required</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="alex_writer or reader@deckle.com"
                        {...loginFieldDesktop("identity", {
                          required: "Please enter your username or email",
                        })}
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    {loginErrorsDesktop.identity && (
                      <span className="text-[11px] md:text-xs text-red-500">
                        {loginErrorsDesktop.identity.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm font-semibold text-text-main">
                        Password
                      </label>
                      <span className="text-[11px] md:text-xs text-accent hover:underline cursor-pointer">
                        Forgot Password?
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        {...loginFieldDesktop("password", {
                          required: "Please enter your password",
                        })}
                        className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 md:right-3 text-text-muted hover:text-text-main p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {loginErrorsDesktop.password && (
                      <span className="text-[11px] md:text-xs text-red-500">
                        {loginErrorsDesktop.password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-0.5 md:pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        defaultChecked
                        type="checkbox"
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded bg-input accent-accent cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-text-muted">
                        Remember my device for 30 days
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loginSubmittingDesktop}
                    className="w-full mt-2 py-2.5 md:py-3 bg-accent text-accent-text font-semibold rounded-lg text-xs md:text-sm shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                  >
                    <span>
                      {loginSubmittingDesktop ? "Verifying..." : "Sign In to Deckle"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              ) : (
                /* DESKTOP CREATE ACCOUNT FORM */
                <form onSubmit={handleSignupSubmitDesktop(onRegister)} className="space-y-3 md:space-y-3.5">
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-text-main tracking-tight">
                      Begin your chapter
                    </h2>
                    <p className="text-xs md:text-sm text-text-muted mt-1">
                      Configure your reading profile to personalize font scales and bookmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs md:text-sm font-semibold text-text-main">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Elena Vance"
                        {...signupFieldDesktop("fullName")}
                        className="w-full px-3 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs md:text-sm font-semibold text-text-main">
                        Username *
                      </label>
                      <input
                        type="text"
                        placeholder="vance_reads"
                        {...signupFieldDesktop("username", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters",
                          },
                        })}
                        className="w-full px-3 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      {signupErrorsDesktop.username && (
                        <span className="text-[11px] md:text-xs text-red-500 block">
                          {signupErrorsDesktop.username.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-semibold text-text-main">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
                      <input
                        type="email"
                        placeholder="elena@example.com"
                        {...signupFieldDesktop("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    {signupErrorsDesktop.email && (
                      <span className="text-[11px] md:text-xs text-red-500 block">
                        {signupErrorsDesktop.email.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs md:text-sm font-semibold text-text-main">
                        Password *
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-2.5 md:left-3 w-3.5 h-3.5 md:w-4 md:h-4 text-text-muted pointer-events-none" />
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Min 6 chars"
                          {...signupFieldDesktop("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "Minimum 6 characters",
                            },
                          })}
                          className="w-full pl-8 md:pl-9 pr-7 md:pr-8 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2 md:right-2.5 text-text-muted hover:text-text-main p-0.5 cursor-pointer"
                          aria-label={showSignupPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </button>
                      </div>
                      {signupErrorsDesktop.password && (
                        <span className="text-[11px] md:text-xs text-red-500 block">
                          {signupErrorsDesktop.password.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs md:text-sm font-semibold text-text-main">
                        Confirm Password *
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-2.5 md:left-3 w-3.5 h-3.5 md:w-4 md:h-4 text-text-muted pointer-events-none" />
                        <input
                          type={showSignupConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          {...signupFieldDesktop("confirmPassword", {
                            required: "Please confirm password",
                            validate: (val) =>
                              val === registeredPasswordDesktop ||
                              "Passwords do not match",
                          })}
                          className="w-full pl-8 md:pl-9 pr-7 md:pr-8 py-2 md:py-2.5 bg-input text-text-main rounded-lg border border-border-subtle/60 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                          className="absolute right-2 md:right-2.5 text-text-muted hover:text-text-main p-0.5 cursor-pointer"
                          aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupConfirmPassword ? (
                            <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </button>
                      </div>
                      {signupErrorsDesktop.confirmPassword && (
                        <span className="text-[11px] md:text-xs text-red-500 block">
                          {signupErrorsDesktop.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-0.5 md:pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...signupFieldDesktop("terms", {
                          required: "You must accept the terms",
                        })}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 rounded bg-input accent-accent cursor-pointer"
                      />
                      <span className="text-[11px] md:text-xs text-text-muted leading-snug">
                        I accept Deckle's Terms of Service and acknowledge the Privacy Charter.
                      </span>
                    </label>
                    {signupErrorsDesktop.terms && (
                      <span className="text-[11px] md:text-xs text-red-500 block">
                        {signupErrorsDesktop.terms.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={signupSubmittingDesktop}
                    className="w-full mt-2 py-2.5 md:py-3 bg-accent text-accent-text font-semibold rounded-lg text-xs md:text-sm shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                  >
                    <span>
                      {signupSubmittingDesktop
                        ? "Creating Account..."
                        : "Begin Your Reading Journey"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}

              {/* Guest Reader Mode */}
              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-border-subtle/50 text-center">
                <Link
                  to="/"
                  className="w-full py-2 md:py-2.5 px-3 rounded-lg bg-tag/70 hover:bg-tag border border-border-subtle/40 text-text-muted hover:text-text-main transition-all text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-accent" />
                  <span>
                    Continue reading as Guest (reading history saved locally) →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
