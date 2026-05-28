import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { saveCharter } from "../../../fetchers/macom-charter/save-charter";
import { getCharterQueryKey } from "../../queries/macom-charter/use-charter";

export function useSaveCharter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCharter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getCharterQueryKey(variables.projectId),
      });
      toast.success("Borrador guardado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error saving charter:", error);
      toast.error(error.message || "Error al guardar el borrador");
    },
  });
}
