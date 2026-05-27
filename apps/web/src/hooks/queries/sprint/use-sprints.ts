import { useQuery } from "@tanstack/react-query";
import { listSprints } from "../../../fetchers/sprint/list-sprints";

export const getSprintsQueryKey = (projectId: string) => ["sprints", projectId];

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: getSprintsQueryKey(projectId),
    queryFn: () => listSprints({ projectId }),
    enabled: !!projectId,
  });
}
