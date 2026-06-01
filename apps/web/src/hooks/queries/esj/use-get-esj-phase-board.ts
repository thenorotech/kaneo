import { useQuery } from "@tanstack/react-query";
import getEsjPhaseBoard from "@/fetchers/esj/get-esj-phase-board";

function useGetEsjPhaseBoard(phaseId: string, workspaceId: string) {
  return useQuery({
    queryKey: ["esj-phase-board", phaseId],
    queryFn: () => getEsjPhaseBoard(phaseId, workspaceId),
    enabled: !!phaseId && !!workspaceId,
  });
}

export default useGetEsjPhaseBoard;
