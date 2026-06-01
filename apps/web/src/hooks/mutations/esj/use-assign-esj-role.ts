import { useMutation, useQueryClient } from "@tanstack/react-query";
import assignEsjRole, {
  type AssignEsjRoleRequest,
} from "@/fetchers/esj/assign-esj-role";

function useAssignEsjRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignEsjRoleRequest) => assignEsjRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["esj-role-assignments", variables.workspaceId],
      });
    },
  });
}

export default useAssignEsjRole;
