import { useMutation, useQueryClient } from "@tanstack/react-query";
import createEsjPhaseTicket, {
  type CreateEsjPhaseTicketRequest,
} from "@/fetchers/esj/create-esj-phase-ticket";

function useCreateEsjPhaseTicket(phaseId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEsjPhaseTicketRequest) =>
      createEsjPhaseTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esj-phase-board", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["esj-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export default useCreateEsjPhaseTicket;
