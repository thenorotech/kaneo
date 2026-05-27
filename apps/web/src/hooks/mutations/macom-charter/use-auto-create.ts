import { useMutation, useQueryClient } from "@tanstack/react-query";
import { autoCreateCharterTasks } from "../../../fetchers/macom-charter/auto-create";
import { getSprintsQueryKey } from "../../queries/sprint/use-sprints";

export function useAutoCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: autoCreateCharterTasks,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getSprintsQueryKey(variables.projectId),
      });
      // Invalidate tasks as well since auto-create creates tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
