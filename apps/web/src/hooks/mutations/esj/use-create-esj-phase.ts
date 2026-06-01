import { useMutation, useQueryClient } from "@tanstack/react-query";
import createEsjPhase, {
  type CreateEsjPhaseRequest,
} from "@/fetchers/esj/create-esj-phase";

function useCreateEsjPhase(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEsjPhaseRequest) => createEsjPhase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-project", projectId] });
    },
  });
}

export default useCreateEsjPhase;
