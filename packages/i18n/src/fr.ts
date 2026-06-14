import type { Dictionary } from "./types";

// French dictionary. Typed as `Dictionary`, so a missing or misspelled key is a
// compile error — keeping EN/FR in lockstep. French copy is legally required
// (CLAUDE.md §11.5, Bill 96).
export const fr: Dictionary = {
  "nav.home": "Accueil",
  "nav.calendar": "Calendrier",
  "nav.budget": "Budget",
  "nav.entities": "Éléments",
  "nav.settings": "Réglages",

  "home.title": "Accueil",
  "home.needsAttention": "À traiter",
  "home.upcoming": "À venir",
  "home.later": "Plus tard",
  "home.empty": "Vous êtes à jour.",
  "home.weeklyProgress": "{resolved} sur {total} réglés cette semaine",

  "obligation.done": "Fait",
  "obligation.snooze": "Reporter",
  "obligation.dismiss": "Ignorer",
  "obligation.edit": "Modifier",
  "obligation.viewEntity": "Voir l'élément",
  "obligation.automate": "Automatiser",
  "obligation.cancelSubscription": "Annuler l'abonnement",
  "obligation.autoPaid": "Auto-payé",

  "auth.signInTab": "Connexion",
  "auth.signUpTab": "Inscription",
  "auth.email": "Courriel",
  "auth.password": "Mot de passe",
  "auth.emailPlaceholder": "vous@exemple.com",
  "auth.passwordPlaceholder": "••••••••",
  "auth.rememberMe": "Se souvenir de moi",
  "auth.signInCta": "Se connecter",
  "auth.signUpCta": "Créer un compte",
  "auth.switchToSignUp": "Pas encore de compte ? Inscrivez-vous",
  "auth.switchToSignIn": "Vous avez déjà un compte ? Connectez-vous",
  "auth.loading": "Veuillez patienter…",
  "auth.signedIn": "Connecté",
  "auth.accountCreated": "Compte créé",
  "auth.errorMissingFields": "Saisissez votre courriel et votre mot de passe",
  "auth.errorPasswordTooShort": "Le mot de passe doit comporter au moins 6 caractères",

  "common.comingSoon": "Bientôt disponible",
  "common.error": "Une erreur s'est produite",
};
