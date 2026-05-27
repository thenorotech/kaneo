import { useQuery } from "@tanstack/react-query";
import { getCharterEvents } from "../../../fetchers/macom-charter/get-events";

export const getCharterEventsQueryKey = (projectId: string) => [
  "charter-events",
  projectId,
];

export function useCharterEvents(projectId: string) {
  return useQuery({
    queryKey: getCharterEventsQueryKey(projectId),
    queryFn: () => getCharterEvents({ projectId }),
    enabled: !!projectId,
  });
}
