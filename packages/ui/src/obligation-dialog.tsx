import { Modal, Pressable, View } from "react-native";
import type { Entity, Obligation } from "@atlas/core";
import { ObligationRow, type ObligationRowActions } from "./obligation-row";

// Inline obligation dialog (CLAUDE.md §3) — the Calendar/History tap target.
// Presents the expanded ObligationRow in a modal; any action also closes it so
// the user lands back on the list.
export interface ObligationDialogProps {
  obligation: Obligation | null;
  entity?: Entity | null;
  actions: ObligationRowActions;
  onEdit?: (obligation: Obligation) => void;
  onViewEntity?: (entityId: string) => void;
  onClose: () => void;
}

export function ObligationDialog({
  obligation,
  entity = null,
  actions,
  onEdit,
  onViewEntity,
  onClose,
}: ObligationDialogProps) {
  // Wrap each action so it runs, then dismisses the dialog.
  const wrapped: ObligationRowActions = {
    onDone: (o) => {
      actions.onDone(o);
      onClose();
    },
    onSnooze: (o, until) => {
      actions.onSnooze(o, until);
      onClose();
    },
    onDismiss: (o) => {
      actions.onDismiss(o);
      onClose();
    },
    onAutomate: actions.onAutomate
      ? (o) => {
          actions.onAutomate?.(o);
          onClose();
        }
      : undefined,
    onCancelSub: (o) => {
      actions.onCancelSub(o);
      onClose();
    },
  };

  return (
    <Modal
      visible={obligation !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-center bg-black/40 px-4" onPress={onClose}>
        <Pressable onPress={() => undefined}>
          {obligation !== null ? (
            <View>
              <ObligationRow
                obligation={obligation}
                entity={entity}
                actions={wrapped}
                onEdit={
                  onEdit
                    ? (o) => {
                        onClose();
                        onEdit(o);
                      }
                    : undefined
                }
                onViewEntity={
                  onViewEntity
                    ? (id) => {
                        onClose();
                        onViewEntity(id);
                      }
                    : undefined
                }
                defaultExpanded
              />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
