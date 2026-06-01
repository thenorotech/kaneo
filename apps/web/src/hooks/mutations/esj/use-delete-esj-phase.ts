import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteEsjPhase, {
  type DeleteEsjPhaseRequest,
} from "@/fetchers/esj/delete-esj-phase";

function useDeleteEsjPhase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteEsjPhaseRequest) => deleteEsjPhase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-project", projectId] });
    },
  });
}

export default useDeleteEsjPhase;
