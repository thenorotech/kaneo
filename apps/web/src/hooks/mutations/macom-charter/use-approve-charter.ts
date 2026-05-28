import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { approveCharter } from "../../../fetchers/macom-charter/approve-charter";
import { getCharterQueryKey } from "../../queries/macom-charter/use-charter";

export function useApproveCharter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCharter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getCharterQueryKey(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Charter aprobado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error approving charter:", error);
      toast.error(error.message || "Error al aprobar el Charter");
    },
  });
}
