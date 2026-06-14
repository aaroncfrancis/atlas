import { useState } from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { colorTokens } from "@atlas/config";
import { useTranslation } from "@atlas/i18n";
import { toast, useCreateObligation, useEntities } from "@atlas/supabase";
import { ObligationFormSheet, type ObligationFormValues } from "@atlas/ui";
import { formToInsert } from "../lib/obligation-form";

// Floating add-obligation button + form sheet (CLAUDE.md §3 AddFab). Reused on
// Home, Entities, and entity detail; pass an entity to preselect it.
export function AddObligationFab({ defaultEntityId = null }: { defaultEntityId?: string | null }) {
  const { t } = useTranslation();
  const { data: entities = [] } = useEntities();
  const create = useCreateObligation();
  const [open, setOpen] = useState(false);

  function handleSubmit(values: ObligationFormValues) {
    create.mutate(formToInsert(values), {
      onSuccess: () => toast.success(t("toast.added")),
    });
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("form.title")}
        onPress={() => setOpen(true)}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-teal"
        style={{ elevation: 6, shadowColor: colorTokens.foreground, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Plus size={26} color={colorTokens.card} />
      </Pressable>
      <ObligationFormSheet
        visible={open}
        onClose={() => setOpen(false)}
        entities={entities}
        defaultEntityId={defaultEntityId}
        onSubmit={handleSubmit}
      />
    </>
  );
}
