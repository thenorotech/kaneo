import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSprint } from "../../../fetchers/sprint/update-sprint";

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSprint,
    onSuccess: (_, _variables) => {
      // Assuming you track projectId in variables. If not, invalidate globally.
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}
