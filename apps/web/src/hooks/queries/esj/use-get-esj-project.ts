import { useQuery } from "@tanstack/react-query";
import getEsjProject from "@/fetchers/esj/get-esj-project";

function useGetEsjProject(projectId: string) {
  return useQuery({
    queryKey: ["esj-project", projectId],
    queryFn: () => getEsjProject(projectId),
    enabled: !!projectId,
  });
}

export default useGetEsjProject;
