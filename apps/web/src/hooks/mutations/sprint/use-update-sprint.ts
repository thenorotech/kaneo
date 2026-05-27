import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSprint } from "../../../fetchers/sprint/update-sprint";
import { getSprintsQueryKey } from "../../queries/sprint/use-sprints";

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSprint,
    onSuccess: (_, variables) => {
      // Assuming you track projectId in variables. If not, invalidate globally.
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}
