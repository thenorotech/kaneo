import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSprint } from "../../../fetchers/sprint/create-sprint";
import { getSprintsQueryKey } from "../../queries/sprint/use-sprints";

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSprint,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getSprintsQueryKey(variables.projectId),
      });
    },
  });
}
