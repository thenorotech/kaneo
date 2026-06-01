import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateEsjTicketStage, {
  type UpdateEsjTicketStageRequest,
} from "@/fetchers/esj/update-esj-ticket-stage";

function useUpdateEsjTicketStage(phaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEsjTicketStageRequest) =>
      updateEsjTicketStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-phase-board", phaseId] });
    },
  });
}

export default useUpdateEsjTicketStage;
