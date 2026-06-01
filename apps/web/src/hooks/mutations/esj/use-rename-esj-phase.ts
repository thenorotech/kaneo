import { useMutation, useQueryClient } from "@tanstack/react-query";
import renameEsjPhase, {
  type RenameEsjPhaseRequest,
} from "@/fetchers/esj/rename-esj-phase";

function useRenameEsjPhase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RenameEsjPhaseRequest) => renameEsjPhase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-project", projectId] });
    },
  });
}

export default useRenameEsjPhase;
