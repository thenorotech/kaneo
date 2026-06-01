import { useQuery } from "@tanstack/react-query";
import getEsjMetrics from "@/fetchers/esj/get-esj-metrics";

function useGetEsjMetrics({
  workspaceId,
  designType,
  onlyClosed,
}: {
  workspaceId: string;
  designType?: string;
  onlyClosed?: string;
}) {
  return useQuery({
    queryKey: [
      "esj-metrics",
      workspaceId,
      designType ?? "all",
      onlyClosed ?? "",
    ],
    queryFn: () => getEsjMetrics({ workspaceId, designType, onlyClosed }),
    enabled: !!workspaceId,
  });
}

export default useGetEsjMetrics;
