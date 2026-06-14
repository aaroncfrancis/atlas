// English dictionary. This is the canonical key set; `fr` must match it exactly
// (enforced by the `Dictionary` type). EN/FR parity is required on every screen
// (CLAUDE.md §9, §11.5 — Bill 96). `{name}` placeholders are filled by `t(...)`.
export const en = {
  "nav.home": "Home",
  "nav.calendar": "Calendar",
  "nav.budget": "Budget",
  "nav.entities": "Entities",
  "nav.settings": "Settings",

  "home.title": "Home",
  "home.needsAttention": "Needs attention",
  "home.upcoming": "Upcoming",
  "home.later": "Later",
  "home.empty": "You're all caught up.",
  "home.weeklyProgress": "{resolved} of {total} resolved this week",

  "obligation.done": "Done",
  "obligation.snooze": "Snooze",
  "obligation.dismiss": "Dismiss",
  "obligation.edit": "Edit",
  "obligation.viewEntity": "View entity",
  "obligation.automate": "Automate",
  "obligation.cancelSubscription": "Cancel subscription",
  "obligation.autoPaid": "Auto-paid",

  "auth.signInTab": "Sign in",
  "auth.signUpTab": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.emailPlaceholder": "you@example.com",
  "auth.passwordPlaceholder": "••••••••",
  "auth.rememberMe": "Remember me",
  "auth.signInCta": "Sign in",
  "auth.signUpCta": "Create account",
  "auth.switchToSignUp": "Don't have an account? Sign up",
  "auth.switchToSignIn": "Already have an account? Sign in",
  "auth.loading": "Please wait…",
  "auth.signedIn": "Signed in",
  "auth.accountCreated": "Account created",
  "auth.errorMissingFields": "Enter your email and password",
  "auth.errorPasswordTooShort": "Password must be at least 6 characters",

  "settings.language": "Language",
  "settings.languageEnglish": "English",
  "settings.languageFrench": "Français",

  "common.comingSoon": "Coming soon",
  "common.error": "Something went wrong",
} as const;
