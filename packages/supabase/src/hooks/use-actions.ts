import type { Obligation } from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { toast, type ToastAction } from "../toast";
import {
  useAutomate,
  useCancelSubscription,
  useDismissObligation,
  useResolveObligation,
  useSnoozeObligation,
  useUpdateObligation,
} from "./use-mutations";

// Toast-wrapped action layer (CLAUDE.md §12). Screens call these instead of the
// raw mutations: each fires localized success feedback and (where reversible) an
// Undo that restores the obligation's prior state. Errors are surfaced by the
// underlying mutations.
export interface ObligationActions {
  onDone: (obligation: Obligation) => void;
  onSnooze: (obligation: Obligation, until: string) => void;
  onDismiss: (obligation: Obligation) => void;
  onAutomate: (obligation: Obligation) => void;
  onCancelSub: (obligation: Obligation) => void;
}

export function useObligationActions(): ObligationActions {
  const { t } = useTranslation();
  const resolve = useResolveObligation();
  const snooze = useSnoozeObligation();
  const dismiss = useDismissObligation();
  const automate = useAutomate();
  const cancelSub = useCancelSubscription();
  const update = useUpdateObligation();

  // Restore the fields a resolve/snooze/dismiss/cancel could have changed. Like
  // the reference, undo doesn't delete a spawned recurrence — it reverts state.
  function undo(o: Obligation): ToastAction {
    return {
      label: t("common.undo"),
      onPress: () =>
        update.mutate({
          id: o.id,
          patch: {
            status: o.status,
            resolved_at: o.resolved_at,
            resolved_method: o.resolved_method,
            snoozed_until: o.snoozed_until,
            recurrence: o.recurrence,
            auto_paid: o.auto_paid,
          },
        }),
    };
  }

  return {
    onDone: (o) =>
      resolve.mutate(o, {
        onSuccess: () =>
          toast.success(t("toast.markedDone"), { description: o.title, action: undo(o) }),
      }),
    onSnooze: (o, until) =>
      snooze.mutate(
        { obligation: o, until },
        {
          onSuccess: () =>
            toast.success(t("toast.snoozed"), { description: o.title, action: undo(o) }),
        },
      ),
    onDismiss: (o) =>
      dismiss.mutate(o, {
        onSuccess: () =>
          toast.success(t("toast.dismissed"), { description: o.title, action: undo(o) }),
      }),
    onAutomate: (o) =>
      automate.mutate(o, {
        onSuccess: () => toast.success(t("toast.automated"), { description: o.title }),
      }),
    onCancelSub: (o) =>
      cancelSub.mutate(o, {
        onSuccess: () =>
          toast.success(t("toast.subCancelled"), { description: o.title, action: undo(o) }),
      }),
  };
}
