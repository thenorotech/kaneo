import { useQuery } from "@tanstack/react-query";
import getEsjRoleAssignments from "@/fetchers/esj/get-esj-role-assignments";

function useGetEsjRoleAssignments(workspaceId: string) {
  return useQuery({
    queryKey: ["esj-role-assignments", workspaceId],
    queryFn: () => getEsjRoleAssignments({ workspaceId }),
    enabled: !!workspaceId,
  });
}

export default useGetEsjRoleAssignments;
