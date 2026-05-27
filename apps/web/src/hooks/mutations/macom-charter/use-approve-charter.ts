import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}
