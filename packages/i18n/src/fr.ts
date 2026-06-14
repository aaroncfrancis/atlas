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

  "settings.language": "Langue",
  // Endonyms — each language shown in its own name, identical across dictionaries.
  "settings.languageEnglish": "English",
  "settings.languageFrench": "Français",

  "common.comingSoon": "Bientôt disponible",
  "common.error": "Une erreur s'est produite",
  "common.undo": "Annuler",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.all": "Tout",

  // Toast feedback (the toast-wrapped action layer, CLAUDE.md §12)
  "toast.markedDone": "Marqué comme fait",
  "toast.snoozed": "Reporté",
  "toast.dismissed": "Ignoré",
  "toast.automated": "Automatisé",
  "toast.subCancelled": "Abonnement annulé",
  "toast.saved": "Obligation enregistrée",
  "toast.updated": "Obligation mise à jour",
  "toast.added": "Obligation ajoutée",

  // Relative due-date labels (mapped from @atlas/core DueLabel)
  "due.overdue": "En retard de {n} jours",
  "due.overdueOne": "En retard de 1 jour",
  "due.today": "Dû aujourd'hui",
  "due.tomorrow": "Dû demain",
  "due.inDays": "Dans {n} jours",
  "due.noDate": "Aucune date",
  "due.snoozedUntil": "Reporté au {date}",

  // Calendar
  "cal.title": "Calendrier",
  "cal.subtitle": "Tout ce qui est sur votre radar.",
  "cal.week": "Semaine",
  "cal.month": "Mois",
  "cal.today": "Aujourd'hui",
  "cal.sumItems": "obligations",
  "cal.sumDue": "à payer",
  "cal.sumAttention": "à traiter",
  "cal.snoozeTomorrow": "Demain",
  "cal.snoozeNextWeek": "La semaine prochaine",
  "cal.snoozeInMonth": "Dans un mois",

  // Budget
  "bud.title": "Budget",
  "bud.subtitle": "Prévu vs. payé cette période.",
  "bud.planned": "Prévu",
  "bud.paid": "Payé",
  "bud.committed": "Engagé",
  "bud.byEntity": "Par élément",
  "bud.spendTrend": "Tendance des dépenses",
  "bud.6mo": "6 m",
  "bud.12mo": "12 m",
  "bud.noSpend": "Aucune dépense pour cette période.",
  "bud.total": "Total",
  "bud.periodMonth": "Mois",
  "bud.periodWeek": "Semaine",
  "bud.avgMonth": "{amount}/mois en moy.",

  // History
  "hist.title": "Historique",
  "hist.subtitle": "Tout ce que vous avez réglé.",
  "hist.searchPlaceholder": "Rechercher dans l'historique",
  "hist.allEntities": "Tous les éléments",
  "hist.paidOn": "Réglé le {date}",
  "hist.statusPaid": "Payé",
  "hist.statusAutomated": "Automatisé",
  "hist.statusDismissed": "Ignoré",
  "hist.empty": "Rien pour l'instant.",

  // Entities list + detail
  "entity.title": "Votre carte de vie",
  "entity.subtitle": "Tout ce que vous gardez en orbite.",
  "entity.add": "Ajouter",
  "entity.openObligations": "Obligations ouvertes",
  "entity.documents": "Documents",
  "entity.noObligations": "Rien d'ouvert ici.",
  "entity.openCount": "{n} ouvertes",
  "entity.notFound": "Élément introuvable.",

  // Obligation detail
  "obd.back": "Retour",
  "obd.type": "Type",
  "obd.due": "Échéance",
  "obd.amount": "Montant",
  "obd.status": "Statut",
  "obd.activity": "Activité",
  "obd.receipts": "Reçus",
  "obd.created": "Créé le {date}",
  "obd.automated": "Automatisé",
  "obd.markDone": "Marquer comme fait",
  "obd.notFound": "Obligation introuvable.",

  // Obligation form (add / edit)
  "form.title": "Nouvelle obligation",
  "form.editTitle": "Modifier l'obligation",
  "form.fTitle": "Titre",
  "form.entity": "Élément",
  "form.noEntity": "Aucun élément",
  "form.type": "Type",
  "form.amount": "Montant",
  "form.currency": "Devise",
  "form.dueDate": "Date d'échéance",
  "form.subSection": "Abonnement",
  "form.recurrence": "Récurrence",
  "form.autoPaid": "Auto-payé",
  "form.payingAccount": "Compte payeur",
  "form.payingPlaceholder": "Visa •4242",
  "form.description": "Notes",

  // Obligation type labels
  "type.bill": "Facture",
  "type.renewal": "Renouvellement",
  "type.appointment": "Rendez-vous",
  "type.deadline": "Échéance",
  "type.task": "Tâche",

  // Recurrence labels
  "rec.none": "Ponctuel",
  "rec.weekly": "Hebdomadaire",
  "rec.biweekly": "Aux deux semaines",
  "rec.monthly": "Mensuel",
  "rec.quarterly": "Trimestriel",
  "rec.yearly": "Annuel",

  // Status labels
  "status.open": "Ouvert",
  "status.done": "Fait",
  "status.snoozed": "Reporté",
  "status.dismissed": "Ignoré",
  "status.automated": "Automatisé",

  // Activity-timeline event labels
  "event.created": "Créé",
  "event.resolved": "Réglé",
  "event.snoozed": "Reporté",
  "event.automated": "Automatisé",
  "event.dismissed": "Ignoré",
};
