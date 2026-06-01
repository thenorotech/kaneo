import { useQuery } from "@tanstack/react-query";
import getEsjProjects from "@/fetchers/esj/get-esj-projects";

function useGetEsjProjects({
  workspaceId,
  status,
}: {
  workspaceId: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["esj-projects", workspaceId, status ?? "all"],
    queryFn: () => getEsjProjects({ workspaceId, status }),
    enabled: !!workspaceId,
  });
}

export default useGetEsjProjects;
