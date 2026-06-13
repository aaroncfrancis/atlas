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

  "common.comingSoon": "Bientôt disponible",
  "common.error": "Une erreur s'est produite",
};
