import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}
