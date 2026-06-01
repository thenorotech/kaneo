import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateEsjPhaseStatus, {
  type UpdateEsjPhaseStatusRequest,
} from "@/fetchers/esj/update-esj-phase-status";

function useUpdateEsjPhaseStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEsjPhaseStatusRequest) =>
      updateEsjPhaseStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-project", projectId] });
    },
  });
}

export default useUpdateEsjPhaseStatus;
