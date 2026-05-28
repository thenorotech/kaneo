import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { returnCharter } from "../../../fetchers/macom-charter/return-charter";
import { getCharterQueryKey } from "../../queries/macom-charter/use-charter";

export function useReturnCharter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnCharter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getCharterQueryKey(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Charter devuelto a borrador");
    },
    onError: (error: Error) => {
      console.error("Error returning charter:", error);
      toast.error(error.message || "Error al devolver el Charter");
    },
  });
}
