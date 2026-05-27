import { useQuery } from "@tanstack/react-query";
import { getCharterVersions } from "../../../fetchers/macom-charter/get-versions";

export const getCharterVersionsQueryKey = (projectId: string) => [
  "charter-versions",
  projectId,
];

export function useCharterVersions(projectId: string) {
  return useQuery({
    queryKey: getCharterVersionsQueryKey(projectId),
    queryFn: () => getCharterVersions({ projectId }),
    enabled: !!projectId,
  });
}
