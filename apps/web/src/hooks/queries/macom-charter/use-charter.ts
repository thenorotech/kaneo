import { useQuery } from "@tanstack/react-query";
import { getCharter } from "../../../fetchers/macom-charter/get-charter";

export const getCharterQueryKey = (projectId: string) => ["charter", projectId];

export function useCharter(projectId: string) {
  return useQuery({
    queryKey: getCharterQueryKey(projectId),
    queryFn: () => getCharter({ projectId }),
    enabled: !!projectId,
  });
}
